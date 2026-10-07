import type { Metadata } from "next";

import { Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { Rings, Seed } from "@/components/ui/Decor";
import { CtaBand } from "@/components/sections/HomeSections";
import { CareerForm } from "@/components/forms/CareerForm";
import { JobOpenings } from "@/components/careers/JobOpenings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers | Join Bhargavi Health World, Hyderabad",
  description:
    "Therapist, consultant and front-desk openings at Bhargavi Health World's Chikkadpally and Bowenpally branches. Build a career in holistic wellness care.",
  alternates: { canonical: "/careers" },
};

const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent(
  "Job application — Bhargavi Health World",
)}`;

export default function CareersPage() {
  return (
    <>
      {/* Open roles — doubles as the page header (no separate hero). */}
      <Section
        tone="sand"
        id="roles"
        flush
        className="scroll-mt-nav pt-[calc(var(--spacing-nav)+var(--spacing-block))] pb-section"
      >
        <Wrap>
          <Reveal>
            <p className="label text-terracotta">Open positions</p>
          </Reveal>
          <div className="mt-stack flex flex-col gap-x-block gap-y-stack border-b border-line pb-stack lg:flex-row lg:items-end lg:justify-between">
            <Wipe as="h1" className="text-h2 text-ink">
              Current openings
            </Wipe>
            <Reveal delay={140} className="lg:text-right">
              <p className="font-display text-h4 text-ink">
                Grow with <span className="italic">Bhargavi</span> Health World
              </p>
              <p className="mt-2 max-w-[44ch] text-small text-muted lg:ml-auto">
                Join a small team that treats the cause, not just the pain —
                shortlisted candidates hear back within a week.
              </p>
            </Reveal>
          </div>
          <JobOpenings />
        </Wrap>
      </Section>

      {/* General applications */}
      <Section tone="walnut" className="overflow-clip">
        <Rings className="absolute -right-[6%] top-1/2 w-[min(26rem,46vw)] -translate-y-1/2 text-ivory/10" />
        <Wrap>
          <SectionHead
            invert
            label="No matching role?"
            title="We still want to hear from you"
            lead="If you care about honest, patient-first wellness work, send a general application — we keep good people in mind."
          />
          <Reveal delay={120}>
            <div className="mt-block flex flex-wrap items-center gap-x-block gap-y-stack">
              <ButtonLink href="#apply" variant="inverse" className="w-full sm:w-auto">
                Send a general application
              </ButtonLink>
              <ArrowLink href={mailtoHref} invert external>
                Email your resume to {site.email}
              </ArrowLink>
            </div>
          </Reveal>
        </Wrap>
      </Section>

      {/* Apply */}
      <Section tone="ivory" id="apply" className="scroll-mt-nav">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="lg:sticky lg:top-nav">
            <SectionHead
              align="left"
              label="Apply"
              title="Tell us about yourself"
              lead="Fill in the form and we'll get back to you — shortlisted candidates hear from us within a week."
            />
            <Reveal delay={120}>
              <div className="mt-block space-y-stack border-t border-line pt-block">
                <p className="max-w-[44ch] text-small text-muted">
                  <Seed className="mr-2 inline text-olive" />
                  Email your resume to{" "}
                  <a href={mailtoHref} className="underline-grow text-ink">
                    {site.email}
                  </a>{" "}
                  with the role in the subject line.
                </p>
                <div>
                  <p className="label text-muted">Prefer to call?</p>
                  <ul className="mt-3 space-y-1.5">
                    {site.phones.map((p) => (
                      <li key={p.href} className="text-small text-muted">
                        <a href={p.href} className="underline-grow text-ink">
                          {p.label}
                        </a>{" "}
                        · {p.branch}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-small text-muted">
                  Open {site.hours[0].days}, {site.hours[0].time}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <CareerForm role="General application" />
          </Reveal>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
