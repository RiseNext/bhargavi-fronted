import type { Metadata } from "next";
import { metadataFor } from "@/lib/page-metadata";

import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/Button";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { Accordion } from "@/components/ui/Accordion";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import * as copy from "@/lib/copy";
import { branchMapsHref, getContactDetails, getFaqs, getServices } from "@/lib/content";

export const metadata: Metadata = metadataFor("contact");

type CardIcon = "phone" | "pin" | "mail" | "clock";

const CARD_ICONS: readonly CardIcon[] = ["phone", "pin", "mail", "clock"];

const isCardIcon = (value: string): value is CardIcon =>
  (CARD_ICONS as readonly string[]).includes(value);

/**
 * The editable half of one info card: its label, its call-to-action wording and
 * which icon it shows.
 *
 * `iconKey` is validated rather than cast — the admin stores a free string, and
 * an unknown key would otherwise reach `iconPaths` and render an empty `<path>`,
 * leaving a card with no icon and a green build.
 */
function infoCard(index: number): { label: string; cta: string; icon: CardIcon } {
  const where = `contact.infoCards.items[${String(index)}]`;
  const row = copy.item("contact", "infoCards", "items", index);
  const iconKey = copy.itemText(row, "iconKey", where);
  if (!isCardIcon(iconKey)) {
    throw new Error(
      `Page copy item "${where}" has iconKey "${iconKey}", which is not one of ` +
        `${CARD_ICONS.join(", ")}.`,
    );
  }
  return {
    label: copy.itemText(row, "label", where),
    cta: copy.itemText(row, "value", where),
    icon: iconKey,
  };
}

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

/**
 * The one card shell every panel in this section uses.
 *
 * 🔴 ONE shell, not four variants. The section previously tried to fit a
 * phone list, two postal addresses, an email and a set of opening hours into
 * four identical narrow columns, so each one wrapped differently and the row
 * grew to the height of the worst case. The shell now carries only the chrome
 * — icon, label, a body that grows, and one call-to-action pinned to the
 * bottom — and the CALLER decides how wide it sits and what goes inside.
 */
function InfoCard({
  icon,
  label,
  cta,
  href,
  children,
  className,
}: {
  icon: CardIcon;
  label: string;
  cta: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <div
      className={cn(
        "group flex h-full flex-col rounded-xl border border-line bg-paper p-[clamp(1.25rem,1rem+1.1vw,1.75rem)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-walnut-soft/45 hover:shadow-[0_1.25rem_2.25rem_-1.25rem_rgb(61_42_30/0.3)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid aspect-square w-10 shrink-0 place-items-center rounded-full bg-sand text-walnut transition-colors duration-400 group-hover:bg-walnut group-hover:text-ivory">
          <CardIconMark name={icon} />
        </span>
        {/* Label beside the icon rather than under it — one row less of
            vertical space, and the pairing reads immediately. */}
        <h2 className="label text-terracotta">{label}</h2>
      </div>

      <div className="mt-stack flex-1">{children}</div>

      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="underline-grow mt-stack self-start text-small font-medium text-ink"
      >
        {cta}
      </a>
    </div>
  );
}

/**
 * A phone number as its own line.
 *
 * ⚠ `whitespace-nowrap`: the number is three groups separated by spaces, so
 * a narrow column will happily break it after "+91" or mid-digits — which is
 * how "+91 70751 57013" came to render across two lines. `tabular-nums`
 * keeps the digit widths even.
 */
function PhoneNumber({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="block whitespace-nowrap font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-none tracking-[0.01em] text-ink tabular-nums transition-colors hover:text-terracotta"
    >
      {label}
    </a>
  );
}

/**
 * The email address, with its only sane break point marked.
 *
 * 🔴 It rendered as "bhargavihealthworld@gmai / l.com" — a break mid-domain,
 * because the whole address is one unbreakable token and the column had to
 * break it SOMEWHERE to fit. `<wbr>` offers a break before the "@" and
 * `break-words` takes only offered opportunities, so it splits as
 * "bhargavihealthworld / @gmail.com", or not at all when there is room.
 */
function EmailAddress({ email }: { email: string }) {
  const at = email.lastIndexOf("@");
  return (
    <a
      href={`mailto:${email}`}
      className="block break-words text-[1.0625rem] font-medium leading-snug text-ink transition-colors hover:text-terracotta"
    >
      {at > 0 ? (
        <>
          {email.slice(0, at)}
          <wbr />
          {email.slice(at)}
        </>
      ) : (
        email
      )}
    </a>
  );
}

export default async function ContactPage() {
  // 🔴 `contact` comes from the API at request time (D-042), NOT from the
  // generated `site` module. The clinic's addresses and numbers are the
  // single most likely thing the owner edits, and reading the committed file
  // meant an edit published in the admin panel showed up only after a
  // rebuild — which is how Bowenpally's address stayed invisible.
  const [faqs, services, contact] = await Promise.all([
    getFaqs(),
    getServices(),
    getContactDetails(),
  ]);

  const callCard = infoCard(0);
  const visitCard = infoCard(1);
  const emailCard = infoCard(2);
  const hoursCard = infoCard(3);

  // Only the clinics that actually have an address. A branch without one is
  // not rendered as an empty card.
  const clinics = contact.branches.filter((b) => b.address);

  return (
    <>
      {/* The lead paragraph, the Call / WhatsApp buttons and the open-status
          pill were removed here at the client's request. The banner now ends
          at the heading; the panels below carry the same numbers, hours and
          routes out. */}
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        label={copy.text("contact", "hero", "label")}
        title={copy.heading("contact", "hero")}
      />

      {/*
        Contact details.

        🔴 ONE CARD PER CLINIC, not one card per kind of detail. The four
        columns of Call / Visit / Email / Hours forced a visitor to read a
        number out of the first card and match it by eye to an address in the
        second — and it had room for only ONE address, which is why the second
        clinic was missing from the page entirely. Each clinic now carries its
        own address, its own number and its own directions link, and the two
        details that belong to the practice rather than to a branch sit in a
        narrower row beneath.

        Responsive: one column on phones, two from `sm` up for the clinics,
        two from `sm` for email and hours. Nothing relies on a four-wide row
        that only existed above 1024px.
      */}
      <Section tone="ivory" flush className="pb-section pt-block">
        <Wrap>
          <ul className="grid gap-gutter sm:grid-cols-2">
            {clinics.map((clinic, i) => {
              const mapsHref = branchMapsHref(clinic) ?? contact.mapsUrl;
              const address = clinic.address;
              return (
                <Reveal key={clinic.name} delay={i * 80} className="h-full">
                  <li className="h-full">
                    <InfoCard
                      icon={visitCard.icon}
                      label={clinic.name}
                      cta={visitCard.cta}
                      href={mapsHref}
                    >
                      {address && (
                        <address className="not-italic text-body leading-relaxed text-ink-2">
                          {address.line1}
                          <br />
                          {address.line2}
                          <br />
                          {address.city} – {address.postalCode}
                        </address>
                      )}

                      {clinic.phoneHref && (
                        <div className="mt-stack border-t border-line pt-stack">
                          <span className="mb-1.5 block text-small text-muted">
                            {callCard.label}
                          </span>
                          <PhoneNumber
                            label={clinic.phone}
                            href={clinic.phoneHref}
                          />
                        </div>
                      )}
                    </InfoCard>
                  </li>
                </Reveal>
              );
            })}
          </ul>

          <ul className="mt-gutter grid gap-gutter sm:grid-cols-2">
            <Reveal delay={160} className="h-full">
              <li className="h-full">
                <InfoCard
                  icon={emailCard.icon}
                  label={emailCard.label}
                  cta={emailCard.cta}
                  href={`mailto:${contact.email}`}
                >
                  <EmailAddress email={contact.email} />
                </InfoCard>
              </li>
            </Reveal>

            <Reveal delay={220} className="h-full">
              <li className="h-full">
                <InfoCard
                  icon={hoursCard.icon}
                  label={hoursCard.label}
                  cta={hoursCard.cta}
                  href={contact.whatsappHref}
                >
                  {contact.hours.map((h) => (
                    <div key={h.days}>
                      <span className="mb-1 block text-small text-muted">
                        {h.days}
                      </span>
                      <span className="block whitespace-nowrap text-[1.0625rem] font-medium leading-snug text-ink">
                        {h.time}
                      </span>
                    </div>
                  ))}
                  {/* Saves the visitor doing the arithmetic themselves. */}
                  <OpenStatus className="mt-3" />
                </InfoCard>
              </li>
            </Reveal>
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
                  src={contact.mapEmbedSrc}
                  /* Names the clinic the embed actually shows — D-029 resolves
                     one map for the practice, and the page now lists two. */
                  title={`Map showing ${site.name}, ${clinics[0]?.name ?? ""}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-4/3 w-full border-0 sm:aspect-16/10"
                />
                {/* The embed is not clickable through to directions, so the
                    route out sits under it. */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[clamp(1rem,0.8rem+0.8vw,1.5rem)] py-3.5">
                  <p className="text-small text-muted">
                    {copy.extra("contact", "map", "captionBelow")}
                  </p>
                  <ArrowLink href={contact.mapsUrl} external>
                    Get directions
                  </ArrowLink>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="rounded-xl bg-walnut p-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)] text-ivory/70">
                <h2 className="font-display text-h3 text-ivory">
                  {copy.heading("contact", "messageBlock")}
                </h2>
                <p className="mt-2 text-small text-ivory/55">
                  {copy.text("contact", "messageBlock", "lead")}
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
              label={copy.text("contact", "appointmentBlock", "label")}
              title={copy.text("contact", "appointmentBlock", "title")}
              lead={copy.text("contact", "appointmentBlock", "lead")}
            />
            <Reveal delay={110}>
              <div className="mt-block rounded-xl bg-paper p-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)]">
                <AppointmentForm services={services} />
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
              label={copy.text("contact", "faqSection", "label")}
              title={copy.text("contact", "faqSection", "title")}
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
