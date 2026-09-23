import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { VideoCard } from "@/components/cards/VideoCard";
import { CtaBand } from "@/components/sections/HomeSections";
import { videos } from "@/content/media";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Health Talks | Acupressure Treatment in Chikkadpally",
  description:
    "Watch videos on acupuncture and acupressure at Bhargavi Health World, Chikkadpally, Hyderabad. Discover expert pain relief and wellness therapies.",
  alternates: { canonical: "/videos" },
};

export default function VideosPage() {
  const youtube = site.socials.find((s) => s.name === "YouTube")!;

  return (
    <>
      <PageHero
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Media", href: "/gallery" },
          { label: "Health Talks" },
        ]}
        label="Our expert"
        title={
          <>
            Health <span className="italic">talks</span>
          </>
        }
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
              Subscribe on YouTube
            </ButtonLink>
          </Reveal>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
