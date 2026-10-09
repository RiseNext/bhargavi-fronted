import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";
import * as copy from "@/lib/copy";

import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { CtaBand, ProcessSteps } from "@/components/sections/HomeSections";
import { services } from "@/content/services";
import { faqs } from "@/content/site-content";

export const metadata: Metadata = metadataFor("services");

export default function ServicesPage() {
  return (
    <>
      {/* Compact on purpose — the therapies are the content, so the grid
          starts immediately instead of after a screen of copy. */}
      <PageHero
        compact
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services" }]}
        title={copy.heading("services", "hero")}
      />

      <Section tone="ivory">
        <Wrap>
          <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 3) * 80}>
                <ServiceCard service={service} index={i + 1} className="h-full" />
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <ProcessSteps />

      <Section tone="sand">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-nav lg:self-start">
            <SectionHead
              align="left"
              label={copy.text("services", "faqSection", "label")}
              title={copy.text("services", "faqSection", "title")}
              lead={copy.text("services", "faqSection", "lead")}
            />
          </div>
          <Reveal delay={90}>
            <Accordion items={faqs} />
          </Reveal>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
