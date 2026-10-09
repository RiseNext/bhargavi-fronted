import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { GalleryLightbox } from "@/components/ui/Lightbox";
import { CtaBand } from "@/components/sections/HomeSections";
import { galleryImages } from "@/content/media";
import * as copy from "@/lib/copy";

export const metadata: Metadata = metadataFor("gallery");

export default function GalleryPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Media", href: "/gallery" },
          { label: "Clinic Gallery" },
        ]}
        label={copy.text("gallery", "hero", "label")}
        title={copy.heading("gallery", "hero")}
        lead={copy.text("gallery", "hero", "lead")}
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
