import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IndexRule, Section, SectionHead, Wrap } from "@/components/ui/Section";
import { Frame } from "@/components/ui/Media";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Arc } from "@/components/ui/Decor";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { whatsappUrl } from "@/lib/whatsapp";
import { CtaBand } from "@/components/sections/HomeSections";
import { services, serviceBySlug } from "@/content/services";
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

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
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
  const service = serviceBySlug(slug);
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

          <div className="mt-block grid gap-x-block gap-y-stack lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
            <Wipe as="h1" delay={80} className="max-w-[14ch] text-d2 text-ink">
              {service.title}
            </Wipe>
            <Reveal delay={200} className="lg:pb-2">
              <p className="max-w-[46ch] text-lead text-muted">{service.excerpt}</p>
            </Reveal>
          </div>

          <Reveal delay={260}>
            <dl className="mt-block grid gap-y-stack border-y border-line py-stack sm:grid-cols-3">
              {[
                { k: metaLabel(0), v: service.duration },
                // 🔴 `priceFrom` and `typicalCourse` ARE generated fields. They
                // were duplicated here as literals, so an admin price change
                // moved nothing on the page. The stored value is the complete
                // phrase "From ₹100", and this cell already labels itself
                // "From" — so the redundant prefix is dropped rather than
                // rendered twice.
                { k: metaLabel(1), v: (service.priceFrom ?? "").replace(/^From\s+/i, "") },
                { k: metaLabel(2), v: service.typicalCourse },
              ].map((row) => (
                <div key={row.k}>
                  <dt className="label text-terracotta">{row.k}</dt>
                  <dd className="mt-2 font-display text-h4 text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={320} className="group mt-block">
            <Frame
              src={service.image}
              alt={`${service.title} at ${site.name}`}
              radius="xl"
              priority
              zoom
              sizes="(min-width: 1024px) 88vw, 92vw"
              className="aspect-4/5 w-full sm:aspect-16/9"
            />
          </Reveal>
        </div>
      </section>

      {/* Body + aside */}
      <Section tone="ivory">
        <Wrap className="grid gap-block lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
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

            <div className="mt-block">
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

            <Reveal delay={160}>
              <p className="mt-block rounded-lg bg-olive-soft px-[clamp(1.1rem,0.9rem+1vw,1.75rem)] py-stack text-small text-olive">
                {copy.withLeadIn("serviceDetail", "disclaimer", "lead", "font-semibold")}
              </p>
            </Reveal>
          </div>

          {/* Sticky booking aside */}
          <aside id="book" className="lg:sticky lg:top-nav lg:self-start">
            <Reveal>
              <div className="rounded-xl border border-line bg-paper p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                <h2 className="text-h3 text-ink">Book {service.title}</h2>
                <p className="mt-2 text-small text-muted">
                  {copy.extra("serviceDetail", "bookingAside", "note")}
                </p>
                <div className="mt-block">
                  <AppointmentForm defaultService={service.slug} compact />
                </div>
              </div>

              <div className="mt-gutter rounded-xl border border-line p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                <p className="label text-terracotta">
                  {copy.text("serviceDetail", "callAside", "label")}
                </p>
                {site.phones.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="mt-2 block font-display text-h3 tabular-nums text-ink transition-colors hover:text-terracotta"
                  >
                    <span className="block text-label uppercase tracking-[0.12em] text-muted">
                      {p.branch}
                    </span>
                    {p.label}
                  </a>
                ))}
                {/* Derived from the generated hours (D-028). Was a literal. */}
                <p className="mt-stack text-small text-muted">{hoursShort}</p>
                {/* Carries the therapy name, so the clinic sees what the
                    enquiry is about before reading a word. */}
                <ButtonLink
                  href={whatsappUrl(`Enquiry about ${service.title}`)}
                  variant="outline"
                  className="mt-stack w-full"
                >
                  Ask on WhatsApp
                </ButtonLink>
              </div>
            </Reveal>
          </aside>
        </Wrap>
      </Section>

      {/* Related */}
      <Section tone="sand">
        <Wrap>
          <SectionHead
            label={copy.text("serviceDetail", "related", "label")}
            title={copy.heading("serviceDetail", "related")}
          />
          <div className="mt-block grid gap-x-gutter gap-y-block sm:grid-cols-2 lg:grid-cols-3">
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
