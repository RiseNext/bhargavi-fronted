import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";
import * as copy from "@/lib/copy";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { CtaBand } from "@/components/sections/HomeSections";
import { getTestimonials } from "@/lib/content";

export const metadata: Metadata = metadataFor("testimonials");

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Testimonials" }]}
        label={copy.text("testimonials", "hero", "label")}
        title={copy.heading("testimonials", "hero")}
        lead={`${testimonials.length} reviews from people treated for pain, thyroid, PCOD, migraine, post-surgery recovery and more.`}
      />

      <Section tone="ivory">
        <Wrap>
          {/* Masonry columns stop short quotes from leaving gaps */}
          <div className="gap-gutter sm:columns-2 lg:columns-3">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name + i}
                delay={(i % 3) * 70}
                className="mb-gutter break-inside-avoid"
              >
                <TestimonialCard testimonial={t} />
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
