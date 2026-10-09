import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { breadcrumbList, serialiseJsonLd } from "@/lib/schema";
import { Arc } from "./Decor";
import { Reveal, Wipe } from "./Reveal";

/** Inner-page banner. Clears the fixed header with fluid top padding. */
export function PageHero({
  label,
  title,
  lead,
  breadcrumb,
  aside,
  compact = false,
}: {
  label?: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb: { label: string; href?: string }[];
  aside?: ReactNode;
  /**
   * Trims the banner to breadcrumb + a single-line heading, for pages whose
   * content should start straight away rather than after a wall of copy.
   */
  compact?: boolean;
}) {
  /*
   * `BreadcrumbList` JSON-LD — E18 / S-3.
   *
   * 🔴 Emitted HERE rather than from each page, because this component already
   * receives the exact trail it renders. Any per-page copy would be a second
   * source of truth for the same names, and the two would drift — the markup
   * would then describe a hierarchy the visitor cannot see, which is precisely
   * what structured-data penalties are for.
   *
   * Consequences that fall out of this placement, all of them wanted:
   *   · it appears only on pages that actually have breadcrumbs, because only
   *     those pages render a PageHero;
   *   · the names are the rendered names, by construction;
   *   · there is exactly one BreadcrumbList per page, so nothing conflicts.
   *
   * `breadcrumbList` returns undefined for a trail shorter than two crumbs, so
   * a lone "Home" emits nothing. URLs resolve against `site.url`, which is
   * `NEXT_PUBLIC_SITE_URL` when set.
   *
   * Adds no visible output and no layout (D-010).
   */
  const crumbSchema = breadcrumbList(
    site.url,
    breadcrumb.map((crumb) => ({ name: crumb.label, href: crumb.href })),
  );

  return (
    <section
      className={cn(
        "relative overflow-clip pt-[calc(var(--spacing-nav)+var(--spacing-block))]",
        compact ? "pb-stack" : "pb-block",
      )}
    >
      {crumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(crumbSchema) }}
        />
      )}

      <Arc className="absolute -right-[14%] -top-[18%] w-[min(38rem,66vw)] text-line" />

      <div className="wrap">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-faint">
                      /
                    </span>
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} className="underline-grow hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-ink">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        <div
          className={cn(
            "grid gap-x-block gap-y-stack lg:items-end",
            compact
              ? "mt-stack"
              : "mt-block lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
          )}
        >
          <div>
            {label && (
              <Reveal delay={60}>
                <p className="label text-terracotta">{label}</p>
              </Reveal>
            )}
            <Wipe
              as="h1"
              delay={120}
              className={cn(
                "mt-stack text-ink",
                compact ? "max-w-[24ch] text-h1" : "max-w-[16ch] text-d2",
              )}
            >
              {title}
            </Wipe>
          </div>

          {(lead || aside) && (
            <Reveal delay={240} className="lg:pb-2">
              {lead && (
                <p className="max-w-[46ch] text-lead text-muted">{lead}</p>
              )}
              {aside}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
