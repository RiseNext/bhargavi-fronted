import Image from "next/image";

import { Frame } from "@/components/ui/Media";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Arc, Seed } from "@/components/ui/Decor";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { IndexRule, Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

import { site } from "@/lib/site";
import { services } from "@/content/services";
import { featuredTestimonials, testimonials } from "@/content/testimonials";
import { featuredVideos, galleryImages } from "@/content/media";
import {
  faqs,
  homeIntro,
  process,
  stats,
  whyChooseUs,
} from "@/content/site-content";
import * as copy from "@/lib/copy";

/* ================================================================
   Intro — asymmetric editorial split
   ================================================================ */

export function Intro() {
  // D-027's two `home.intro` image rows, in sort_order: the tall lead image and
  // the square one beside the Since card.
  const lead = copy.item("home", "intro", "images", 0);
  const square = copy.item("home", "intro", "images", 1);
  const since = copy.extraObject("home", "intro", "sinceCard");
  const introCta = copy.action("home", "intro");

  return (
    <Section tone="ivory">
      <Wrap className="grid gap-x-block gap-y-block lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="group relative">
          <Reveal>
            <Frame
              src={copy.itemText(lead, "image", "home.intro.images[0]")}
              alt={copy.itemText(lead, "alt", "home.intro.images[0]")}
              radius="xl"
              zoom
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="aspect-4/5 w-full"
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-gutter grid grid-cols-2 gap-gutter">
              <Frame
                src={copy.itemText(square, "image", "home.intro.images[1]")}
                alt={copy.itemText(square, "alt", "home.intro.images[1]")}
                radius="lg"
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="aspect-square w-full"
              />
              <div className="flex flex-col justify-between rounded-lg border border-line p-[clamp(1rem,0.8rem+0.9vw,1.5rem)]">
                <span className="label text-terracotta">{since.label}</span>
                <span className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-none text-ink">
                  {since.value}
                </span>
                <span className="text-small text-muted">{since.caption}</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:pt-block">
          <SectionHead
            align="left"
            label={copy.text("home", "intro", "label")}
            title={copy.heading("home", "intro")}
          />

          <Reveal delay={120}>
            <p className="mt-stack max-w-[52ch] text-lead text-muted">{homeIntro}</p>
          </Reveal>

          <ul className="mt-block divide-y divide-line border-y border-line">
            {copy.items("home", "intro", "bulletList").map((row, i) => {
              const bullet = copy.itemText(row, "text", "home.intro.bulletList");
              return (
                <Reveal key={bullet} delay={i * 80}>
                  <li className="flex items-baseline gap-[clamp(0.75rem,2vw,1.5rem)] py-4">
                    <IndexRule n={i + 1} />
                    <span className="text-body text-ink-2">{bullet}</span>
                  </li>
                </Reveal>
              );
            })}
          </ul>

          <Reveal delay={200}>
            <div className="mt-block flex flex-wrap items-center gap-x-block gap-y-stack">
              <ButtonLink href={introCta.href}>{introCta.label}</ButtonLink>
              <div className="flex items-center gap-3">
                <Image
                  src={site.founder.photo}
                  alt=""
                  width={48}
                  height={48}
                  className="img-edge-thin aspect-square w-11 rounded-full object-cover object-top"
                />
                <span className="text-small">
                  <span className="block text-ink">{site.founder.name}</span>
                  <span className="block text-muted">{site.founder.role}</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Therapies — editorial index rows
   ================================================================ */

export function TherapyIndex() {
  return (
    <Section tone="paper" id="therapies" className="overflow-clip">
      <Wrap>
        <SectionHead
          label={copy.text("home", "therapyIndex", "label")}
          title={copy.heading("home", "therapyIndex")}
          lead={copy.text("home", "therapyIndex", "lead")}
          action={
            <ArrowLink href={copy.action("home", "therapyIndex").href}>
              {copy.action("home", "therapyIndex").label}
            </ArrowLink>
          }
        />
      </Wrap>

      {/* One line, scrolled — the ten therapies read as a set rather than a
          list you have to wade down. */}
      <Rail label="Therapies" className="mt-block">
        {services.map((service, i) => (
          <li key={service.slug} className="w-[min(21rem,78vw)]">
            <Reveal delay={Math.min(i, 3) * 70} className="h-full">
              <ServiceCard service={service} index={i + 1} className="h-full" />
            </Reveal>
          </li>
        ))}
      </Rail>
    </Section>
  );
}

/* ================================================================
   Stats
   ================================================================ */

export function StatsBand() {
  return (
    <Section tone="ivory" className="py-block">
      <Wrap>
        <dl className="grid gap-y-block sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className="border-t border-line pt-stack lg:border-l lg:border-t-0 lg:pl-gutter lg:pt-0 lg:first:border-l-0 lg:first:pl-0"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)] leading-none tracking-tight text-ink">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="mt-3 block text-label uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Why us — bento
   ================================================================ */

export function WhyUs() {
  return (
    <Section tone="ivory">
      <Wrap>
        <SectionHead
          label={copy.text("home", "whyUs", "label")}
          title={copy.heading("home", "whyUs")}
          action={
            <ArrowLink href={copy.action("home", "whyUs").href}>
              {copy.action("home", "whyUs").label}
            </ArrowLink>
          }
        />

        <div className="mt-block grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 80} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-paper p-[clamp(1.35rem,1.1rem+1.2vw,2rem)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-walnut-soft/45 hover:shadow-[0_1.5rem_2.5rem_-1.25rem_rgb(61_42_30/0.3)]">
                {/* Oversized ghost numeral — depth without another image. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 font-display text-[6rem] leading-none text-ink/[0.045] transition-[color,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1 group-hover:text-terracotta/[0.09]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Source icons are white on transparent, so the disc stays dark. */}
                <span className="relative grid aspect-square w-[clamp(2.75rem,2.3rem+1.4vw,3.5rem)] place-items-center rounded-full bg-walnut transition-[background-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 group-hover:bg-terracotta">
                  <Image
                    src={item.icon}
                    alt=""
                    width={26}
                    height={26}
                    className="w-[55%] object-contain"
                  />
                </span>

                <h3 className="relative mt-block text-h4 text-ink transition-colors duration-300 group-hover:text-terracotta">
                  {item.title}
                </h3>
                <p className="relative mt-2.5 flex-1 text-small text-muted">
                  {item.text}
                </p>

                {/* Accent rule draws itself in on hover. */}
                <span
                  aria-hidden="true"
                  className="relative mt-stack h-px origin-left scale-x-0 bg-terracotta transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100"
                />
              </article>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Process
   ================================================================ */

export function ProcessSteps() {
  return (
    <Section tone="paper">
      <Wrap>
        <SectionHead
          label={copy.text("global", "processSteps", "label")}
          title={copy.heading("global", "processSteps")}
          lead={copy.text("global", "processSteps", "lead")}
        />

        {/**
         * A connected track rather than four loose columns: the line runs
         * through every node, so the four steps read as one journey. It turns
         * vertical below `lg`, where a horizontal track would not fit.
         */}
        <ol className="relative mt-block grid gap-y-block lg:grid-cols-4 lg:gap-x-gutter">
          {/* The track itself. Vertical down the nodes until `lg`, where it
              lies flat across them. The node rings punch it out. */}
          <span
            aria-hidden="true"
            className="absolute left-[1.15rem] top-3 h-[calc(100%-1.5rem)] w-px bg-line lg:left-0 lg:top-[1.15rem] lg:h-px lg:w-full"
          />

          {process.map((item, i) => (
            <Reveal
              as="li"
              key={item.step}
              delay={i * 100}
              className="group relative h-full pl-[3.5rem] lg:pl-0"
            >
              <span className="absolute left-0 top-0 z-10 grid aspect-square w-[clamp(2.25rem,2rem+0.9vw,2.5rem)] place-items-center rounded-full bg-walnut font-display text-small text-ivory ring-[0.4rem] ring-paper transition-[background-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110 group-hover:bg-terracotta lg:static">
                {item.step}
              </span>

              <div className="lg:mt-stack">
                <h3 className="text-h4 text-ink transition-colors duration-300 group-hover:text-terracotta">
                  {item.title}
                </h3>
                <p className="mt-2.5 max-w-[34ch] text-small text-muted">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Testimonials — feature quote + rail
   ================================================================ */

export function Testimonials() {
  return (
    <Section tone="ivory" className="overflow-clip">
      <Wrap>
        {/**
         * 🔴 The action label stays an EXPRESSION. `All {testimonials.length}
         * reviews` tracks the collection; a stored "All 23 reviews" would go
         * stale the moment a review is added or hidden. Only the destination is
         * stored, so `cta_label` is NULL here and migration 013 permits it —
         * see scripts/seed/code-owned-fields.ts. The href still comes from the
         * database, so the stored half is not orphaned.
         */}
        <SectionHead
          label={copy.text("home", "testimonials", "label")}
          title={copy.heading("home", "testimonials")}
          action={
            <ArrowLink href={copy.destination("home", "testimonials")}>
              All {testimonials.length} reviews
            </ArrowLink>
          }
        />

      </Wrap>

      <div className="rail mt-block pb-6 pt-2">
        <ul className="rail-pad flex w-max gap-gutter">
          {featuredTestimonials.map((t, i) => (
            <li key={t.name} className="w-[min(24rem,78vw)]">
              <Reveal delay={i * 60} className="h-full">
                <TestimonialCard testimonial={t} clamp className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ================================================================
   Appointment
   ================================================================ */

export function AppointmentBand() {
  /**
   * The three contact rows. Only the LABELS are stored — every value and href
   * is a live expression (`site.phones[0]`, `site.whatsapp.href`,
   * `site.address.full`, `site.mapsUrl`), and freezing any of them would stop
   * the row tracking the branch record it comes from. The arrays are zipped by
   * position, so a stored row count that no longer matches the code is a build
   * failure rather than a silently mislabelled row.
   */
  const rowLabels = copy.items("home", "appointmentBand", "rows");
  const rowTargets = [
    { v: site.phones[0].label, href: site.phones[0].href },
    { v: "Chat with the clinic", href: site.whatsapp.href },
    { v: site.address.full, href: site.mapsUrl },
  ];
  if (rowLabels.length !== rowTargets.length) {
    throw new Error(
      `home.appointmentBand.rows holds ${String(rowLabels.length)} row(s) but the ` +
        `component supplies ${String(rowTargets.length)} destination(s).`,
    );
  }

  return (
    <Section tone="walnut" id="appointment" className="overflow-clip">
      <Arc className="absolute -left-[10%] bottom-[-10%] w-[min(34rem,60vw)] rotate-180 text-ivory/12" />
      <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <SectionHead
            align="left"
            invert
            label={copy.text("home", "appointmentBand", "label")}
            title={copy.heading("home", "appointmentBand")}
            lead={copy.text("home", "appointmentBand", "lead")}
          />

          <ul className="mt-block divide-y divide-ivory/15 border-y border-ivory/15">
            {rowTargets.map((target, i) => ({
              k: copy.itemText(
                copy.item("home", "appointmentBand", "rows", i),
                "label",
                `home.appointmentBand.rows[${String(i)}]`,
              ),
              ...target,
            })).map((row, i) => (
              <Reveal key={row.k} delay={i * 80}>
                <li>
                  <a
                    href={row.href}
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group grid gap-1 py-4 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] sm:items-baseline sm:gap-4"
                  >
                    <span className="label text-terracotta-soft">{row.k}</span>
                    <span className="text-body text-ivory/85 transition-colors group-hover:text-ivory">
                      {row.v}
                    </span>
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={140}>
          <div className="rounded-xl bg-ivory p-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)] text-ink-2">
            <h3 className="text-h3 text-ink">
              {copy.extra("home", "appointmentBand", "formCardTitle")}
            </h3>
            <p className="mt-2 text-small text-muted">
              {copy.noteWithRequiredGlyph("home", "appointmentBand", "formCardNote")}
            </p>
            <div className="mt-block">
              <AppointmentForm />
            </div>
          </div>
        </Reveal>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Health talks
   ================================================================ */

export function HealthTalks() {
  return (
    <Section tone="sand">
      <Wrap>
        {/* The lead stays an expression: it names the founder, so a stored copy
            would stop tracking site_settings (D-040). */}
        <SectionHead
          label={copy.text("home", "healthTalks", "label")}
          title={copy.heading("home", "healthTalks")}
          lead={`${site.founder.honorific} ${site.founder.name} on pressure points, diet and the small daily fixes that make a difference.`}
          action={
            <ArrowLink href={copy.action("home", "healthTalks").href}>
              {copy.action("home", "healthTalks").label}
            </ArrowLink>
          }
        />

        <div className="mt-block grid gap-x-gutter gap-y-block sm:grid-cols-2 lg:grid-cols-3">
          {featuredVideos.slice(0, 6).map((video, i) => (
            <Reveal key={video.id} delay={(i % 3) * 80}>
              <VideoCard video={video} />
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Gallery rail
   ================================================================ */

export function GalleryRail() {
  return (
    <Section tone="sand" className="overflow-clip">
      <Wrap>
        <SectionHead
          label="Inside the clinic"
          title="A calm, private place to heal"
          action={<ArrowLink href="/gallery">View gallery</ArrowLink>}
        />
      </Wrap>

      <div className="rail mt-block pb-4">
        <ul className="rail-pad flex w-max gap-gutter">
          {galleryImages.slice(0, 6).map((img, i) => (
            <li key={img.src} className="group">
              <Reveal delay={i * 60}>
                <Frame
                  src={img.src}
                  alt={img.alt}
                  radius="lg"
                  zoom
                  sizes="min(24rem, 76vw)"
                  className="aspect-4/3 w-[min(24rem,76vw)]"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ================================================================
   FAQ
   ================================================================ */

export function FaqSection() {
  return (
    <Section tone="ivory">
      <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-nav lg:self-start">
          <SectionHead
            align="left"
            label={copy.text("home", "faqSection", "label")}
            title={copy.heading("home", "faqSection")}
            lead={copy.text("home", "faqSection", "lead")}
            action={
              <ButtonLink href={copy.action("home", "faqSection").href} variant="outline">
                {copy.action("home", "faqSection").label}
              </ButtonLink>
            }
          />
        </div>

        <Reveal delay={90}>
          <Accordion items={faqs} />
        </Reveal>
      </Wrap>
    </Section>
  );
}

/* ================================================================
   Closing CTA
   ================================================================ */

/**
 * Minimal closing band: copy left, actions right, one row on desktop. The
 * photographic background and display-size headline were doing the work of a
 * second hero this close to the footer.
 */
export function CtaBand() {
  return (
    <section className="relative isolate overflow-clip bg-walnut">
      <div className="wrap flex flex-col gap-stack py-block lg:flex-row lg:items-center lg:justify-between lg:gap-block">
        <Reveal>
          <p className="label text-terracotta-soft">
            <Seed />
            {copy.text("global", "ctaBand", "label")}
          </p>
          <h2 className="mt-2.5 max-w-[24ch] font-display text-h3 text-ivory">
            {copy.heading("global", "ctaBand")}
          </h2>
          <p className="mt-2 max-w-[46ch] text-small text-ivory/60">
            {copy.text("global", "ctaBand", "lead")}
          </p>
        </Reveal>

        <Reveal delay={120} className="shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href={copy.action("global", "ctaBand").href} variant="inverse">
              {copy.action("global", "ctaBand").label}
            </ButtonLink>
            {/**
             * 🔴 BOTH halves of this second CTA are code-owned, by the owner's
             * decision on D-040. `site.phones[0].href` must stay a runtime
             * expression — D-013 gives phones their own `phone_sort_order`, so a
             * stored href would silently point at the wrong branch the moment
             * that ordering changes — and the label `Call {…label}` tracks it.
             * `cta2_label` and `cta2_href` are therefore both NULL in the
             * database and absent from `pageCopy`. Do not "finish wiring" this.
             */}
            <ButtonLink
              href={site.phones[0].href}
              variant="outline"
              className="border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory hover:text-ink"
            >
              Call {site.phones[0].label}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
