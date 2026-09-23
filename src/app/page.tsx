import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Wellness Center in Chikkadpally | Acupressure Clinic in Chikkadpally",
  description:
    "Bhargavi Health World in Chikkadpally, Hyderabad offers holistic wellness care. Led by Anjana Bhargavi (Diploma in Acupuncture), we specialize in acupuncture, pain management & natural healing therapies.",
  alternates: { canonical: "/" },
};

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
