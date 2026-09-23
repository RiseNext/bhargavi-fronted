import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Rings } from "@/components/ui/Decor";
import { CtaBand } from "@/components/sections/HomeSections";

export const metadata: Metadata = {
  title: "Blog | Acupuncture Clinic in Chikkadpally",
  description:
    "Read the latest articles from Bhargavi Health World, a trusted acupuncture clinic in Chikkadpally, Hyderabad. Explore tips on acupuncture and holistic wellness.",
  alternates: { canonical: "/blog" },
};

/**
 * PLACEHOLDER — the old site's blog had no posts. The grid, single-post
 * template and `.prose` styles are ready; swap this page for a real listing
 * once content exists. See docs/CONTENT-TODO.md #8.
 */
export default function BlogPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        label="Journal"
        title={
          <>
            Notes on <span className="italic">natural</span> healing
          </>
        }
        lead="Practical writing on pressure points, diet and everyday pain relief — from the clinic floor."
      />

      <Section tone="ivory" className="overflow-clip">
        <Rings className="absolute -right-[10%] top-1/2 w-[min(24rem,45vw)] -translate-y-1/2 text-line" />
        <Wrap>
          <Reveal className="max-w-[44ch] border-t border-line pt-block">
            <p className="label text-terracotta">Coming soon</p>
            <h2 className="mt-stack text-h2 text-ink">
              The first articles are being written
            </h2>
            <p className="mt-stack text-lead text-muted">
              Acupressure points you can use at home, what to eat for joint
              pain, and what really happens in a cupping session.
            </p>
            <p className="mt-stack text-small text-muted">
              In the meantime, the Health Talks videos cover much of the same
              ground.
            </p>
            <div className="mt-block flex flex-wrap gap-3">
              <ButtonLink href="/videos">Watch Health Talks</ButtonLink>
              <ButtonLink href="/services" variant="outline">
                Browse therapies
              </ButtonLink>
            </div>
          </Reveal>
        </Wrap>
      </Section>

      <CtaBand />
    </>
  );
}
