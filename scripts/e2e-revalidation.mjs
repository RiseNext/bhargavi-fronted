#!/usr/bin/env node
/**
 * 🔴 THE TEST THAT PROVES THE WHOLE POINT OF D-042.
 *
 * Every other check in this repository can pass while the thing the owner
 * actually asked for is false. The claim under test is narrow and was, until
 * now, unverifiable: **a CMS edit becomes public without a new deployment.**
 *
 * So this builds the real frontend once, starts it once, and never builds
 * again. Anything that changes on a page after that point changed WITHOUT a
 * deployment, by construction — there is no second build to hide behind.
 *
 * Driven against a mock backend on localhost, not production:
 *   · it can be mutated freely, so publish / edit / unpublish / delete are all
 *     exercised without touching a real patient testimonial;
 *   · it is deterministic, so a failure is a real regression rather than
 *     someone editing content at the wrong moment.
 *
 * 🔴 THE ASSERTION THAT MAKES THIS HONEST is step 2 of each scenario: after
 * changing the mock and BEFORE revalidating, the page must still show the OLD
 * value. Without it, a test that simply re-read the backend on every request
 * would pass — and that would mean the cache was never working, i.e. per-request
 * SSR, which is the performance and SEO regression this design exists to avoid.
 * The test must prove the cache is real before it proves invalidation works.
 *
 * Usage:  node scripts/e2e-revalidation.mjs
 */

import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { createServer } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";

const MOCK_PORT = 4411;
const APP_PORT = 4412;
const SECRET = "e2e-revalidation-secret-not-a-production-value";
const APP = `http://127.0.0.1:${String(APP_PORT)}`;

// ---------------------------------------------------------------------------
// Mutable fixtures — the "database"
// ---------------------------------------------------------------------------

const db = {
  testimonials: [
    { name: "E2E Alpha", quote: "ORIGINAL-ALPHA-QUOTE", when: "a year ago", featured: true },
    { name: "E2E Beta", quote: "ORIGINAL-BETA-QUOTE", when: null, featured: true },
  ],
  faqs: [{ question: "ORIGINAL-FAQ-QUESTION?", answer: "Original answer." }],
  jobs: [
    {
      slug: "e2e-role", title: "ORIGINAL-JOB-TITLE", type: "Full-time",
      branch: "Either branch", experience: "2+ years", excerpt: "x",
      responsibilities: ["a"], requirements: ["b"],
    },
  ],
  services: [
    {
      slug: "e2e-service", title: "ORIGINAL-SERVICE-TITLE", excerpt: "x",
      image: "https://res.cloudinary.com/iojros3g/image/upload/v1/bhw/prod/x.jpg",
      duration: "45 min", treats: ["a"], body: ["b"],
      updatedAt: "2026-10-01T00:00:00.000Z", priceFromPaise: 10000, typicalCourse: "2-4",
    },
  ],
  videos: [{ id: "abcdefghijk", title: "ORIGINAL-VIDEO", translation: null, featured: true }],
  gallery: [{ src: "https://res.cloudinary.com/iojros3g/image/upload/v1/bhw/prod/g.jpg", alt: "ORIGINAL-ALT" }],
  stats: [
    { value: 8, suffix: "+", label: "Years of expertise", heroLabel: "Years practising", showInHero: true },
  ],
  contentLists: [
    { collection: "about_story", title: null, text: "ORIGINAL-ABOUT-STORY", icon: null, step: null },
    { collection: "achievements", title: null, text: "ORIGINAL-ACHIEVEMENT", icon: null, step: null },
    { collection: "philosophy", title: "ORIGINAL-PHILOSOPHY", text: "p", icon: null, step: null },
    { collection: "why_choose_us", title: "ORIGINAL-WHY", text: "w", icon: "leaf", step: null },
    { collection: "process", title: "ORIGINAL-PROCESS", text: "pr", icon: null, step: 1 },
  ],
  posts: [],
};

const routes = () => ({
  "/api/site-settings": { stats: db.stats },
  "/api/services": { items: db.services },
  "/api/testimonials": { items: db.testimonials },
  "/api/videos": { items: db.videos },
  "/api/gallery": { items: db.gallery },
  "/api/faqs": { items: db.faqs },
  "/api/jobs": { items: db.jobs },
  "/api/content-lists": { items: db.contentLists },
  "/api/posts": { items: db.posts, total: db.posts.length },
});

function startMock() {
  const server = createServer((req, res) => {
    const path = (req.url ?? "").split("?")[0] ?? "";
    const table = routes();
    let body = table[path];
    // Post detail reads.
    if (body === undefined && path.startsWith("/api/posts/")) {
      const slug = decodeURIComponent(path.slice("/api/posts/".length));
      body = db.posts.find((p) => p.slug === slug);
      if (!body) { res.writeHead(404).end("{}"); return; }
    }
    if (body === undefined) { res.writeHead(404).end("{}"); return; }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  });
  return new Promise((resolve) => server.listen(MOCK_PORT, "127.0.0.1", () => resolve(server)));
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let failures = 0;
let checks = 0;

function check(ok, label) {
  checks += 1;
  if (ok) { process.stdout.write(`    ✅ ${label}\n`); }
  else { failures += 1; process.stdout.write(`    🔴 FAIL ${label}\n`); }
}

async function page(path) {
  const res = await fetch(`${APP}${path}`, { cache: "no-store" });
  return { status: res.status, html: await res.text() };
}

async function revalidate(tags, secret = SECRET) {
  const res = await fetch(`${APP}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify({ tags }),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { env: { ...process.env, ...env }, shell: true, stdio: "pipe" });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${String(code)}\n${out}`))));
  });
}

/**
 * One full lifecycle for a collection.
 *
 * `edit` mutates the mock; `probe` is the page and the string that must appear.
 */
async function lifecycle({ label, path, tag, originalText, newText, edit, remove }) {
  process.stdout.write(`\n  ${label}\n`);

  const before = await page(path);
  check(before.status === 200 && before.html.includes(originalText),
    `baseline: "${originalText}" is public`);

  edit();

  // 🔴 The cache must still be serving the old value.
  const stale = await page(path);
  check(stale.html.includes(originalText) && !stale.html.includes(newText),
    "after the edit but BEFORE revalidation, the page still shows the OLD value (cache is real)");

  const rv = await revalidate([tag]);
  check(rv.status === 200 && Array.isArray(rv.body.revalidated) && rv.body.revalidated.includes(tag),
    `revalidate(${tag}) -> 200 and confirms the tag`);

  const after = await page(path);
  check(after.html.includes(newText),
    `🔴 the EDIT is public with NO rebuild: "${newText}" appears`);
  check(!after.html.includes(originalText),
    "the old value is gone");

  if (remove) {
    remove();
    await revalidate([tag]);
    const gone = await page(path);
    check(!gone.html.includes(newText),
      `🔴 UNPUBLISH/DELETE is public with NO rebuild: "${newText}" is gone`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const mock = await startMock();
process.stdout.write(`mock backend on :${String(MOCK_PORT)}\n`);

const env = {
  BACKEND_URL: `http://127.0.0.1:${String(MOCK_PORT)}`,
  REVALIDATE_SECRET: SECRET,
  NEXT_PUBLIC_SITE_URL: APP,
};

/*
 * 🔴 Clear `.next` first, and specifically its cache.
 *
 * Next persists the Data Cache (fetch results) under `.next/cache` ACROSS
 * builds, so re-running this suite rebuilt against the PREVIOUS run's final
 * mutated fixtures - deleted testimonials, edited labels. Fourteen baseline
 * assertions failed on the second run while the first had passed. A test whose
 * result depends on whether it has been run before is worse than no test: it
 * trains you to re-run until it goes green.
 */
rmSync(new URL("../.next", import.meta.url), { recursive: true, force: true });

process.stdout.write("building the frontend ONCE against the mock (no prebuild)…\n");
// `next build` directly: `prebuild` would regenerate the committed content
// files, which this test deliberately does not exercise.
await run("npx", ["next", "build"], env);
process.stdout.write("build done — from here on there is NO second build\n");

/*
 * ⚠ Spawned WITHOUT a shell, and via Next's own binary.
 *
 * `spawn("npx", …, { shell: true })` puts a shell between this process and the
 * server, so `app.kill()` kills the shell and leaves `next start` holding the
 * port. The run then completed all its checks and hung on exit with its output
 * still buffered — a green test that looks like a hang, which in CI is
 * indistinguishable from a failure.
 */
const NEXT_BIN = new URL("../node_modules/next/dist/bin/next", import.meta.url);
const app = spawn(process.execPath, [NEXT_BIN.pathname.replace(/^\//, ""), "start", "-p", String(APP_PORT)], {
  env: { ...process.env, ...env }, stdio: "pipe",
});
let appLog = "";
app.stdout.on("data", (d) => (appLog += d));
app.stderr.on("data", (d) => (appLog += d));
for (let i = 0; i < 60 && !/Ready/.test(appLog); i++) await sleep(500);
process.stdout.write(`app on :${String(APP_PORT)}\n`);

try {
  // -- unauthorised revalidation must change nothing ------------------------
  process.stdout.write("\n  unauthorised revalidation\n");
  const noSecret = await revalidate(["testimonials"], "");
  check(noSecret.status === 401, "no secret -> 401");
  const wrong = await revalidate(["testimonials"], "wrong-secret");
  check(wrong.status === 401, "wrong secret -> 401");
  const unknown = await revalidate(["not-a-real-tag"]);
  check(unknown.status === 422, "valid secret, unknown tag -> 422 (rejected, not ignored)");

  db.testimonials[0].quote = "SNEAKY-SHOULD-NOT-APPEAR";
  const afterUnauth = await page("/testimonials");
  check(!afterUnauth.html.includes("SNEAKY-SHOULD-NOT-APPEAR"),
    "🔴 an unauthorised caller cannot force content to change");
  db.testimonials[0].quote = "ORIGINAL-ALPHA-QUOTE";
  await revalidate(["testimonials"]);

  // -- per-collection lifecycles -------------------------------------------
  await lifecycle({
    label: "testimonials · /testimonials",
    path: "/testimonials", tag: "testimonials",
    originalText: "ORIGINAL-ALPHA-QUOTE", newText: "EDITED-ALPHA-QUOTE",
    edit: () => { db.testimonials[0].quote = "EDITED-ALPHA-QUOTE"; },
    remove: () => { db.testimonials.shift(); },
  });

  await lifecycle({
    label: "faqs · / (homepage accordion + FAQPage JSON-LD)",
    path: "/", tag: "faqs",
    originalText: "ORIGINAL-FAQ-QUESTION?", newText: "EDITED-FAQ-QUESTION?",
    edit: () => { db.faqs[0].question = "EDITED-FAQ-QUESTION?"; },
    remove: () => { db.faqs.length = 0; },
  });

  await lifecycle({
    label: "jobs · /careers",
    path: "/careers", tag: "jobs",
    originalText: "ORIGINAL-JOB-TITLE", newText: "EDITED-JOB-TITLE",
    edit: () => { db.jobs[0].title = "EDITED-JOB-TITLE"; },
    remove: () => { db.jobs.length = 0; },
  });

  await lifecycle({
    label: "services · /services",
    path: "/services", tag: "services",
    originalText: "ORIGINAL-SERVICE-TITLE", newText: "EDITED-SERVICE-TITLE",
    edit: () => { db.services[0].title = "EDITED-SERVICE-TITLE"; },
  });

  await lifecycle({
    label: "videos · /videos",
    path: "/videos", tag: "videos",
    originalText: "ORIGINAL-VIDEO", newText: "EDITED-VIDEO",
    edit: () => { db.videos[0].title = "EDITED-VIDEO"; },
    remove: () => { db.videos.length = 0; },
  });

  await lifecycle({
    label: "gallery · /gallery",
    path: "/gallery", tag: "gallery",
    originalText: "ORIGINAL-ALT", newText: "EDITED-ALT",
    edit: () => { db.gallery[0].alt = "EDITED-ALT"; },
  });

  await lifecycle({
    label: "content_lists · /about (philosophy)",
    path: "/about", tag: "content-lists",
    originalText: "ORIGINAL-PHILOSOPHY", newText: "EDITED-PHILOSOPHY",
    edit: () => {
      const row = db.contentLists.find((c) => c.collection === "philosophy");
      if (row) row.title = "EDITED-PHILOSOPHY";
    },
  });

  await lifecycle({
    label: "statistics · / (hero, D-023 heroLabel)",
    path: "/", tag: "site-settings",
    originalText: "Years practising", newText: "EDITED-HERO-LABEL",
    edit: () => { db.stats[0].heroLabel = "EDITED-HERO-LABEL"; },
  });

  // -- review-driven: isolation, metadata and multi-page propagation -------
  //
  // Added during the Tranche 1 diff review. Each closes a gap the per-collection
  // lifecycles above cannot see.

  process.stdout.write("\n  cross-tag ISOLATION\n");
  // 🔴 "Changes to one item must not accidentally remove unrelated items."
  // A tag that over-invalidates, or a reader that shares a cache entry it
  // should not, would surface here and nowhere else in this suite.
  db.services[0] = { ...db.services[0], title: "ISOLATION-SERVICE" };
  db.testimonials.push({
    name: "E2E Gamma", quote: "ISOLATION-WITNESS-QUOTE", when: null, featured: true,
  });
  await revalidate(["services"]);
  const witnessPage = await page("/testimonials");
  check(!witnessPage.html.includes("ISOLATION-WITNESS-QUOTE"),
    "revalidating `services` does NOT pull in an unrevalidated testimonial");
  const servicesPage = await page("/services");
  check(servicesPage.html.includes("ISOLATION-SERVICE"),
    "...while `services` itself did update");
  await revalidate(["testimonials"]);
  check((await page("/testimonials")).html.includes("ISOLATION-WITNESS-QUOTE"),
    "the testimonial appears only once ITS own tag is revalidated");

  process.stdout.write("\n  multi-page propagation on ONE tag\n");
  // `faqs` feeds /, /contact and /services. One revalidation must reach all
  // three — a reader that accidentally held per-route state would not.
  db.faqs.push({ question: "MULTIPAGE-FAQ-QUESTION?", answer: "Shared answer." });
  await revalidate(["faqs"]);
  for (const path of ["/", "/contact", "/services"]) {
    const p2 = await page(path);
    check(p2.html.includes("MULTIPAGE-FAQ-QUESTION?"),
      `one revalidate(faqs) updated ${path}`);
  }

  process.stdout.write("\n  metadata and JSON-LD freshness\n");
  // 🔴 `generateMetadata` and the structured data were the two places this
  // migration could leave stale: both used to read module-scope constants.
  // `FAQPage` JSON-LD and the `<title>` are what a search engine sees, so a
  // page whose visible copy updates while its metadata does not is worse than
  // one that is uniformly stale.
  const faqLd = await page("/");
  check(/"@type":\s*"FAQPage"/.test(faqLd.html) && faqLd.html.includes("MULTIPAGE-FAQ-QUESTION?"),
    "FAQPage JSON-LD on / carries the revalidated question");

  db.services[0] = { ...db.services[0], title: "METADATA-SERVICE-TITLE" };
  await revalidate(["services"]);
  const serviceDetail = await page("/services/e2e-service");
  check(/<title>[^<]*METADATA-SERVICE-TITLE/.test(serviceDetail.html),
    "🔴 generateMetadata's <title> reflects the edit after revalidation");
  check(serviceDetail.html.includes("METADATA-SERVICE-TITLE"),
    "...and so does the rendered page body");

  // -- blog: publish a NEW post, which needs dynamicParams = true ----------
  process.stdout.write("\n  blog posts · publishing a NEW post (dynamicParams = true)\n");
  const post = {
    slug: "e2e-new-post", title: "BRAND-NEW-POST", excerpt: "e", cover: null,
    author: "A", tags: [], publishedAt: "2026-10-10T00:00:00.000Z",
    readingMinutes: 3, updatedAt: "2026-10-10T00:00:00.000Z",
    seoTitle: null, seoDescription: null, blocks: [],
  };
  db.posts.push(post);
  await revalidate(["posts"]);
  const listing = await page("/blog");
  check(listing.html.includes("BRAND-NEW-POST"),
    "🔴 a newly published post appears on /blog with NO rebuild");
  const detail = await page("/blog/e2e-new-post");
  check(detail.status === 200 && detail.html.includes("BRAND-NEW-POST"),
    "🔴 its detail page renders 200 with NO rebuild — this is what dynamicParams=true buys");

  db.posts.length = 0;
  await revalidate(["posts"]);
  const goneList = await page("/blog");
  check(!goneList.html.includes("BRAND-NEW-POST"), "deleted post is gone from /blog");
  const goneDetail = await page("/blog/e2e-new-post");
  check(goneDetail.status === 404, "deleted post's detail page is a genuine 404");

  // -- an unpublished service's URL must 404, not render stale -------------
  process.stdout.write("\n  unpublish safety · a withdrawn service's own URL\n");
  const live = await page("/services/e2e-service");
  check(live.status === 200, "baseline: the service page renders");
  db.services.length = 0;
  await revalidate(["services"]);
  const withdrawn = await page("/services/e2e-service");
  check(withdrawn.status === 404,
    "🔴 an unpublished service's prerendered page becomes a 404, not stale content");
} finally {
  app.kill("SIGKILL");
  mock.close();
}

process.stdout.write(`\n${String(checks - failures)}/${String(checks)} checks passed\n`);
if (failures > 0) {
  process.stdout.write(`🔴 ${String(failures)} FAILED\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("✅ CMS edits, publishes, unpublishes and deletes all reached the public\n");
  process.stdout.write("   pages with NO rebuild — one build, at the start, and never again.\n");
}
