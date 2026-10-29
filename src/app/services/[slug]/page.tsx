import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IndexRule, Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Slider } from "@/components/ui/Slider";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { Arc } from "@/components/ui/Decor";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { BookingSheet } from "@/components/forms/BookingSheet";
import { CtaBand } from "@/components/sections/HomeSections";
import { getContactDetails, getServiceBySlug, getServices } from "@/lib/content";
import { site } from "@/lib/site";
import { breadcrumbList, serialiseJsonLd } from "@/lib/schema";
import { hoursShort } from "@/lib/hours";
import * as copy from "@/lib/copy";

type Params = { params: Promise<{ slug: string }> };

/**
 * The three meta-row labels, in `sort_order`.
 *
 * Only the labels are stored. Every VALUE is a live `service` field —
 * `duration`, `priceFrom`, `typicalCourse` — so storing those here would
 * duplicate the services collection and let a price edit move one surface but
 * not the other.
 */
const metaLabel = (index: number): string =>
  copy.itemText(
    copy.item("serviceDetail", "metaRow", "items", index),
    "label",
    `serviceDetail.metaRow.items[${String(index)}]`,
  );

export async function generateStaticParams() {
  // Prerenders the published set. `dynamicParams` stays at its default (true),
  // so a service added after this build renders on demand rather than 404ing.
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: `${service.title} in Chikkadpally, Hyderabad`,
    description: service.excerpt,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { images: [{ url: service.image }] },
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const [service, services, contact] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getContactDetails(),
  ]);
  // 🔴 An unpublished service is absent from the reader, so revalidating the
  // `services` tag turns its prerendered page into a genuine 404.
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  // Exactly the three crumbs the <nav aria-label="Breadcrumb"> below renders.
  const crumbSchema = breadcrumbList(site.url, [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: service.title },
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    name: service.title,
    description: service.excerpt,
    url: `${site.url}/services/${service.slug}`,
    provider: { "@type": "MedicalClinic", name: site.name, url: site.url },
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-clip pb-block pt-[calc(var(--spacing-nav)+var(--spacing-block))]">
        <Arc className="absolute -right-[14%] -top-[16%] w-[min(38rem,66vw)] text-line" />

        <div className="wrap">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted">
                <li>
                  <Link href="/" className="underline-grow hover:text-ink">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-faint">
                  /
                </li>
                <li>
                  <Link href="/services" className="underline-grow hover:text-ink">
                    Services
                  </Link>
                </li>
                <li aria-hidden="true" className="text-faint">
                  /
                </li>
                <li aria-current="page" className="text-ink">
                  {service.title}
                </li>
              </ol>
            </nav>
          </Reveal>

          {/* The heading used to sit alone with the whole right half of the
              screen empty. The meta box fills it, and on a phone the booking
              button takes the place of the form column. */}
          <div className="mt-block grid gap-x-block gap-y-stack lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
            <div>
              <Wipe as="h1" delay={80} className="max-w-[14ch] text-d2 text-ink">
                {service.title}
              </Wipe>
              <Reveal delay={200}>
                <p className="mt-stack max-w-[46ch] text-lead text-muted">{service.excerpt}</p>
              </Reveal>

              {/* Phone only — the desktop form is its own column further down. */}
              <Reveal delay={260} className="mt-stack lg:hidden">
                <BookingSheet
                  services={services}
                  branches={contact.branches}
                  defaultService={service.slug}
                  title={service.title}
                  note={copy.extra("serviceDetail", "bookingAside", "note")}
                />
              </Reveal>
            </div>

            <Reveal delay={320}>
              {/*
                Session length carries the row above on its own; the two
                shorter facts split the row below it. A single straight line of
                three cells made the values tiny and the box read as a toolbar.

                🔴 `priceFrom` and `typicalCourse` ARE generated fields. They
                were duplicated here as literals, so an admin price change moved
                nothing on the page. The stored value is the complete phrase
                "From ₹100", and its cell already labels itself "From" — so the
                redundant prefix is dropped rather than rendered twice.
              */}
              <dl className="overflow-hidden rounded-xl border border-line bg-paper text-center">
                <div className="px-[clamp(1rem,0.7rem+1.2vw,1.75rem)] py-[clamp(1.1rem,0.85rem+1vw,1.6rem)]">
                  <dt className="text-label uppercase tracking-[0.12em] text-terracotta">
                    {metaLabel(0)}
                  </dt>
                  <dd className="mt-2 font-display text-[clamp(1.45rem,1.15rem+1.4vw,2.25rem)] leading-tight text-ink">
                    {service.duration || "—"}
                  </dd>
                </div>

                <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
                  {[
                    { k: metaLabel(1), v: (service.priceFrom ?? "").replace(/^From\s+/i, "") },
                    { k: metaLabel(2), v: service.typicalCourse },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="px-[clamp(0.7rem,0.45rem+1vw,1.5rem)] py-[clamp(1rem,0.8rem+0.9vw,1.5rem)]"
                    >
                      <dt className="text-label uppercase tracking-[0.12em] text-terracotta">
                        {row.k}
                      </dt>
                      <dd className="mt-2 font-display text-[clamp(1.05rem,0.85rem+1vw,1.6rem)] leading-snug text-ink">
                        {row.v || "—"}
                      </dd>
                    </div>
                  ))}
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Photo and booking share a row; everything written about the
          therapy runs underneath both, full width. */}
      <Section tone="ivory">
        <Wrap>
          <div className="grid gap-block lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
            <div>
              <Reveal>
                {/*
                  D-044 — this service's own slider.

                  🔴 `service.images ?? [single]`. Every service keeps its own
                  independent collection, and a service with none falls back to
                  the single `service.image` it has always shown. `Slider`
                  renders a one-slide collection as a plain `Frame`, so that
                  fallback is the exact markup this replaced.

                  ⚠ The alt text differs by source on purpose: a collection's
                  slides carry admin-authored alt describing THAT photograph,
                  while the fallback keeps the derived "{title} at {site}"
                  string the page used before. Overwriting authored alt with a
                  derived one would be a regression in exactly the field
                  screen-reader users depend on.

                  Square box + `contain`: the therapy photos are 466x466, so
                  they land in here whole, and a landscape slide letterboxes on
                  the sand rather than losing its top and bottom to a crop.
                  `zoom` is deliberately off — scaling the photo inside a
                  clipped frame sliced its edges away on hover.
                */}
                <Slider
                  slides={
                    service.images ?? [
                      { src: service.image, alt: `${service.title} at ${site.name}` },
                    ]
                  }
                  label={`${service.title} photos`}
                  radius="xl"
                  priority
                  fit="contain"
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className="aspect-square w-full"
                />
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-gutter rounded-xl border border-line p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                  <p className="label text-terracotta">
                    {copy.text("serviceDetail", "callAside", "label")}
                  </p>
                  <div className="mt-stack grid gap-stack sm:grid-cols-2 lg:grid-cols-1">
                    {site.phones.map((p) => (
                      <a
                        key={p.href}
                        href={p.href}
                        className="block font-display text-h3 tabular-nums text-ink transition-colors hover:text-terracotta"
                      >
                        <span className="block text-label uppercase tracking-[0.12em] text-muted">
                          {p.branch}
                        </span>
                        {p.label}
                      </a>
                    ))}
                  </div>
                  {/* Derived from the generated hours (D-028). Was a literal. */}
                  <p className="mt-stack text-small text-muted">{hoursShort}</p>
                  {/* 🔴 The "Ask on WhatsApp" button was removed here at the
                      client's request. It was also the last caller of
                      `whatsappUrl` with no branch argument, so it silently
                      addressed one clinic's line — the same defect the contact
                      form's branch step exists to fix. The appointment form
                      beside this asks which branch and carries the therapy
                      name with it, so nothing is lost. */}
                </div>
              </Reveal>
            </div>

            {/* Below `lg` this column is replaced by the bottom sheet behind
                the hero's booking button — one form on the page either way. */}
            <aside id="book" className="hidden lg:sticky lg:top-nav lg:block lg:self-start">
              <Reveal delay={120}>
                <div className="rounded-xl border border-line bg-paper p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                  <h2 className="text-h3 text-ink">Book {service.title}</h2>
                  <p className="mt-2 text-small text-muted">
                    {copy.extra("serviceDetail", "bookingAside", "note")}
                  </p>
                  <div className="mt-block">
                    <AppointmentForm
                      services={services}
                      branches={contact.branches}
                      defaultService={service.slug}
                      compact
                    />
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>

          <div className="mt-block grid gap-x-block gap-y-block lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
            <div>
              <SectionHead
                align="left"
                label={copy.text("serviceDetail", "overview", "label")}
                title={copy.heading("serviceDetail", "overview")}
              />
              <div className="prose mt-block">
                {service.body.map((para, i) => (
                  <Reveal key={i} delay={i * 70} as="p">
                    {para}
                  </Reveal>
                ))}
              </div>
            </div>

            <div>
              <SectionHead
                align="left"
                label={copy.text("serviceDetail", "indications", "label")}
                title={copy.heading("serviceDetail", "indications")}
              />
              <ul className="mt-block border-t border-line">
                {service.treats.map((item, i) => (
                  <Reveal key={item} delay={i * 60}>
                    <li className="flex items-baseline gap-[clamp(0.75rem,2vw,1.5rem)] border-b border-line py-3.5">
                      <IndexRule n={i + 1} />
                      <span className="text-body text-ink-2">{item}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>

          <Reveal delay={160}>
            <p className="mt-block rounded-lg bg-olive-soft px-[clamp(1.1rem,0.9rem+1vw,1.75rem)] py-stack text-small text-olive">
              {copy.withLeadIn("serviceDetail", "disclaimer", "lead", "font-semibold")}
            </p>
          </Reveal>
        </Wrap>
      </Section>

      {/* Related */}
      <Section tone="sand">
        <Wrap>
          <SectionHead
            label={copy.text("serviceDetail", "related", "label")}
            title={copy.heading("serviceDetail", "related")}
          />
          <div className="mt-block grid gap-x-gutter gap-y-block sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            {related.map((s, i) => (
              <Reveal key={s.slug} delay={i * 90}>
                <ServiceCard service={s} className="h-full" />
              </Reveal>
            ))}
          </div>
        </Wrap>
      </Section>

      <CtaBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(schema) }}
      />

      {/*
        `BreadcrumbList` — E18 / S-3.

        🔴 Emitted here rather than inherited from `PageHero`, because this page
        renders its OWN breadcrumb nav (the trail ends in the service title, so
        it could not use the shared banner). The three names below are read off
        that nav verbatim — "Home", "Services", `service.title` — so the markup
        and the visible trail cannot disagree.

        The other seven breadcrumb pages get theirs from `PageHero`. One emitter
        per page, never both: this page does not use PageHero.
      */}
      {crumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(crumbSchema) }}
        />
      )}
    </>
  );
}
