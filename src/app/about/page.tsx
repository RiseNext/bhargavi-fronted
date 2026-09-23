import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { IndexRule, Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Frame } from "@/components/ui/Media";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Rings, Seed } from "@/components/ui/Decor";
import {
  CtaBand,
  ProcessSteps,
  StatsBand,
  Testimonials,
} from "@/components/sections/HomeSections";
import { site } from "@/lib/site";
import { aboutStory, achievements } from "@/content/site-content";
import { galleryImages } from "@/content/media";

export const metadata: Metadata = {
  title: "Anjana Bhargavi | Acupuncture Therapist in Chikkadpally",
  description:
    "Anjana Bhargavi, a leading acupuncture therapist in Chikkadpally, offers expert holistic treatments at Bhargavi Health World. Restore balance and well-being with natural therapies in Hyderabad.",
  alternates: { canonical: "/about" },
};

const philosophy = [
  {
    title: "Treat the cause",
    text: "Pain is a message, not the problem. We look at posture, diet, sleep and stress before we reach for a needle.",
  },
  {
    title: "Complement, never replace",
    text: "These therapies work alongside your existing medical care. Bring your prescriptions — we build the plan around them.",
  },
  {
    title: "Teach you to self-care",
    text: "Every patient leaves knowing which points to press, what to eat, and what to do between sittings.",
  },
];

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.founder.name,
  jobTitle: site.founder.role,
  worksFor: { "@type": "MedicalClinic", name: site.name },
  image: `${site.url}${site.founder.photo}`,
  description: aboutStory[0],
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        label="Our founder"
        title={
          <>
            {site.founder.honorific} <span className="italic">Anjana</span>{" "}
            Bhargavi
          </>
        }
        lead={`${site.founder.qualifications} · ${site.founder.role}`}
      />

      {/* Story */}
      <Section tone="ivory">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="lg:sticky lg:top-nav">
            <Reveal className="group relative">
              <Frame
                src={site.founder.photo}
                alt={`${site.founder.honorific} ${site.founder.name}`}
                radius="xl"
                priority
                zoom
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="aspect-4/5 w-full"
                imgClassName="object-top"
              />
            </Reveal>

            <Reveal delay={120}>
              <dl className="mt-gutter grid gap-4 rounded-lg border border-line p-[clamp(1.1rem,0.9rem+1vw,1.75rem)] sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <dt className="label text-terracotta">Qualifications</dt>
                  <dd className="mt-2 font-display text-h4 text-ink">
                    {site.founder.qualifications}
                  </dd>
                </div>
                <div>
                  <dt className="label text-terracotta">Practising since</dt>
                  <dd className="mt-2 font-display text-h4 text-ink">2017</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <div>
            <SectionHead
              align="left"
              label="Her story"
              title="The brain child behind Bhargavi Health World"
            />
            <div className="prose mt-block">
              {aboutStory.map((para, i) => (
                <Reveal key={i} delay={i * 80} as="p">
                  {para}
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <figure className="mt-block border-t border-line pt-block">
                <Seed className="text-[1.4rem] text-olive" />
                <blockquote className="mt-stack max-w-[22ch] font-display text-h2 leading-[1.15] text-ink">
                  “The only way to do great work is to love what you do.”
                </blockquote>
                <figcaption className="mt-stack text-small text-muted">
                  The belief the clinic was built on
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={260}>
              <ButtonLink href="/contact" size="lg" className="mt-block">
                Consult with {site.founder.name.split(" ")[0]}
              </ButtonLink>
            </Reveal>
          </div>
        </Wrap>
      </Section>

      <StatsBand />

      {/* Achievements */}
      <Section tone="walnut" className="overflow-clip">
        <Rings className="absolute -right-[6%] top-1/2 w-[min(26rem,46vw)] -translate-y-1/2 text-ivory/10" />
        <Wrap>
          <SectionHead
            invert
            label="Recognition"
            title="Some key achievements"
            lead="Beyond the clinic, her work extends into lecturing, NGO service and community health."
          />
          <ol className="mt-block border-t border-ivory/15">
            {achievements.map((item, i) => (
              <Reveal key={item} delay={i * 70}>
                <li className="flex items-baseline gap-[clamp(0.75rem,2vw,2rem)] border-b border-ivory/15 py-[clamp(0.9rem,0.7rem+0.8vw,1.35rem)]">
                  <IndexRule n={i + 1} invert />
                  <p className="max-w-[60ch] text-body text-ivory/85">{item}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Wrap>
      </Section>

      {/* Philosophy */}
      <Section tone="ivory">
        <Wrap>
          <SectionHead label="Our philosophy" title="Three things we hold to" />
          <div className="mt-block grid gap-block lg:grid-cols-3">
            {philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="h-full border-t border-line pt-stack">
                  <IndexRule n={i + 1} />
                  <Wipe as="h3" className="mt-4 text-h3 text-ink">
                    {item.title}
                  </Wipe>
                  <p className="mt-3 max-w-[38ch] text-small text-muted">
                    {item.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <ProcessSteps />

      {/* The space */}
      <Section tone="sand">
        <Wrap>
          <SectionHead
            label="The space"
            title="Where treatment happens"
            lead="Clean, private treatment rooms in Chikkadpally — a two-minute walk from Metro Pillar 1115."
          />
          <div className="mt-block grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.slice(0, 4).map((img, i) => (
              <Reveal key={img.src} delay={(i % 4) * 80} className="group">
                <Frame
                  src={img.src}
                  alt={img.alt}
                  radius="lg"
                  zoom
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw"
                  className="aspect-4/5 w-full"
                />
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <Testimonials />
      <CtaBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  );
}
