/**
 * PURE SHAPE FUNCTIONS — the API's wire shapes → the shapes components consume.
 *
 * Split out of `content.ts` for two reasons, both load-bearing.
 *
 * 1. **Security.** `content.ts` is `server-only` because it attaches
 *    `BACKEND_API_KEY`. These functions touch no secret and perform no I/O, so
 *    keeping them separate means the security boundary sits exactly where the
 *    secret is, rather than being a side effect of where the types live.
 *
 * 2. **Testability.** `tests/` must be able to prove these produce output
 *    IDENTICAL to `generator/generate-content.mjs` for the same input — that
 *    equivalence is what makes migrating ~20 consumers from static imports to
 *    runtime reads a mechanical change rather than a rewrite with a visual diff
 *    nobody checked. Importing a `server-only` module outside a server render
 *    throws, so the assertions could not reach them in there.
 *
 * 🔴 The reference implementation is `generator/generate-content.mjs`. When the
 * two disagree, the generator is right and this file is the bug — it is the
 * code that produced the site as it looks today.
 */

import type { Service } from "@/content/services";
import type { Testimonial } from "@/content/testimonials";
import type { Video } from "@/content/media";
import type { Stat } from "@/content/site-content";

// ---------------------------------------------------------------------------
// Shaping
// ---------------------------------------------------------------------------

/**
 * The emitted shapes are reproduced EXACTLY as the generator produced them.
 *
 * Every component already consumes these shapes and D-010 forbids changing
 * rendered output, so the mapping below is a transcription of the generator's
 * `emit*` functions rather than a redesign. `generator/generate-content.mjs`
 * remains the reference, and `tests/runtime-shape-equivalence.test.ts` asserts
 * these functions and that generator agree field for field on real data.
 *
 * ⚠ The `if (x) row.y = …` pattern is load-bearing, not sloppiness: several
 * components distinguish *absent* from *falsy* (`when`, `featured`,
 * `translation`, `heroLabel`, `showInHero`, `priceFrom`, `typicalCourse`), and
 * emitting `featured: false` where the generator emitted nothing would change
 * `featuredTestimonials` and `featuredVideos`.
 */

export interface RawTestimonial {
  name: string;
  quote: string;
  when: string | null;
  featured: boolean;
}

export function shapeTestimonial(t: RawTestimonial): Testimonial {
  const row: Testimonial = { name: t.name, quote: t.quote };
  if (t.when) row.when = t.when;
  if (t.featured) row.featured = true;
  return row;
}

export interface RawVideo {
  id: string;
  title: string;
  translation: string | null;
  featured: boolean;
}

export function shapeVideo(v: RawVideo): Video {
  const row: Video = { id: v.id, title: v.title };
  if (v.translation) row.translation = v.translation;
  if (v.featured) row.featured = true;
  return row;
}

export interface RawService {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  duration: string;
  treats: string[];
  body: string[];
  updatedAt: string;
  priceFromPaise: number | null;
  typicalCourse: string | null;
}

/** ₹100 renders as "From ₹100" — no decimals for a whole-rupee amount. */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  const amount = Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
  return `From ₹${amount}`;
}

export function shapeService(s: RawService): Service {
  const row: Service = {
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    image: s.image,
    duration: s.duration,
    treats: s.treats,
    body: s.body,
    updatedAt: s.updatedAt,
  };
  if (s.priceFromPaise !== null) row.priceFrom = formatRupees(s.priceFromPaise);
  if (s.typicalCourse !== null) row.typicalCourse = s.typicalCourse;
  return row;
}

export interface RawStat {
  value: number;
  suffix: string;
  label: string;
  heroLabel: string | null;
  showInHero: boolean;
}

export function shapeStat(s: RawStat): Stat {
  const row: Stat = { value: s.value, suffix: s.suffix, label: s.label };
  // ✅ D-023 — the hero renders the same statistics with different wording.
  if (s.heroLabel) row.heroLabel = s.heroLabel;
  if (s.showInHero) row.showInHero = true;
  return row;
}

