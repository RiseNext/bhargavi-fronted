import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/cn";

export function TestimonialCard({
  testimonial,
  className,
  clamp = false,
}: {
  testimonial: Testimonial;
  className?: string;
  clamp?: boolean;
}) {
  const initials = testimonial.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <figure
      className={cn(
        // Paper, not ivory: ivory is the page ground on both the home rail and
        // the testimonials index, so an ivory card disappears into it.
        "flex h-full flex-col rounded-xl border border-line bg-paper p-[clamp(1.25rem,1rem+1.1vw,1.9rem)]",
        "shadow-[0_0.75rem_1.75rem_-1rem_rgb(61_42_30/0.18)]",
        className,
      )}
    >
      <Stars />
      <blockquote
        className={cn(
          "mt-stack flex-1 text-small text-ink-2",
          clamp && "line-clamp-[7]",
        )}
      >
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-block flex items-center gap-3 border-t border-line pt-stack">
        <span
          aria-hidden="true"
          className="grid aspect-square w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-small text-ink"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body text-ink">
            {testimonial.name}
          </span>
          {testimonial.when && (
            <span className="block text-label uppercase tracking-[0.12em] text-faint">
              {testimonial.when}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function Stars() {
  return (
    <span className="flex gap-1 text-terracotta" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.92L6 8.98l-3.52 1.86.67-3.92L.3 4.14l3.94-.57L6 0Z" />
        </svg>
      ))}
    </span>
  );
}
