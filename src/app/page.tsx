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
import { getFaqs } from "@/lib/content";
import type { Faq } from "@/content/site-content";
import { serialiseJsonLd } from "@/lib/schema";

export const metadata: Metadata = metadataFor("home");

/*
 * 🔴 Built inside the component now, not at module scope.
 *
 * `FAQPage` JSON-LD is derived from the SAME `faqs` the page renders, so a
 * module-scope constant would freeze the structured data at build time while
 * the visible accordion updated on revalidation — search engines and visitors
 * reading contradictory content, which is worse than either being stale.
 * D-042 requires unpublished content to leave the structured data too.
 */
function faqPageSchema(faqs: readonly Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export default async function HomePage() {
  const faqs = await getFaqs();
  const faqSchema = faqPageSchema(faqs);
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
