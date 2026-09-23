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
import { CtaBand } from "@/components/sections/HomeSections";
import { services, serviceBySlug } from "@/content/services";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

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
                { k: "Session length", v: service.duration },
                { k: "From", v: "₹100" },
                { k: "Typical course", v: "2–4 sittings" },
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
            <SectionHead align="left" label="Overview" title="About this therapy" />
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
                label="Indications"
                title="What it can help with"
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
                <strong className="font-semibold">Please note:</strong> this is a
                complementary therapy. It works alongside — not instead of — the
                medical care you already receive. Bring your current
                prescriptions to your first consultation.
              </p>
            </Reveal>
          </div>

          {/* Sticky booking aside */}
          <aside id="book" className="lg:sticky lg:top-nav lg:self-start">
            <Reveal>
              <div className="rounded-xl border border-line bg-paper p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                <h2 className="text-h3 text-ink">Book {service.title}</h2>
                <p className="mt-2 text-small text-muted">
                  We call back to confirm your slot — usually the same day.
                </p>
                <div className="mt-block">
                  <AppointmentForm defaultService={service.slug} compact />
                </div>
              </div>

              <div className="mt-gutter rounded-xl border border-line p-[clamp(1.25rem,0.9rem+1.6vw,2rem)]">
                <p className="label text-terracotta">Prefer to call?</p>
                {site.phones.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="mt-2 block font-display text-h3 tabular-nums text-ink transition-colors hover:text-terracotta"
                  >
                    {p.label}
                  </a>
                ))}
                <p className="mt-stack text-small text-muted">
                  Mon–Sat · 10:00 AM – 1:30 PM and 4:00 PM – 7:30 PM
                </p>
                <ButtonLink
                  href={site.whatsapp.href}
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
          <SectionHead label="Explore more" title="Other therapies you might need" />
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
