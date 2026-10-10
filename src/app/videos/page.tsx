import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { VideoCard } from "@/components/cards/VideoCard";
import { CtaBand } from "@/components/sections/HomeSections";
import { getVideos } from "@/lib/content";
import { site } from "@/lib/site";
import * as copy from "@/lib/copy";

export const metadata: Metadata = metadataFor("videos");

export default async function VideosPage() {
  const videos = await getVideos();
  const youtube = site.socials.find((s) => s.name === "YouTube")!;

  return (
    <>
      <PageHero
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Media", href: "/gallery" },
          { label: "Health Talks" },
        ]}
        label={copy.text("videos", "hero", "label")}
        title={copy.heading("videos", "hero")}
        lead={`${site.founder.honorific} ${site.founder.name} on pressure points, diet and the small daily fixes that make a difference. Several talks are in Telugu.`}
      />

      <Section tone="ivory">
        <Wrap>
          <div className="grid gap-x-gutter gap-y-block sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, i) => (
              <Reveal key={video.id} delay={(i % 3) * 70}>
                <VideoCard video={video} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-block flex justify-center">
            <ButtonLink href={youtube.href} variant="outline" size="lg">
              {copy.text("videos", "subscribeCta", "label")}
            </ButtonLink>
          </Reveal>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
