import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadataFor } from "@/lib/page-metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { copyFor, privacyPublished } from "@/content/page-copy";
import { emphasise } from "@/lib/emphasis";

/**
 * The privacy policy — E17 / D-021.
 *
 * 🔴 WHY THIS PAGE EXISTS AT ALL. The appointment form collects free-text
 * symptom descriptions, which is health data. SECURITY/D-021 are explicit that
 * launching without a published policy is not an option while that is true.
 *
 * 🔴 WHY IT CAN 404. The content lives in `content_blocks` on `page =
 * 'privacy'` and reaches here through the generator, which WITHHOLDS the whole
 * page while any slot still contains an unresolved
 * `UNKNOWN — CLIENT INPUT REQUIRED` fact. `privacyPublished` is the generator's
 * verdict. A policy that misstates a retention period, a legal basis or the
 * registered entity is a legal exposure — materially worse than a page that is
 * not live yet — so the honest behaviour is not to serve it.
 *
 * Built from the SAME `PageHero` / `Section` / `Wrap` primitives every other
 * page uses, so it inherits the existing type scale, rhythm and responsive
 * behaviour rather than introducing a second layout idiom (D-010).
 *
 * The section list is read from the data, not hardcoded: the clinic can add or
 * reword a section in the admin and it appears here without a code change.
 */

/** Document order. Slots absent from the data are skipped silently. */
const SECTIONS = [
  "collect",
  "why",
  "health",
  "careers",
  "thirdParties",
  "storage",
  "retention",
  "rights",
  "consent",
  "children",
  "changes",
  "contact",
] as const;

export const metadata: Metadata = metadataFor("privacy");

export default function PrivacyPage() {
  // 🔴 The gate. Not a redirect and not an empty page — a genuine 404, so an
  // unapproved policy cannot be read, linked or indexed.
  if (!privacyPublished) notFound();

  const intro = copyFor("privacy", "intro");
  const lastUpdated =
    typeof intro.extra?.lastUpdated === "string" ? intro.extra.lastUpdated : undefined;

  return (
    <>
      <PageHero
        label={intro.label ?? "Privacy"}
        title={intro.title ?? "Privacy Policy"}
        lead={intro.lead}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: intro.title ?? "Privacy Policy" },
        ]}
      />

      <Section>
        <Wrap className="max-w-[72ch]">
          {lastUpdated !== undefined && (
            <p className="label text-muted">Last updated: {lastUpdated}</p>
          )}

          {intro.body?.map((paragraph, i) => (
            <p key={i} className="mt-stack text-body text-ink">
              {emphasise(paragraph)}
            </p>
          ))}

          {SECTIONS.map((slot) => {
            const block = copyFor("privacy", slot);
            if (block.title === undefined && block.lead === undefined && !block.body) return null;

            return (
              <section key={slot} className="mt-section">
                {block.label !== undefined && (
                  <p className="label text-terracotta">{block.label}</p>
                )}
                {block.title !== undefined && (
                  <h2 className="mt-1 text-h3 text-ink">{emphasise(block.title)}</h2>
                )}
                {block.lead !== undefined && (
                  <p className="mt-stack text-body text-muted">{emphasise(block.lead)}</p>
                )}
                {block.body?.map((paragraph, i) => (
                  <p key={i} className="mt-stack text-body text-ink">
                    {emphasise(paragraph)}
                  </p>
                ))}
              </section>
            );
          })}
        </Wrap>
      </Section>
    </>
  );
}
