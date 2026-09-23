import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
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
  return (
    <section
      className={cn(
        "relative overflow-clip pt-[calc(var(--spacing-nav)+var(--spacing-block))]",
        compact ? "pb-stack" : "pb-block",
      )}
    >
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
