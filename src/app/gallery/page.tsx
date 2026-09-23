import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { GalleryLightbox } from "@/components/ui/Lightbox";
import { CtaBand } from "@/components/sections/HomeSections";
import { galleryImages } from "@/content/media";

export const metadata: Metadata = {
  title: "Clinic Gallery",
  description:
    "Explore images of holistic acupuncture and acupressure therapy at Bhargavi Health World, Chikkadpally, Hyderabad. See how our treatments enhance wellness and relieve pain naturally.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Media", href: "/gallery" },
          { label: "Clinic Gallery" },
        ]}
        label="Inside the clinic"
        title={
          <>
            A look <span className="italic">around</span> the clinic
          </>
        }
        lead="Treatment rooms, therapy charts and the everyday work of natural healing in Chikkadpally."
      />

      <Section tone="ivory">
        <Wrap>
          {/* Not wrapped in <Reveal> — a transformed ancestor breaks the
              lightbox's position:fixed overlay. */}
          <GalleryLightbox images={galleryImages} />
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
