import Link from "next/link";
import type { Service } from "@/content/services";
import { Frame } from "@/components/ui/Media";
import { cn } from "@/lib/cn";

/**
 * A matted print: paper card, photo inset behind its walnut edge, everything
 * else reacting to one hover on the card — lift, warm shadow, photo push-in,
 * and a "View therapy" pill rising over the image.
 */
export function ServiceCard({
  service,
  index,
  className,
}: {
  service: Service;
  index?: number;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-line bg-paper p-[0.6rem]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
        "hover:-translate-y-1.5 hover:border-walnut-soft/45 hover:shadow-[0_1.5rem_2.5rem_-1.25rem_rgb(61_42_30/0.35)]",
        className,
      )}
    >
      <Frame
        src={service.image}
        alt=""
        radius="lg"
        zoom
        sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
        className="aspect-4/3 w-full"
      >
        {/* Scrim deepens so the pill stays readable over any photo. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-walnut-deep/0 transition-colors duration-500 group-hover:bg-walnut-deep/45"
        />

        {index !== undefined && (
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2.5 py-1 font-display text-label tabular-nums tracking-[0.08em] text-ink backdrop-blur-sm"
          >
            {String(index).padStart(2, "0")}
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex translate-y-3 justify-center pb-4 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-2 text-small font-medium text-ink shadow-md">
            View therapy
            <Arrow />
          </span>
        </span>
      </Frame>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-stack">
        <h3 className="text-h3 text-ink transition-colors duration-300 group-hover:text-terracotta">
          <Link
            href={`/services/${service.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {service.title}
          </Link>
        </h3>

        <p className="mt-2.5 flex-1 text-small text-muted">{service.excerpt}</p>

        <div className="mt-stack flex items-center justify-between gap-4 border-t border-line pt-3.5">
          <span className="text-label uppercase tracking-[0.14em] text-faint">
            {service.duration}
          </span>
          <span
            aria-hidden="true"
            className="grid aspect-square w-8 place-items-center rounded-full border border-line text-ink transition-[background-color,border-color,color,transform] duration-300 group-hover:translate-x-0.5 group-hover:border-walnut group-hover:bg-walnut group-hover:text-ivory"
          >
            <Arrow />
          </span>
        </div>
      </div>
    </article>
  );
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10m0 0L9 4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
