/**
 * 🔴 BUILD-JOBS-01 — zero vacancies must be a publishable state.
 *
 * THE FAILURE THIS FILE EXISTS TO STOP. The owner closed the last vacancy in
 * the admin panel. `GET /api/jobs` then answered, correctly, `{"items": []}`.
 * The generator's required-collection list demanded at least one job, so the
 * next Vercel build died with
 *
 *     Content generation FAILED. jobs is empty — the live site has content here.
 *
 * and the site could not be deployed at all until a vacancy was invented. The
 * tests below pin BOTH halves of the fix: an empty jobs list is accepted, and
 * every other way the jobs endpoint can go wrong is still fatal.
 *
 * ⚠ Node's built-in runner, no test framework. `npm install` currently fails
 * on this machine with an npm arborist bug ("Cannot read properties of null
 * reading edgesOut"), and a build fix is the wrong moment to go repairing the
 * dependency tree. `node --test` needs nothing.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertUsable,
  createFetcher,
  emitCareers,
  fetchContent,
} from "../scripts/generate-content.mjs";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const JOB = {
  slug: "acupuncture-therapist",
  title: "Acupuncture Therapist",
  type: "Full-time",
  branch: "Chikkadpally",
  experience: "2+ years",
  excerpt: "Treat patients across acupuncture and acupressure.",
  responsibilities: ["Assess patients", "Plan treatment"],
  requirements: ["Diploma in Acupuncture"],
  updatedAt: "2026-10-01T00:00:00.000Z",
};

/** One row, enough to satisfy the collection-is-non-empty checks. */
const row = (extra = {}) => ({ updatedAt: "2026-10-01T00:00:00.000Z", ...extra });

/**
 * The smallest `content` object `assertUsable` accepts. Built fresh per test
 * so a mutation in one case cannot leak into the next.
 */
function validContent(overrides = {}) {
  return {
    settings: {
      name: "Bhargavi Health World",
      shortName: "Bhargavi",
      email: "bhargavihealthworld@gmail.com",
      priceRange: "100-1000",
      tagline: "Wellness Center in Chikkadpally",
      description: "Holistic wellness care in Chikkadpally, Hyderabad.",
      whatsapp: { href: "https://api.whatsapp.com/send?phone=+917075157013" },
      phones: [
        { label: "+91 70751 57013", href: "tel:+917075157013", branch: "Bowenpally" },
      ],
      stats: [row()],
      resolution: { missingRequired: [], missingMedia: [] },
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
    services: [row()],
    testimonials: [row()],
    videos: [row()],
    gallery: [row()],
    faqs: [row()],
    jobs: [JOB],
    contentLists: [row()],
    contentBlocks: [row()],
    pageMeta: [row()],
    posts: [],
    ...overrides,
  };
}

/** Asserts `assertUsable` throws, and that the message names the real cause. */
function refuses(content, ...fragments) {
  assert.throws(
    () => {
      assertUsable(content);
    },
    (err) => {
      for (const fragment of fragments) {
        assert.ok(
          err.message.includes(fragment),
          `expected the refusal to mention ${JSON.stringify(fragment)}, got:\n${err.message}`,
        );
      }
      return true;
    },
  );
}

// ---------------------------------------------------------------------------
// 1. The jobs API returns valid job records
// ---------------------------------------------------------------------------

test("accepts a jobs list with real openings", () => {
  assert.doesNotThrow(() => {
    assertUsable(validContent());
  });
});

test("emits every field of a real opening", () => {
  const emitted = emitCareers(validContent());
  for (const value of [JOB.slug, JOB.title, JOB.type, JOB.branch, JOB.experience]) {
    assert.ok(emitted.includes(value), `expected the emitted module to carry ${value}`);
  }
  // `updatedAt` is a transport field, not part of the public `Job` type.
  assert.ok(!emitted.includes("updatedAt"), "updatedAt must not leak into the module");
});

// ---------------------------------------------------------------------------
// 2. The jobs API returns a valid EMPTY list — the regression under test
// ---------------------------------------------------------------------------

test("accepts an empty jobs list — no vacancies is a real business state", () => {
  assert.doesNotThrow(() => {
    assertUsable(validContent({ jobs: [] }));
  });
});

test("emits a valid, empty careers module when there are no openings", () => {
  const emitted = emitCareers(validContent({ jobs: [] }));
  assert.match(emitted, /export const jobs: Job\[\] = \[\];/);
  // The type and the lookup helper must survive, or /careers stops compiling.
  assert.match(emitted, /export type Job = \{/);
  assert.match(emitted, /export const jobBySlug/);
});

test("an empty jobs list does not weaken any other collection", () => {
  for (const [key, name] of [
    ["services", "services"],
    ["testimonials", "testimonials"],
    ["videos", "videos"],
    ["faqs", "faqs"],
    ["gallery", "gallery"],
    ["contentLists", "content-lists"],
    ["pageMeta", "page-meta"],
    ["contentBlocks", "content-blocks"],
  ]) {
    refuses(validContent({ jobs: [], [key]: [] }), `${name} is empty`);
  }
  // Stats live on settings rather than at the top level.
  const content = validContent({ jobs: [] });
  content.settings.stats = [];
  refuses(content, "stats is empty");
});

test("an empty jobs list does not weaken the identity checks", () => {
  const content = validContent({ jobs: [] });
  content.settings.email = "";
  refuses(content, "site.email is missing");

  const noWhatsapp = validContent({ jobs: [] });
  noWhatsapp.settings.whatsapp = {};
  refuses(noWhatsapp, "site.whatsapp.href is missing");

  const noPhones = validContent({ jobs: [] });
  noPhones.settings.phones = [];
  refuses(noPhones, "site.phones is empty");
});

// ---------------------------------------------------------------------------
// 3. The jobs request fails, or returns malformed data
// ---------------------------------------------------------------------------

test("refuses a jobs payload that is not an array", () => {
  // `{}` with no `items` key — `fetchContent` reads `.items` and gets undefined.
  refuses(validContent({ jobs: undefined }), "jobs is not an array", "malformed");
  refuses(validContent({ jobs: null }), "jobs is not an array");
  refuses(validContent({ jobs: { items: [JOB] } }), "jobs is not an array");
  refuses(validContent({ jobs: "no openings" }), "jobs is not an array");
});

test("a malformed jobs payload is never silently treated as empty", () => {
  // The distinction the old single-condition check could not make: both of
  // these produced the SAME "jobs is empty" message, so a broken API was
  // indistinguishable from a clinic with no vacancies.
  assert.doesNotThrow(() => {
    assertUsable(validContent({ jobs: [] }));
  });
  refuses(validContent({ jobs: undefined }), "malformed");
});

test("a failed jobs request is an error, not an empty list", async () => {
  const get = createFetcher({
    baseUrl: "https://backend.test",
    apiKey: "k",
    fetchImpl: async () => {
      throw new Error("ECONNREFUSED");
    },
  });
  await assert.rejects(() => get("/api/jobs"), /GET \/api\/jobs failed/);
});

test("an authentication failure on jobs is fatal", async () => {
  const get = createFetcher({
    baseUrl: "https://backend.test",
    apiKey: "wrong",
    fetchImpl: async () => ({ ok: false, status: 401, statusText: "Unauthorized" }),
  });
  await assert.rejects(() => get("/api/jobs"), /returned 401 Unauthorized/);
});

test("a server error on jobs is fatal", async () => {
  const get = createFetcher({
    baseUrl: "https://backend.test",
    apiKey: "k",
    fetchImpl: async () => ({ ok: false, status: 500, statusText: "Internal Server Error" }),
  });
  await assert.rejects(() => get("/api/jobs"), /returned 500/);
});

test("an unparseable jobs body is fatal", async () => {
  const get = createFetcher({
    baseUrl: "https://backend.test",
    apiKey: "k",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    }),
  });
  await assert.rejects(() => get("/api/jobs"), /GET \/api\/jobs failed/);
});

test("a jobs response with no items key reaches the validator as malformed", async () => {
  // End to end through the real fetch plumbing: an endpoint answering `{}`
  // must not look like an empty list by the time it is validated.
  const get = async (path) => (path === "/api/jobs" ? {} : { items: [row()] });
  const content = await fetchContent(get);
  assert.equal(content.jobs, undefined);
  refuses({ ...validContent(), jobs: content.jobs }, "jobs is not an array");
});

test("the generator still refuses a missing BACKEND_URL", () => {
  assert.throws(() => createFetcher({ baseUrl: "", apiKey: "k" }), /BACKEND_URL is not set/);
});
