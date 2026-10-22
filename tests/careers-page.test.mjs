/**
 * 🔴 BUILD-JOBS-01 — /careers must be a real page when there are no vacancies.
 *
 * THE DEFECT THIS FILE EXISTS TO STOP. With zero openings `JobOpenings`
 * rendered an EMPTY `<ul>`. The page kept its "Current openings" heading and
 * then showed nothing at all — indistinguishable, to a visitor, from a page
 * that had failed to load. Allowing the build to succeed on an empty jobs list
 * (see `jobs-content.test.mjs`) is only half a fix; this is the other half.
 *
 * ⚠ WHY THIS RENDERS THE REAL ROUTE RATHER THAN THE COMPONENT IN ISOLATION.
 * Unit-rendering `JobOpenings` would need a JSX toolchain this repo does not
 * have (`npm install` is currently broken by an npm arborist bug), and it
 * would prove nothing about the runtime content layer — which is where the
 * jobs actually come from. Instead a stub backend serves recorded fixtures,
 * `next dev` is pointed at it, and the test asserts on the HTML a browser
 * would receive.
 *
 * 🔴 THE STUB IS THE WHOLE POINT. The live API answers `{"items": []}` today,
 * but these tests must keep passing when the clinic hires again, and must be
 * able to exercise failure modes that cannot be produced against production.
 * No production record is read or written here.
 *
 * ⚠ `NEXT_DIST_DIR` gives this server its own build directory. Sharing
 * `.next` with a dev server the developer already has running corrupts both.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const fixture = (name) =>
  JSON.parse(readFileSync(join(here, "fixtures", `${name}.json`), "utf8"));

const SITE_SETTINGS = fixture("site-settings");
const SERVICES = fixture("services");

const JOBS = [
  {
    slug: "acupuncture-therapist",
    title: "Acupuncture Therapist",
    type: "Full-time",
    branch: "Chikkadpally",
    experience: "2+ years",
    excerpt: "Treat patients across acupuncture and acupressure.",
    responsibilities: ["Assess patients", "Plan a course of treatment"],
    requirements: ["Diploma in Acupuncture", "Two years in practice"],
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
];

/** The exact sentence a visitor must see when nothing is open. */
const NO_OPENINGS_TEXT = "There are currently no openings.";

// ---------------------------------------------------------------------------
// Stub backend
// ---------------------------------------------------------------------------

/**
 * Serves the recorded fixtures, with `/api/jobs` under the test's control.
 *
 * `jobsMode` is read per request rather than captured, so one server can be
 * walked through every scenario without a restart — a restart would mean a
 * second Next compile per case.
 */
function startBackend(state) {
  const server = createServer((req, res) => {
    const path = req.url.split("?")[0];

    if (path === "/api/jobs") {
      const mode = state.jobsMode;
      if (mode === "error") {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
        return;
      }
      if (mode === "unauthorized") {
        res.writeHead(401, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      if (mode === "malformed") {
        // 200 OK with a body that is not a collection envelope.
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ data: "not a list" }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ items: mode === "empty" ? [] : JOBS }));
      return;
    }

    const body =
      path === "/api/site-settings"
        ? SITE_SETTINGS
        : path === "/api/services"
          ? SERVICES
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
// Next server
// ---------------------------------------------------------------------------

const DIST_DIR = ".next-test";

async function freePort() {
  const probe = createServer();
  await new Promise((r) => probe.listen(0, "127.0.0.1", r));
  const { port } = probe.address();
  await new Promise((r) => probe.close(r));
  return port;
}

/**
 * Stops the dev server and everything it forked.
 *
 * ⚠ `child.kill()` alone is not enough on Windows: `next dev` forks
 * `start-server.js`, and killing only the parent leaves that grandchild
 * holding the port, which fails the NEXT run of this file with EADDRINUSE.
 */
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
        // 🔴 Overrides `.env`. Next does not overwrite variables already in
        // `process.env`, so the stub wins and no production endpoint is read.
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
      const res = await fetch(`${base}/careers`, { signal: AbortSignal.timeout(60_000) });
      // 🔴 CONSUME THE BODY. An undici response whose body is never read holds
      // its connection open, and the pool for this origin then has no free
      // slot — so every later request in this file hung indefinitely rather
      // than failing. The status is all this probe needs; the text is read
      // only to release the socket.
      await res.text();
      if (res.status) return { child, base, log: () => log };
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  killTree(child);
  throw new Error(`next dev never answered on ${base}:
${log}`);
}

/**
 * A render of /careers with the Data Cache bypassed.
 *
 * ⚠ D-042 caches every content fetch INDEFINITELY and keyed by tag, so a
 * second request would replay the first scenario's jobs no matter what the
 * stub now returns. A unique query string gives each scenario its own route
 * cache entry; the `cache: "no-store"` is belt and braces for the HTTP layer.
 */
let renderCounter = 0;
async function renderCareers(base) {
  const res = await fetch(`${base}/careers?case=${++renderCounter}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  // Always read the body, even when the status is all that is asserted — an
  // unread body starves undici's connection pool for this origin.
  return { status: res.status, html: await res.text() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("the careers page across every jobs state", { timeout: 600_000 }, async (t) => {
  const state = { jobsMode: "populated" };
  const { server, port } = await startBackend(state);
  const next = await startNext(port);

  t.after(async () => {
    killTree(next.child);
    await new Promise((r) => server.close(r));
    try {
      rmSync(join(root, DIST_DIR), { recursive: true, force: true });
    } catch {
      /* best effort — a locked file on Windows must not fail the run */
    }
  });

  await t.test("renders the openings when the API returns job records", async () => {
    state.jobsMode = "populated";
    const { status, html } = await renderCareers(next.base);
    assert.equal(status, 200);
    assert.ok(html.includes(JOBS[0].title), "the job title must appear");
    assert.ok(html.includes(JOBS[0].experience), "the job details must appear");
    assert.ok(
      !html.includes(NO_OPENINGS_TEXT),
      "the empty state must NOT show while a vacancy is open",
    );
  });

  await t.test("renders the no-openings message when the API returns an empty list", async () => {
    state.jobsMode = "empty";
    const { status, html } = await renderCareers(next.base);
    assert.equal(status, 200, "an empty jobs list is a working page, not an error");
    assert.ok(
      html.includes(NO_OPENINGS_TEXT),
      `expected the page to say "${NO_OPENINGS_TEXT}"`,
    );
    assert.ok(html.includes("check back later"), "and to invite the visitor back");
    // The page must stay useful: the general-application route out survives.
    assert.ok(
      html.includes("general application") || html.includes("General application"),
      "the general-application path must remain available with no openings",
    );
    // And it must not have quietly become a blank page.
    assert.ok(html.includes("Current openings"), "the section heading still renders");
  });

  await t.test("a 500 from the jobs API fails the page, it does not blank it", async () => {
    state.jobsMode = "error";
    const { status, html } = await renderCareers(next.base);
    assert.notEqual(status, 200, "a backend failure must not render as a successful page");
    assert.ok(
      !html.includes(NO_OPENINGS_TEXT),
      "a broken API must never be presented to a visitor as 'no openings'",
    );
  });

  await t.test("an auth failure on the jobs API fails the page", async () => {
    state.jobsMode = "unauthorized";
    const { status, html } = await renderCareers(next.base);
    assert.notEqual(status, 200);
    assert.ok(!html.includes(NO_OPENINGS_TEXT));
  });

  await t.test("a malformed jobs payload fails the page", async () => {
    state.jobsMode = "malformed";
    const { status, html } = await renderCareers(next.base);
    assert.notEqual(status, 200, "a 200 with the wrong shape is still a failure");
    assert.ok(!html.includes(NO_OPENINGS_TEXT));
  });

  await t.test("recovers once the API is healthy again", async () => {
    state.jobsMode = "empty";
    const { status, html } = await renderCareers(next.base);
    assert.equal(status, 200);
    assert.ok(html.includes(NO_OPENINGS_TEXT));
  });
});
