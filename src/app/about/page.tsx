import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";

import { PageHero } from "@/components/ui/PageHero";
import { IndexRule, Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Frame } from "@/components/ui/Media";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Rings, Seed } from "@/components/ui/Decor";
import {
  CtaBand,
  ProcessSteps,
  StatsBand,
  Testimonials,
} from "@/components/sections/HomeSections";
import { site } from "@/lib/site";
import * as copy from "@/lib/copy";
import { absoluteUrl, serialiseJsonLd } from "@/lib/schema";
import {
  getAboutStory,
  getAchievements,
  getGalleryImages,
  getPhilosophy,
} from "@/lib/content";

export const metadata: Metadata = metadataFor("about");

/* `philosophy` now comes from the generated content module — see the import.
 *
 * 🔴 It was a hardcoded array here, and the array was BYTE-IDENTICAL to the
 * generated one, which is exactly why nobody noticed. The generator emits
 * `philosophy` from the `philosophy` content-list collection, the admin panel
 * edits those rows, and this page read its own copy instead — so editing a
 * philosophy item would have changed the database, changed the generated file,
 * and left this page showing the original text for ever. A duplicate that
 * currently agrees is indistinguishable from a working wire-up until the first
 * edit, and the first edit is the worst moment to find out. */

/**
 * The founder's credentials as `hasCredential`, one node per qualification.
 *
 * `qualifications` is a single admin-entered string — "BA, B.Ed, MA, Diploma in
 * Acupuncture" — so it is split on commas. Schema.org models a credential as an
 * `EducationalOccupationalCredential`, not a sentence, and emitting four nodes
 * rather than one lets a consumer read them individually.
 *
 * ⚠ Deliberately NOT written into `description`. That is what the orphaned
 * `person()` helper does (`schema.ts:261`), and it is wrong twice over: it
 * conflates credentials with a biography, and `description` on this page is
 * already the founder's opening story paragraph, which is better content for
 * it. Both are kept, in their correct properties.
 *
 * Returns `undefined` when the field is empty, so an unset value emits nothing
 * rather than an empty node — `null` means unknown and renders nothing
 * (CLAUDE.md §8).
 */
function credentialNodes(qualifications: string | undefined) {
  const parts = (qualifications ?? "")
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.map((q) => ({
    "@type": "EducationalOccupationalCredential",
    name: q,
  }));
}

/*
 * The heading renders the first name in italics and the remainder plain, so the
 * two halves are split once here rather than inline in the JSX. `rest` is empty
 * for a single-word name, and the heading omits the trailing space in that case.
 */
const founderFirstName = site.founder.name.split(" ")[0] ?? site.founder.name;
const founderRestOfName = site.founder.name.split(" ").slice(1).join(" ");

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.founder.name,
  jobTitle: site.founder.role,
  worksFor: { "@type": "MedicalClinic", name: site.name },
  image: absoluteUrl(site.url, site.founder.photo),
  ...(credentialNodes(site.founder.qualifications) === undefined
    ? {}
    : { hasCredential: credentialNodes(site.founder.qualifications) }),
  // `description` is attached inside the component — see below.
};

export default async function AboutPage() {
  const [aboutStory, achievements, philosophy, galleryImages] = await Promise.all([
    getAboutStory(),
    getAchievements(),
    getPhilosophy(),
    getGalleryImages(),
  ]);

  /*
   * 🔴 `description` moved out of the module-scope constant.
   *
   * It is the founder's opening paragraph, which is admin-managed
   * (`about_story`). Leaving it baked in would publish a `Person` description
   * that no longer matched the prose rendered a few hundred pixels below it,
   * and structured data that contradicts the page is worse than none.
   */
  const personSchemaWithDescription = { ...personSchema, description: aboutStory[0] };

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        label={copy.text("about", "hero", "label")}
        title={
          /*
           * Derived from `site.founder.name`, which was already the source for
           * the honorific, the photo alt and the "Consult with …" CTA on this
           * same page — the first and last name were the only two fragments
           * still hardcoded, so editing the founder's name in the admin panel
           * would have changed four surfaces and left the page heading alone.
           *
           * The italic on the first word is preserved exactly. Verified
           * text-identical before the change: name is "Anjana Bhargavi", so
           * first="Anjana" and rest="Bhargavi" reproduce the previous markup
           * character for character.
           */
          <>
            {site.founder.honorific}{" "}
            <span className="italic">{founderFirstName}</span>
            {founderRestOfName && <> {founderRestOfName}</>}
          </>
        }
        lead={
          <>
            {site.founder.role}
            {site.founder.qualifications && (
              /*
               * 🔴 The founder's qualifications had NO consumer anywhere.
               *
               * The field is admin-editable, validated, stored, served by the
               * API and emitted into `site.founder.qualifications` — and the
               * only reference to it in the whole frontend was inside
               * `schema.ts`'s `person()` helper, which nothing calls. So an
               * administrator could edit a clinician's credentials and no
               * visitor would ever see the change, which for a medical
               * practice is the one category of content that most needs to be
               * visible and correct.
               *
               * `<span className="block">` rather than a second `<p>`:
               * `PageHero` already wraps `lead` in a `<p>`, and a nested `<p>`
               * is invalid HTML that browsers silently restructure. The type
               * tokens are the small-caps label pairing already used by the
               * statistics band, so this introduces no new typography.
               */
              <span className="mt-2 block text-label uppercase tracking-[0.16em]">
                {site.founder.qualifications}
              </span>
            )}
          </>
        }
      />

      {/* Story */}
      <Section tone="ivory">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="lg:sticky lg:top-nav">
            <Reveal className="group relative">
              <Frame
                src={site.founder.photo}
                alt={`${site.founder.honorific} ${site.founder.name}`}
                radius="xl"
                priority
                zoom
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="aspect-4/5 w-full"
                imgClassName="object-top"
              />
            </Reveal>

          </div>

          <div>
            <SectionHead
              align="left"
              label={copy.text("about", "story", "label")}
              title={copy.text("about", "story", "title")}
            />
            <div className="prose mt-block">
              {aboutStory.map((para, i) => (
                <Reveal key={i} delay={i * 80} as="p">
                  {para}
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <figure className="mt-block border-t border-line pt-block">
                <Seed className="text-[1.4rem] text-olive" />
                <blockquote className="mt-stack max-w-[22ch] font-display text-h2 leading-[1.15] text-ink">
                  {copy.extra("about", "story", "pullQuote")}
                </blockquote>
                <figcaption className="mt-stack text-small text-muted">
                  {copy.extra("about", "story", "pullQuoteCaption")}
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={260}>
              {/* The label tracks the founder's first name, so it stays an
                  expression (D-040); only the destination is stored. */}
              <ButtonLink
                href={copy.destination("about", "story")}
                size="lg"
                className="mt-block"
              >
                Consult with {site.founder.name.split(" ")[0]}
              </ButtonLink>
            </Reveal>
          </div>
        </Wrap>
      </Section>

      <StatsBand />

      {/* Achievements */}
      <Section tone="walnut" className="overflow-clip">
        <Rings className="absolute -right-[6%] top-1/2 w-[min(26rem,46vw)] -translate-y-1/2 text-ivory/10" />
        <Wrap>
          <SectionHead
            invert
            label={copy.text("about", "achievements", "label")}
            title={copy.text("about", "achievements", "title")}
            lead={copy.text("about", "achievements", "lead")}
          />
          <ol className="mt-block border-t border-ivory/15">
            {achievements.map((item, i) => (
              <Reveal key={item} delay={i * 70}>
                <li className="flex items-baseline gap-[clamp(0.75rem,2vw,2rem)] border-b border-ivory/15 py-[clamp(0.9rem,0.7rem+0.8vw,1.35rem)]">
                  <IndexRule n={i + 1} invert />
                  <p className="max-w-[60ch] text-body text-ivory/85">{item}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Wrap>
      </Section>

      {/* Philosophy */}
      <Section tone="ivory">
        <Wrap>
          <SectionHead
            label={copy.text("about", "philosophy", "label")}
            title={copy.text("about", "philosophy", "title")}
          />
          <div className="mt-block grid gap-block lg:grid-cols-3">
            {philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="h-full border-t border-line pt-stack">
                  <IndexRule n={i + 1} />
                  <Wipe as="h3" className="mt-4 text-h3 text-ink">
                    {item.title}
                  </Wipe>
                  <p className="mt-3 max-w-[38ch] text-small text-muted">
                    {item.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <ProcessSteps />

      {/* The space */}
      <Section tone="sand">
        <Wrap>
          <SectionHead
            label={copy.text("about", "theSpace", "label")}
            title={copy.text("about", "theSpace", "title")}
            lead={copy.text("about", "theSpace", "lead")}
          />
          <div className="mt-block grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.slice(0, 4).map((img, i) => (
              <Reveal key={img.src} delay={(i % 4) * 80} className="group">
                <Frame
                  src={img.src}
                  alt={img.alt}
                  radius="lg"
                  zoom
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw"
                  className="aspect-4/5 w-full"
                />
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <Testimonials />
      <CtaBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(personSchemaWithDescription) }}
      />
    </>
  );
}
