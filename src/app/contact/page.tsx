import type { Metadata } from "next";

import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { Accordion } from "@/components/ui/Accordion";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/site";
import { faqs } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Contact | Trusted Acupuncture Clinic in Chikkadpally",
  description:
    "Reach out to Bhargavi Health World for expert acupuncture treatments in Chikkadpally, Hyderabad. Contact us for appointments, consultations, or inquiries about our pain relief and wellness services.",
  alternates: { canonical: "/contact" },
};

type CardIcon = "phone" | "pin" | "mail" | "clock";

const cards: {
  label: string;
  icon: CardIcon;
  lines: string[];
  href: string;
  cta: string;
}[] = [
  {
    label: "Call",
    icon: "phone",
    lines: site.phones.map((p) => p.label),
    href: site.phones[0].href,
    cta: "Tap to call",
  },
  {
    label: "Visit",
    icon: "pin",
    lines: [
      site.address.line1,
      site.address.line2,
      `${site.address.city} – ${site.address.postalCode}`,
    ],
    href: site.mapsUrl,
    cta: "Open in Maps",
  },
  {
    label: "Email",
    icon: "mail",
    lines: [site.email],
    href: `mailto:${site.email}`,
    cta: "Send an email",
  },
  {
    label: "Hours",
    icon: "clock",
    lines: site.hours.map((h) => `${h.days} · ${h.time}`),
    href: site.whatsapp.href,
    cta: "Message on WhatsApp",
  },
];

const iconPaths: Record<CardIcon, string> = {
  phone:
    "M14.5 11.3v2a1.3 1.3 0 0 1-1.45 1.3 13 13 0 0 1-5.62-2 12.7 12.7 0 0 1-3.9-3.9 13 13 0 0 1-2-5.65A1.3 1.3 0 0 1 2.83 1.5h2a1.3 1.3 0 0 1 1.3 1.12c.08.63.24 1.24.46 1.82a1.3 1.3 0 0 1-.29 1.37l-.85.85a10.4 10.4 0 0 0 3.9 3.9l.85-.85a1.3 1.3 0 0 1 1.37-.29c.58.22 1.19.38 1.82.46a1.3 1.3 0 0 1 1.12 1.32Z",
  pin: "M14 6.8c0 4.2-6 9.2-6 9.2s-6-5-6-9.2a6 6 0 0 1 12 0Zm-6 2.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z",
  mail: "M1.75 4.5h12.5v8.2a.8.8 0 0 1-.8.8H2.55a.8.8 0 0 1-.8-.8V4.5Zm0 .3 6.25 4.4 6.25-4.4",
  clock: "M8 1.75a6.25 6.25 0 1 1 0 12.5 6.25 6.25 0 0 1 0-12.5ZM8 4.5v3.8l2.5 1.5",
};

function CardIconMark({ name }: { name: CardIcon }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={iconPaths[name]}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        label="For appointment"
        title={
          <>
            Book a <span className="italic">consultation</span>
          </>
        }
        lead="Walk in to experience a world of exceptional care in alternate medicine — or reserve a slot so you don't have to wait."
        aside={
          /* The two things someone lands here to do, above the fold. */
          <div className="mt-stack flex flex-wrap items-center gap-3">
            <ButtonLink href={site.phones[0].href}>
              Call {site.phones[0].label}
            </ButtonLink>
            <ButtonLink href={site.whatsapp.href} variant="outline">
              WhatsApp us
            </ButtonLink>
            <OpenStatus />
          </div>
        }
      />

      {/* Info — real card surfaces. As bare rows on the ivory ground these
          four read as page background rather than as the contact details. */}
      <Section tone="ivory" flush className="pb-section pt-block">
        <Wrap>
          <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
              <Reveal key={card.label} delay={(i % 4) * 70} className="h-full">
                <li className="group flex h-full flex-col rounded-xl border border-line bg-paper p-[clamp(1.25rem,1rem+1.1vw,1.75rem)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-walnut-soft/45 hover:shadow-[0_1.25rem_2.25rem_-1.25rem_rgb(61_42_30/0.3)]">
                  <span className="grid aspect-square w-10 place-items-center rounded-full bg-sand text-walnut transition-colors duration-400 group-hover:bg-walnut group-hover:text-ivory">
                    <CardIconMark name={card.icon} />
                  </span>

                  <h2 className="mt-stack label text-terracotta">{card.label}</h2>
                  <div className="mt-2.5 flex-1 space-y-0.5 text-body text-ink-2">
                    {card.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {/* Saves the visitor doing timezone arithmetic. */}
                    {card.icon === "clock" && <OpenStatus className="mt-3" />}
                  </div>
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="underline-grow mt-stack self-start text-small font-medium text-ink"
                  >
                    {card.cta}
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>
        </Wrap>
      </Section>

      {/* Map + form — the map and message block sit left, the appointment
          form right. The form keeps the wider of the two columns. */}
      <Section tone="sand">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-gutter">
            <Reveal delay={90}>
              <div className="overflow-hidden rounded-xl border border-line bg-paper">
                <iframe
                  src={site.mapEmbedSrc}
                  title={`Map showing ${site.name}, Chikkadpally`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-4/3 w-full border-0 sm:aspect-16/10"
                />
                {/* The embed is not clickable through to directions, so the
                    route out sits under it. */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[clamp(1rem,0.8rem+0.8vw,1.5rem)] py-3.5">
                  <p className="text-small text-muted">
                    Near Pista House, Chikkadpally · Metro Pillar 1115
                  </p>
                  <ArrowLink href={site.mapsUrl} external>
                    Get directions
                  </ArrowLink>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="rounded-xl bg-walnut p-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)] text-ivory/70">
                <h2 className="font-display text-h3 text-ivory">
                  Leave a message instead
                </h2>
                <p className="mt-2 text-small text-ivory/55">
                  Not ready to book? Ask a question and we’ll reply.
                </p>
                <div className="mt-block [&_input]:border-ivory/25 [&_input]:text-ivory [&_input]:placeholder:text-ivory/35 [&_label]:text-ivory/55 [&_select]:border-ivory/25 [&_select]:text-ivory [&_textarea]:border-ivory/25 [&_textarea]:text-ivory">
                  <ContactForm tone="dark" />
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <SectionHead
              align="left"
              label="For appointment"
              title="Tell us what's troubling you"
              lead="Share a little detail and a time that suits. We call back to confirm — usually the same day."
            />
            <Reveal delay={110}>
              <div className="mt-block rounded-xl bg-paper p-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)]">
                <AppointmentForm />
              </div>
            </Reveal>
          </div>
        </Wrap>
      </Section>

      {/* FAQ */}
      <Section tone="ivory">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="lg:sticky lg:top-nav lg:self-start">
            <SectionHead
              align="left"
              label="Before you come in"
              title="Quick answers"
            />
          </div>
          <Reveal delay={90}>
            <Accordion items={faqs} />
          </Reveal>
        </Wrap>
      </Section>
    </>
  );
}
