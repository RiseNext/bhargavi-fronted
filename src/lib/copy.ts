import { createElement, type ReactNode } from "react";
import { copyFor, type PageCopyBlock, type PageCopyItem } from "@/content/page-copy";
import { emphasise } from "@/lib/emphasis";

/**
 * Reading page copy, with a loud failure instead of a blank heading.
 *
 * 🔴 WHY NOT `copy.title ?? ""`. A missing slot or field means the generator
 * emitted content the page did not expect — a seed that did not run, a slot
 * renamed, a field reclassified as code-owned. Falling back to an empty string
 * would publish a page with a blank heading and a green build, which is the
 * silent-content-loss failure R-i exists to prevent. These helpers throw, so
 * the BUILD fails and someone reads the message.
 *
 * ⚠ Code-owned fields are deliberately ABSENT from `pageCopy`
 * (`scripts/seed/code-owned-fields.ts`). Do not reach for them here — the page
 * keeps rendering its own expression, which is the whole point of the
 * classification.
 */

/** The block for a slot. Throws when the slot is missing entirely. */
export function block(page: string, slot: string): PageCopyBlock {
  const found = copyFor(page, slot);
  // `copyFor` returns {} for an unknown key, so an empty object IS the miss.
  if (Object.keys(found).length === 0) {
    throw new Error(
      `Page copy "${page}.${slot}" is missing. The generator emitted no such slot — ` +
        "check that the content seed ran and that the slot was not renamed.",
    );
  }
  return found;
}

/** A required string field. Throws rather than rendering nothing. */
export function text(page: string, slot: string, field: "label" | "title" | "lead"): string {
  const value = block(page, slot)[field];
  if (typeof value !== "string" || value === "") {
    throw new Error(
      `Page copy "${page}.${slot}.${field}" is missing. If that field is code-owned, the page ` +
        "should render its own expression instead of reading it here — see " +
        "backend/scripts/seed/code-owned-fields.ts.",
    );
  }
  return value;
}

/** An optional string field; `undefined` when absent, never an empty string. */
export function maybe(
  page: string,
  slot: string,
  field: "label" | "title" | "lead",
): string | undefined {
  const value = block(page, slot)[field];
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * A heading, with `*emphasis*` parsed into the italic span the site already
 * renders (D-037). Use this for every `title` — a marker printed literally
 * would be a visible defect.
 */
export function heading(page: string, slot: string): ReactNode {
  return emphasise(text(page, slot, "title"));
}

/** Body paragraphs. Throws when the slot declares none. */
export function body(page: string, slot: string): string[] {
  const value = block(page, slot).body;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Page copy "${page}.${slot}.body" is missing or empty.`);
  }
  return value;
}

/** A required `extra` string. `extra` is an untyped bag, so it is narrowed here. */
export function extra(page: string, slot: string, key: string): string {
  const value = block(page, slot).extra?.[key];
  if (typeof value !== "string" || value === "") {
    throw new Error(
      `Page copy "${page}.${slot}.extra.${key}" is missing. Check the slot's allowlist in ` +
        "backend/src/lib/content/extra-allowlist.ts — the key may be code-owned.",
    );
  }
  return value;
}

/**
 * A structured `extra` value — a small record of strings rather than one string.
 *
 * Used by `home.intro.extra.sinceCard`, whose three parts ("Since" / "2017" /
 * "Practising in Chikkadpally") sit in three differently-styled spans inside one
 * card. Three separate allowlist keys would model one card as three unrelated
 * fields; one record keeps them together in the admin screen.
 */
export function extraObject(page: string, slot: string, key: string): Record<string, string> {
  const value = block(page, slot).extra?.[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `Page copy "${page}.${slot}.extra.${key}" is not a record. Check the slot's ` +
        "allowlist in backend/src/lib/content/extra-allowlist.ts.",
    );
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v !== "string" || v === "") {
      throw new Error(`Page copy "${page}.${slot}.extra.${key}.${k}" is missing.`);
    }
    out[k] = v;
  }
  return out;
}

/**
 * A note whose literal `*` must keep the form's required-field colour.
 *
 * 🔴 WHY THIS IS NOT PLAIN TEXT. In "Fields marked * are required." the
 * asterisk carries the same terracotta the appointment form puts on every
 * required-field marker. Printing the stored sentence flat would recolour a
 * glyph a visitor uses to read the form — a visible change, so D-010 forbids
 * it. D-037's `*marker*` convention cannot express this: that parser needs a
 * PAIR of markers around a word, and here a single literal glyph IS the content.
 *
 * Deliberately narrow. Exactly one slot uses it
 * (`home.appointmentBand.extra.formCardNote`); anything wanting italic emphasis
 * uses `heading()` and the `*marker*` parser instead. Keeping the field editable
 * rather than reclassifying it as code-owned is the point — the sentence is
 * ordinary copy an owner may reword; only the glyph's styling is code's.
 */
export function noteWithRequiredGlyph(page: string, slot: string, key: string): ReactNode[] {
  return extra(page, slot, key)
    .split("*")
    .flatMap((part, index) =>
      index === 0
        ? [part]
        : [
            createElement(
              "span",
              { key: `glyph-${String(index)}`, className: "text-terracotta" },
              "*",
            ),
            part,
          ],
    );
}

/**
 * A sentence whose leading phrase — everything up to and including the first
 * colon — is set in its own element.
 *
 * Used by the therapy disclaimer, where "Please note:" is `<strong>` and the
 * rest is body text. Printing the stored sentence flat would unbold a phrase a
 * visitor relies on to spot the warning, which D-010 forbids; classifying the
 * whole paragraph as code-owned would lock up the one piece of near-legal copy
 * the clinic is most likely to reword.
 *
 * Deliberately narrow and deterministic: the split is the FIRST colon, nothing
 * else. A rewritten sentence with no colon simply renders flat rather than
 * guessing, which is why this returns the whole string unwrapped in that case
 * instead of throwing.
 */
export function withLeadIn(
  page: string,
  slot: string,
  field: "label" | "title" | "lead",
  className: string,
): ReactNode[] {
  const value = text(page, slot, field);
  const at = value.indexOf(":");
  if (at === -1) return [value];
  return [
    createElement("strong", { key: "lead-in", className }, value.slice(0, at + 1)),
    value.slice(at + 1),
  ];
}

/**
 * A repeated group — bullet lists, inline image pairs, info cards, meta rows.
 *
 * Returns the rows in `sort_order`, exactly as the generator emitted them, and
 * throws on an empty or missing group. A silently-empty list would publish a
 * section with its heading and no content, which reads as a broken page rather
 * than as missing data.
 */
export function items(page: string, slot: string, key: string): PageCopyItem[] {
  const group = block(page, slot).items?.[key];
  if (!Array.isArray(group) || group.length === 0) {
    throw new Error(
      `Page copy "${page}.${slot}.items.${key}" is missing or empty. Check that the ` +
        "content_block_items rows were seeded for this slot.",
    );
  }
  return group;
}

/**
 * A destination whose LABEL the component supplies from code (D-040).
 *
 * Two CTAs are split this way: `home.testimonials` renders
 * `All {testimonials.length} reviews` and `about.story` renders
 * `Consult with {founder first name}`. Freezing either label would stop it
 * tracking what it derives from, but the destination is ordinary editable copy
 * and must not be discarded just because its sibling is code's. Migration 013
 * permits the half-stored row; this reads it.
 */
export function destination(
  page: string,
  slot: string,
  which: "ctaHref" | "cta2Href" = "ctaHref",
): string {
  const value = block(page, slot)[which];
  if (typeof value !== "string" || value === "") {
    throw new Error(
      `Page copy "${page}.${slot}.${which}" is missing. A code-owned label needs a ` +
        "stored destination; check cta_href in content_blocks.",
    );
  }
  return value;
}

/** One row of a group, by position. Throws rather than rendering nothing. */
export function item(page: string, slot: string, key: string, index: number): PageCopyItem {
  const group = items(page, slot, key);
  const row = group[index];
  if (row === undefined) {
    throw new Error(
      `Page copy "${page}.${slot}.items.${key}" has ${String(group.length)} row(s); ` +
        `the page asked for index ${String(index)}.`,
    );
  }
  return row;
}

/**
 * A required string on an item row.
 *
 * `PageCopyItem` types every field optional because the groups are
 * heterogeneous — a bullet has `text`, an image has `image` + `alt`. The page
 * knows which it needs, so it narrows here and gets a loud failure rather than
 * `undefined` reaching JSX, where it would render as nothing at all.
 */
export function itemText(
  row: PageCopyItem,
  name: keyof PageCopyItem,
  where: string,
): string {
  const value = row[name];
  if (typeof value !== "string" || value === "") {
    throw new Error(`Page copy item "${where}" is missing "${name}".`);
  }
  return value;
}

/** A CTA, when both halves are stored. `undefined` when either is code-owned. */
export function cta(
  page: string,
  slot: string,
  which: "cta" | "cta2" = "cta",
): { label: string; href: string } | undefined {
  const link = block(page, slot)[which];
  return link === undefined ? undefined : link;
}

/**
 * A CTA the page cannot render without.
 *
 * Use this where the button is unconditional, and `cta()` only where the page
 * genuinely handles its absence. A code-owned CTA — `global.ctaBand.cta2`, whose
 * label and href are both `site.phones[0]` — is absent by design and must keep
 * its own expression rather than call this.
 */
export function action(
  page: string,
  slot: string,
  which: "cta" | "cta2" = "cta",
): { label: string; href: string } {
  const link = cta(page, slot, which);
  if (link === undefined) {
    throw new Error(
      `Page copy "${page}.${slot}.${which}" is missing. Either both halves were ` +
        "left unset, or one half is code-owned and the page should render its own " +
        "expression — see backend/scripts/seed/code-owned-fields.ts.",
    );
  }
  return link;
}
