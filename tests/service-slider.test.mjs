/**
 * D-044 — the image slider, driven in a real browser.
 *
 * ⚠ WHY A BROWSER AND NOT A RENDERER. Autoplay, arrows, dots, keyboard and
 * `prefers-reduced-motion` are all behaviour, not markup: a server-rendered
 * HTML assertion cannot tell whether the next arrow actually advances. This
 * repo already drives real Chrome for `npm run audit:responsive`, so the
 * tooling is the in-house one rather than a new dependency.
 *
 * 🔴 THE STUB BACKEND IS THE WHOLE POINT. No production record is read or
 * written. `/api/services` is served from the recorded fixture with slider
 * images INJECTED into one service and deliberately absent from another, which
 * is how the two requirements that matter most are proved together:
 *
 *   · a service with a collection renders its own slides, and
 *   · a service with none renders exactly the single image it always did.
 *
 * The same harness as `careers-page.test.mjs`: its own `NEXT_DIST_DIR` so it
 * cannot corrupt a developer's running `.next`, and `taskkill /t` so Windows
 * does not leave the forked dev server holding the port.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DIST_DIR = ".next-slider-test";

const fixture = (name) =>
  JSON.parse(readFileSync(join(here, "fixtures", `${name}.json`), "utf8"));

const SITE_SETTINGS = fixture("site-settings");
const SERVICES_FIXTURE = fixture("services");

/** Three slides, with the MIDDLE one chosen as the main image. */
const SLIDES = [
  { src: "https://res.cloudinary.com/demo/image/upload/slide-one.jpg", alt: "Slide one alt" },
  {
    src: "https://res.cloudinary.com/demo/image/upload/slide-two.jpg",
    alt: "Slide two alt",
    isDefault: true,
  },
  { src: "https://res.cloudinary.com/demo/image/upload/slide-three.jpg", alt: "Slide three alt" },
];

/** The service that gets a collection, and the one that deliberately does not. */
const WITH_SLIDER = "acupuncture";
const WITHOUT_SLIDER = "panchakarma";

function servicesPayload() {
  const items = SERVICES_FIXTURE.items.map((s) =>
    s.slug === WITH_SLIDER ? { ...s, images: SLIDES } : s,
  );
  return { items };
}

// ---------------------------------------------------------------------------
// Stub backend
// ---------------------------------------------------------------------------

function startBackend() {
  const server = createServer((req, res) => {
    const path = req.url.split("?")[0];
    const body =
      path === "/api/site-settings"
        ? SITE_SETTINGS
        : path === "/api/services"
          ? servicesPayload()
          : { items: [] };

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

// ---------------------------------------------------------------------------
// Next dev server
// ---------------------------------------------------------------------------

async function freePort() {
  const probe = createServer();
  await new Promise((r) => probe.listen(0, "127.0.0.1", r));
  const { port } = probe.address();
  await new Promise((r) => probe.close(r));
  return port;
}

function killTree(child) {
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

async function startNext(backendPort) {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    [join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--port", String(port)],
    {
      cwd: root,
      env: {
        ...process.env,
        // Overrides `.env.local`: Next does not overwrite an existing
        // process.env value, so the stub wins and nothing real is contacted.
        BACKEND_URL: `http://127.0.0.1:${backendPort}`,
        BACKEND_API_KEY: "test-key",
        NEXT_DIST_DIR: DIST_DIR,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let log = "";
  child.stdout.on("data", (d) => (log += d.toString()));
  child.stderr.on("data", (d) => (log += d.toString()));

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/services/${WITH_SLIDER}`, {
        signal: AbortSignal.timeout(60_000),
      });
      // Consume the body: an unread undici body holds its socket and starves
      // the pool for this origin, hanging every later request in the file.
      await res.text();
      if (res.status) return { child, base, log: () => log };
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  killTree(child);
  throw new Error(`next dev never answered on ${base}:\n${log}`);
}

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

/** The slider's observable state, read from the accessibility surface. */
function readState(page) {
  return page.evaluate(() => {
    const region = document.querySelector('[aria-roledescription="carousel"]');
    if (!region) return { present: false };
    const dots = [...region.querySelectorAll("button[aria-label^='Show image']")];
    return {
      present: true,
      dotCount: dots.length,
      current: dots.findIndex((d) => d.getAttribute("aria-current") === "true"),
      status: region.querySelector("[aria-live]")?.textContent ?? "",
      arrows: region.querySelectorAll("button[class*='absolute']").length,
    };
  });
}

const clickNext = (page) =>
  page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("Next image"))?.click();
  });

const clickPrev = (page) =>
  page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("Previous image"))?.click();
  });

const clickDot = (page, i) =>
  page.evaluate((index) => {
    document
      .querySelectorAll("button[aria-label^='Show image']")
      [index]?.click();
  }, i);

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------

test("the image slider, in a real browser", async (t) => {
  if (!existsSync(CHROME)) {
    t.skip(`Chrome not found at ${CHROME}`);
    return;
  }

  const backend = await startBackend();
  const next = await startNext(backend.port);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  // Images point at a demo Cloudinary host; blocking them keeps the test off
  // the network and off any real asset without changing the DOM under test.
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.resourceType() === "image") void req.abort();
    else void req.continue();
  });

  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  try {
    const url = `${next.base}/services/${WITH_SLIDER}`;

    await t.test("renders one slide per saved image, with dots", async () => {
      // 🔴 MANUAL NAVIGATION IS TESTED WITH AUTOPLAY OFF, via reduced motion.
      //
      // Otherwise the 6-second timer ticks in the middle of these assertions:
      // the first draft of this file read "expected 0, got 1" here because an
      // autoplay tick landed between a dot click and the assertion after it.
      // Pinning the slider still is the only way these cases assert the
      // control under test rather than a race. Autoplay gets its own page
      // below, where advancing on its own is the thing being measured.
      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 });
      const state = await readState(page);
      assert.equal(state.present, true, "expected a carousel region");
      assert.equal(state.dotCount, SLIDES.length);
    });

    await t.test("🔴 opens on the admin-chosen main image, not the first", async () => {
      // The whole point of `is_default`: the owner picked slide two.
      const state = await readState(page);
      assert.equal(state.current, 1);
      assert.match(state.status, /Image 2 of 3/);
    });

    await t.test("the next arrow advances", async () => {
      await clickNext(page);
      await settle(150);
      assert.equal((await readState(page)).current, 2);
    });

    await t.test("the next arrow wraps from the last slide to the first", async () => {
      await clickNext(page);
      await settle(150);
      assert.equal((await readState(page)).current, 0);
    });

    await t.test("🔴 the previous arrow wraps backwards without breaking", async () => {
      // The modulo-sign bug would land on -1 here and render nothing.
      await clickPrev(page);
      await settle(150);
      assert.equal((await readState(page)).current, 2);
    });

    await t.test("clicking a dot jumps to that slide", async () => {
      await clickDot(page, 0);
      await settle(150);
      assert.equal((await readState(page)).current, 0);
      await clickDot(page, 1);
      await settle(150);
      assert.equal((await readState(page)).current, 1);
    });

    await t.test("the keyboard arrows move between slides", async () => {
      // Position with the in-page click (proved to work above), then take
      // FOCUS separately.
      //
      // ⚠ `page.focus()`, not `page.click()`. The arrows are scoped to focus
      // inside the widget — the standard carousel contract — so the keypress
      // needs a focused element inside the region, and a programmatic
      // `element.click()` does not move focus. A real `page.click()` would
      // give focus, but it auto-scrolls the dot to the top of the viewport
      // where this site's STICKY HEADER wins the hit-test, so the click never
      // reaches the dot. `focus()` needs no hit-testing and is exactly the
      // precondition under test.
      await clickDot(page, 0);
      await settle(150);
      assert.equal((await readState(page)).current, 0);

      await page.focus('button[aria-label^="Show image 1 "]');
      await page.keyboard.press("ArrowRight");
      await settle(150);
      assert.equal((await readState(page)).current, 1);

      await page.keyboard.press("ArrowLeft");
      await settle(150);
      assert.equal((await readState(page)).current, 0);
    });

    await t.test("advances on its own", async () => {
      // Motion re-enabled, and a fresh load so nothing inside the slider holds
      // focus — a focused dot keeps the slideshow paused, which is itself
      // correct behaviour and is covered by the manual cases above.
      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "no-preference" },
      ]);
      await page.goto(`${url}?autoplay=1`, { waitUntil: "networkidle2", timeout: 120_000 });
      const before = (await readState(page)).current;
      await settle(7500); // AUTOPLAY_MS is 6000.
      const after = (await readState(page)).current;
      assert.notEqual(after, before, "expected the slider to advance on its own");
    });

    await t.test("🔴 does not autoplay under prefers-reduced-motion", async () => {
      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
      await page.goto(`${url}?reduced=1`, { waitUntil: "networkidle2", timeout: 120_000 });
      const before = (await readState(page)).current;
      await settle(7500);
      const after = (await readState(page)).current;
      assert.equal(after, before, "reduced motion must disable autoplay");

      // Manual control must still work — the preference is about unrequested
      // motion, not about taking navigation away.
      await clickNext(page);
      await settle(150);
      assert.notEqual((await readState(page)).current, before);

      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "no-preference" },
      ]);
    });

    await t.test("🔴 a service with no collection shows no slider controls", async () => {
      // The backward-compatibility guarantee, observed rather than assumed:
      // this page must look exactly as it did before the feature existed.
      await page.goto(`${next.base}/services/${WITHOUT_SLIDER}`, {
        waitUntil: "networkidle2",
        timeout: 120_000,
      });
      const state = await readState(page);
      assert.equal(state.present, false, "a single image must not render a carousel");

      const html = await page.content();
      assert.ok(!html.includes("Show image 1 of"), "no dots expected");
      assert.ok(!html.includes("Next image"), "no arrows expected");
    });

    await t.test("existing service content is untouched", async () => {
      const text = await page.evaluate(() => document.body.innerText);
      const service = SERVICES_FIXTURE.items.find((s) => s.slug === WITHOUT_SLIDER);
      assert.ok(text.includes(service.title), "service title missing");
      assert.ok(text.includes(service.duration), "session length missing");
      // ⚠ The meta row renders the LABEL and the VALUE as separate elements —
      // "FROM" above "₹100" — so the assertion is on the rupee amount, not on
      // the `priceFrom` display string that produced it.
      if (service.priceFromPaise !== null) {
        const rupees = service.priceFromPaise / 100;
        assert.ok(text.includes(`₹${String(rupees)}`), "price missing");
      }
      if (service.typicalCourse !== null) {
        assert.ok(text.includes(service.typicalCourse), "typical course missing");
      }
    });

    await t.test("the home hero keeps the founder overlay and its own content", async () => {
      // 🔴 The founder portrait is NOT part of the slider and must survive it,
      // together with the name, role and qualifications chip.
      await page.goto(next.base, { waitUntil: "networkidle2", timeout: 120_000 });
      const text = await page.evaluate(() => document.body.innerText);
      const f = SITE_SETTINGS.founder;
      assert.ok(text.includes(f.name), "founder name missing from the hero");
      assert.ok(text.includes(f.role), "founder role missing from the hero");
      // ⚠ Compared case-insensitively. The credential line is styled
      // `uppercase`, and `innerText` reports text as RENDERED, so the stored
      // "M.A., B.Ed." arrives as "M.A., B.ED." — a styling difference, not
      // missing content.
      assert.ok(
        text.toLowerCase().includes(f.qualifications.toLowerCase()),
        "founder qualifications missing",
      );
      assert.match(text, /Wellness/, "hero headline missing");
    });

    await t.test("no page errors were raised", () => {
      assert.deepEqual(consoleErrors, []);
    });
  } finally {
    await browser.close().catch(() => undefined);
    killTree(next.child);
    await new Promise((r) => backend.server.close(r));
    // The test's own build directory is disposable; leaving it behind would
    // confuse the next run's incremental compile.
    rmSync(join(root, DIST_DIR), { recursive: true, force: true });
  }
});
