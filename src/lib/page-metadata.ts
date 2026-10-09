/**
 * Per-page SEO metadata, from the generated `page_meta` rows.
 *
 * 🔴 WHY THIS EXISTS. The nine `page_meta` rows were being generated from Neon
 * and then ignored: every page declared its own `metadata` literal. So the
 * admin panel had a Page SEO screen that changed nothing a search engine would
 * ever see — which is worse than not having the screen, because an
 * administrator would reasonably believe their edit had taken effect.
 *
 * `backend/CLAUDE.md` §9 requires per-page SEO text to be editable. This is the
 * one line that makes it true.
 *
 * The shape returned is deliberately the same three fields every page already
 * declared — title, description, canonical — so wiring it changed no rendered
 * output. Verified: all nine pages' literals were byte-identical to their rows
 * before the switch.
 */

import type { Metadata } from "next";
import { metaForPage } from "@/content/page-meta";

/**
 * Next `Metadata` for a page key (`"home"`, `"about"`, …).
 *
 * Fields are omitted rather than emitted empty when a row lacks them: Next
 * falls back to the layout's defaults for an absent field, whereas an empty
 * string would render an empty `<title>` or description.
 */
export function metadataFor(page: string): Metadata {
  const meta = metaForPage(page);

  return {
    ...(meta.title ? { title: meta.title } : {}),
    ...(meta.description ? { description: meta.description } : {}),
    ...(meta.canonical ? { alternates: { canonical: meta.canonical } } : {}),
  };
}
