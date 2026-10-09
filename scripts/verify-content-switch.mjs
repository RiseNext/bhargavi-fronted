/**
 * E21 — verify the generated content by IMPORTING it, the way a component does.
 *
 * Grepping generated source is fragile and was already misleading once: field
 * names differ from what a hand-written regex guesses, so "0 videos" looked
 * like a generator failure when the generator had in fact written 19. Importing
 * the modules asks the same question the build asks.
 *
 * Checks every collection the approved content model defines, plus the
 * compatibility shapes that components depend on (D-026 nav, D-028 hours,
 * D-023 stat hero labels, D-029 resolved globals).
 */

import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const load = async (p) => import(pathToFileURL(resolve(ROOT, p)).href);

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}${detail ? `  — ${detail}` : ""}`);
  }
};

const { site } = await load("src/lib/site.ts");
const services = await load("src/content/services.ts");
const testimonials = await load("src/content/testimonials.ts");
const media = await load("src/content/media.ts");
const careers = await load("src/content/careers.ts");
const content = await load("src/content/site-content.ts");
const posts = await load("src/content/posts.ts");
const pageMeta = await load("src/content/page-meta.ts");
const pageCopy = await load("src/content/page-copy.ts");

const len = (v) => (Array.isArray(v) ? v.length : -1);

console.log("\nCollections (canonical counts, D-036)\n");
check("services 10", len(services.services) === 10, String(len(services.services)));
check("testimonials 23", len(testimonials.testimonials) === 23, String(len(testimonials.testimonials)));
check("videos 19", len(media.videos) === 19, String(len(media.videos)));
check("gallery 8", len(media.galleryImages) === 8, String(len(media.galleryImages)));
check("faqs 6", len(content.faqs) === 6, String(len(content.faqs)));
check("jobs 6", len(careers.jobs) === 6, String(len(careers.jobs)));
check("stats 4 (site-content, as at 2fdf32a)", len(content.stats) === 4, String(len(content.stats)));
check("branches 2", len(site.branches) === 2, String(len(site.branches)));
check("phones 2", len(site.phones) === 2, String(len(site.phones)));
check("socials 3", len(site.socials) === 3, String(len(site.socials)));
check("page-meta 10 (9 original + privacy, E17)", Object.keys(pageMeta.pageMeta ?? {}).length === 10, String(Object.keys(pageMeta.pageMeta ?? {}).length));
check("posts 0 (none authored yet)", len(posts.posts) === 0, String(len(posts.posts)));

console.log("\nCompatibility shapes the components depend on\n");

// 🔴 D-028 — three live consumers read `site.hours`, one of them `hours[0].days`.
const h0 = site.hours?.[0];
check(
  "D-028 site.hours keeps the {days,time} DISPLAY shape",
  typeof h0?.days === "string" && typeof h0?.time === "string",
  JSON.stringify(h0),
);
// A separate top-level EXPORT, not a key on `site` — same as the original file.
  const { hoursStructured } = await load("src/lib/site.ts");
  check("D-028 hoursStructured exported additively", Array.isArray(hoursStructured) && hoursStructured.length > 0, String(len(hoursStructured)));
check("site.hours has 1+ display rows", len(site.hours) >= 1, String(len(site.hours)));

// 🔴 D-013 — two independent orderings. Deriving one from the other silently
// reorders eight rendered phone numbers across five surfaces.
check("D-013 branches[0] is Chikkadpally", site.branches?.[0]?.name === "Chikkadpally", site.branches?.[0]?.name);
check("D-013 phones[0] is Bowenpally", site.phones?.[0]?.branch === "Bowenpally", site.phones?.[0]?.branch);

// 🔴 D-026 — nav is code-owned and re-emitted verbatim.
const { nav } = await load("src/lib/site.ts");
  check("D-026 nav re-emitted verbatim, with children", len(nav) > 0 && nav.some((n) => Array.isArray(n.children)), String(len(nav)));

// 🔴 D-029 — global fields resolve from the first branch by sort_order that
// HAS a value, never from is_primary (which is Bowenpally, all NULL).
// An OBJECT, exactly as at 2fdf32a. Chikkadpally, because is_primary is
  // Bowenpally and all its location fields are NULL (D-029).
  check("D-029 site.address resolved from Chikkadpally", String(site.address?.line2 ?? "").includes("Chikkadpally"), JSON.stringify(site.address?.line2));
check("D-029 site.mapsUrl populated", typeof site.mapsUrl === "string" && site.mapsUrl.length > 10);

// 🔴 D-023 — the hero keeps its own wording.
check("D-023 at least one stat carries a heroLabel", content.stats?.some((s) => typeof s.heroLabel === "string" && s.heroLabel.length > 0));

// 🔴 The frontend's whatsapp href is an api.whatsapp.com URL, not wa.me.
check("whatsapp href is api.whatsapp.com (not wa.me)", String(site.whatsapp?.href ?? "").includes("api.whatsapp.com"), site.whatsapp?.href);

// 🔴 D-037 — careers.mailtoSubject is code-owned chrome, re-emitted.
check("D-037 careers mailtoSubject re-emitted (code-owned)", typeof careers.mailtoSubject === "string" && careers.mailtoSubject.length > 0);

// Page copy — 41 content blocks across 12 pages.
const copy = pageCopy.pageCopy ?? {};
const slots = Object.values(copy).reduce((n, page) => n + Object.keys(page ?? {}).length, 0);
check("page-copy carries 41 derived slots (+ privacy additions)", slots >= 41, String(slots));
check("page-copy covers 12 pages", Object.keys(copy).length >= 12, String(Object.keys(copy).length));

console.log("\nMedia — every image now comes from Cloudinary\n");
const allSrc = [
  ...(services.services ?? []).map((s) => s.image),
  ...(media.galleryImages ?? []).map((g) => g.src),
  site.logo,
  site.ogImage,
  site.founder?.photo,
].filter((x) => typeof x === "string");

const cloud = allSrc.filter((s) => s.includes("res.cloudinary.com")).length;
const local = allSrc.filter((s) => s.startsWith("/images/")).length;
check(`all ${String(allSrc.length)} image srcs are Cloudinary URLs`, local === 0 && cloud === allSrc.length, `cloudinary=${String(cloud)} local=${String(local)}`);

console.log("\n🔴 No secret may appear in generated content\n");
const { readFileSync, readdirSync } = await import("node:fs");
const files = ["src/lib/site.ts", ...readdirSync(resolve(ROOT, "src/content")).map((f) => `src/content/${f}`)];
const names = ["CLOUDINARY_API_SECRET", "CLOUDINARY_API_KEY", "DATABASE_URL", "SESSION_SECRET", "FIELD_ENCRYPTION_KEYS", "BACKEND_API_KEY", "neondb_owner", "neon.tech", "api_key", "signature"];
const leaks = [];
for (const f of files) {
  const t = readFileSync(resolve(ROOT, f), "utf8");
  for (const n of names) if (t.includes(n)) leaks.push(`${f}: ${n}`);
}
check("no credential name or host in any generated file", leaks.length === 0, leaks.join(", "));

console.log(`\n  ${String(pass)} passed, ${String(fail)} failed\n`);
process.exitCode = fail === 0 ? 0 : 1;
