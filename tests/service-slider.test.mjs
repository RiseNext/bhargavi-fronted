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
/** A third service whose collection one test sets to exactly one slide. */
const WITH_SINGLE = "acupressure";

/**
 * The collection served for `WITH_SINGLE`, mutable between navigations.
 *
 * `undefined` means the service is served exactly as the fixture has it — no
 * `images` key at all — which is what the API sends for a service nobody has
 * built a collection for.
 */
const single = { images: undefined };

function servicesPayload() {
  const items = SERVICES_FIXTURE.items.map((s) => {
    if (s.slug === WITH_SLIDER) return { ...s, images: SLIDES };
    if (s.slug === WITH_SINGLE && single.images !== undefined) {
      return { ...s, images: single.images };
    }
    return s;
  });
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

/**
 * 🔴 THE RENDERED GEOMETRY OF EVERY SLIDE.
 *
 * `readState` above reads the accessibility surface — dot count, which dot is
 * current, the live-region text. All of that was perfectly correct while the
 * slider showed a BLANK frame in production, because the defect was a CSS
 * position collapse and not a state error: slide 0 carried `i === 0 &&
 * "static"`, Tailwind emits `.static` after `.absolute`, so `position: static`
 * won, `inset-0` stopped applying, and the slide collapsed to the 4px of its
 * own edge while the arrows and dots kept rendering perfectly.
 *
 * Measured on production before the fix: slide 0 `position: static`, box
 * 1207×4, image box 1203×0; slide 1 a correct 1207×679.
 *
 * ⚠ This works with image requests ABORTED, which is why it belongs in this
 * harness. A `fill` image is absolutely positioned at 100%/100% whether or not
 * its bytes ever arrive, so the box is a pure layout fact and the test needs
 * no network and no real asset.
 */
function readGeometry(page) {
  return page.evaluate(() => {
    const region = document.querySelector('[aria-roledescription="carousel"]');
    if (!region) return { present: false };
    const stack = region.firstElementChild;
    const stackBox = stack.getBoundingClientRect();
    return {
      present: true,
      stack: { width: Math.round(stackBox.width), height: Math.round(stackBox.height) },
      slides: [...stack.children].map((el) => {
        const box = el.getBoundingClientRect();
        const img = el.querySelector("img");
        const imgBox = img ? img.getBoundingClientRect() : null;
        return {
          position: getComputedStyle(el).position,
          opacity: Number(getComputedStyle(el).opacity),
          width: Math.round(box.width),
          height: Math.round(box.height),
          imgHeight: imgBox ? Math.round(imgBox.height) : null,
          imgWidth: imgBox ? Math.round(imgBox.width) : null,
        };
      }),
    };
  });
}

/** Asserts the slide at `active` actually occupies the slider's box. */
function assertActiveSlideFillsBox(geometry, active, where) {
  assert.equal(geometry.present, true, `${where}: expected a carousel`);
  assert.ok(geometry.stack.height > 100, `${where}: the stack collapsed to ${String(geometry.stack.height)}px`);

  for (const [i, slide] of geometry.slides.entries()) {
    // Not one of them may be `static`: that is the exact defect, and it is
    // worth failing on the cause as well as on the symptom.
    assert.notEqual(
      slide.position,
      "static",
      `${where}: slide ${String(i)} is position:static, so inset-0 does not apply and it collapses`,
    );
    // Every slide is stacked on the same box, visible or not, because they
    // cross-fade. A zero-height slide is the bug whichever one it is.
    assert.ok(
      slide.height > 100,
      `${where}: slide ${String(i)} box is ${String(slide.width)}x${String(slide.height)}`,
    );
    assert.ok(
      slide.imgHeight !== null && slide.imgHeight > 100,
      `${where}: slide ${String(i)} image box is ${String(slide.imgWidth)}x${String(slide.imgHeight)}`,
    );
  }

  const shown = geometry.slides[active];
  assert.ok(shown, `${where}: no slide at index ${String(active)}`);
  assert.equal(shown.opacity, 1, `${where}: slide ${String(active)} is not the visible one`);
  // Within a pixel of the container: the visible frame must BE the frame.
  assert.ok(
    Math.abs(shown.height - geometry.stack.height) <= 2,
    `${where}: visible slide is ${String(shown.height)}px inside a ${String(geometry.stack.height)}px box`,
  );
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

    await t.test("🔴 the visible slide actually fills the frame — no blank slide", async () => {
      // The production defect: arrows and dots correct, image area empty.
      assertActiveSlideFillsBox(await readGeometry(page), 1, "on load");
    });

    await t.test("🔴 EVERY slide fills the frame, index 0 included", async () => {
      // Index 0 is the one that collapsed, and it is the opening frame of
      // every collection that has not chosen a different main image — so the
      // default state of the feature was the broken one. Stepping through all
      // three indices is what makes that impossible to reintroduce.
      for (let i = 0; i < SLIDES.length; i += 1) {
        await clickDot(page, i);
        await settle(200);
        const state = await readState(page);
        assert.equal(state.current, i, `dot ${String(i)} did not become current`);
        assertActiveSlideFillsBox(await readGeometry(page), i, `slide ${String(i)} active`);
      }

      // ⚠ Put the slider back on the opening slide before leaving.
      //
      // The arrow cases below run in sequence from the state this leaves, and
      // assert absolute indices: inserting a case that walks the dots and
      // stops on the last one silently moved their starting point and failed
      // three of them. Restoring is cheaper than making every later case
      // re-establish its own position.
      await clickDot(page, 1);
      await settle(200);
      assert.equal((await readState(page)).current, 1, "failed to restore the opening slide");
    });

    await t.test("the frame keeps one height across every slide", async () => {
      // A slider that resizes the page as it advances is its own defect: the
      // container owns the aspect ratio precisely so it cannot.
      const heights = [];
      for (let i = 0; i < SLIDES.length; i += 1) {
        await clickDot(page, i);
        await settle(200);
        heights.push((await readGeometry(page)).stack.height);
      }
      assert.equal(
        new Set(heights).size,
        1,
        `the frame changed height between slides: ${heights.join(", ")}`,
      );

      // Same reason as above: leave the sequence where the next case expects it.
      await clickDot(page, 1);
      await settle(200);
      assert.equal((await readState(page)).current, 1, "failed to restore the opening slide");
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

    await t.test("🔴 a slide whose image never loads still holds its frame", async () => {
      /*
       * Every image request in this suite is aborted, so EVERY slide here is
       * already the "image failed to load" case — which is the point. A frame
       * that depended on its bytes to have a size would collapse, and that is
       * how a single dead Cloudinary asset would otherwise blank one slide of
       * an otherwise healthy slider.
       *
       * What a visitor sees instead is `Frame`'s own `bg-sand` panel at the
       * correct size: a quiet gap in a photo strip rather than a broken-image
       * icon or a collapsed layout. Deliberately NOT silently dropping the
       * slide — the dots would then disagree with the collection the owner
       * saved, and a missing asset is something they should be able to see.
       */
      await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 });
      const geometry = await readGeometry(page);
      assertActiveSlideFillsBox(geometry, 1, "with no image bytes at all");
      for (const [i, slide] of geometry.slides.entries()) {
        assert.ok(
          slide.imgHeight > 100,
          `slide ${String(i)} lost its box when the image failed: ${String(slide.imgHeight)}px`,
        );
      }
      // And it must not have thrown.
      assert.deepEqual(consoleErrors, [], "a failed image must not raise a page error");
    });

    await t.test("🔴 a one-slide collection renders a plain frame, not a carousel", async () => {
      // The degradation guarantee from the other direction: a collection of
      // one must be indistinguishable from the single image the page had
      // before the feature existed — no arrows, no dots, no timer.
      single.images = [SLIDES[0]];
      try {
        await page.goto(`${next.base}/services/${WITH_SINGLE}`, {
          waitUntil: "networkidle2",
          timeout: 120_000,
        });
        const state = await readState(page);
        assert.equal(state.present, false, "one slide must not render a carousel");
        const html = await page.content();
        assert.ok(!html.includes("Next image"), "no arrows expected for one slide");
        assert.ok(!html.includes("Show image 1 of"), "no dots expected for one slide");
        assert.ok(html.includes(SLIDES[0].alt), "the single slide's own alt text must render");
      } finally {
        single.images = undefined;
      }
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
