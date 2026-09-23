import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { CtaBand } from "@/components/sections/HomeSections";
import { testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Testimonials | Acupuncture & Wellness Treatment Reviews",
  description:
    "Read patient testimonials at Bhargavi Health World, Hyderabad, and see how our acupuncture and wellness treatments aid pain relief and stress management.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Testimonials" }]}
        label="Happy patients"
        title={
          <>
            In their <span className="italic">own</span> words
          </>
        }
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
