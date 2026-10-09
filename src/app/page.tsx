import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";
import { Hero } from "@/components/sections/Hero";
import {
  AppointmentBand,
  CtaBand,
  FaqSection,
  HealthTalks,
  Intro,
  StatsBand,
  Testimonials,
  TherapyIndex,
  WhyUs,
} from "@/components/sections/HomeSections";
import { faqs } from "@/content/site-content";
import { serialiseJsonLd } from "@/lib/schema";

export const metadata: Metadata = metadataFor("home");

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <StatsBand />
      <TherapyIndex />
      <Testimonials />
      <HealthTalks />
      <WhyUs />
      <AppointmentBand />
      <FaqSection />
      <CtaBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(faqSchema) }}
      />
    </>
  );
}
