/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/jobs.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export type Job = {
  /** Reserved for a future /careers/[slug] detail page. */
  slug: string;
  title: string;
  type: string;
  branch: string;
  experience: string;
  excerpt: string;
  responsibilities: string[];
  requirements: string[];
};

export const jobs: Job[] = [
  {
    slug: "clinic-assistant",
    title: "Clinic Assistant",
    type: "Full-time",
    branch: "Bowenpally",
    experience: "Fresher-friendly",
    excerpt: "Keep treatment rooms ready and therapists supported — a hands-on start to a career in wellness care.",
    responsibilities: [
      "Prepare and reset treatment rooms between sittings",
      "Maintain hygiene and single-use supplies stock",
      "Assist therapists during cupping and physio sessions",
      "Help patients move comfortably around the clinic",
    ],
    requirements: [
      "Intermediate (12th) pass or above",
      "No experience needed — we train on the job",
      "Reliable, punctual and tidy by habit",
      "Based near Bowenpally preferred",
    ],
  },
];

/** Derived helper — code-owned (R-g). */
export const jobBySlug = (slug: string) => jobs.find((j) => j.slug === slug);

/* ─────────────────────────────────────────────────────────────────────────────
 * ✅ D-037 — the mailto subject is CODE-OWNED chrome, not CMS content.
 *
 * It is an `encodeURIComponent`-wrapped query parameter, never rendered as
 * visible copy, in the same class as `site.whatsapp.href`. The editable
 * sentence the visitor actually reads — "with the role in the subject line" —
 * is `careers.apply.extra.resumeInstruction`.
 *
 * ⚠ X-34 is an open DEFECT here: the subject omits the role. Fixing it is a
 * one-line change to this constant plus the modal path.
 * ──────────────────────────────────────────────────────────────────────────── */

export const mailtoSubject = "Job application — Bhargavi Health World";
