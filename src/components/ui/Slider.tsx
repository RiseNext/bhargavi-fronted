"use client";

/**
 * The image slider — autoplay, arrows, dots, keyboard (D-044).
 *
 * Replaces a single static image on the home hero and on every service page.
 * It renders through `Frame`, so radius, border, background and `object-fit`
 * stay identical to the image it replaces: with ONE slide the output is the
 * same `Frame` the page had before, with no controls and no timer. That is
 * what keeps D-010 true for every service nobody has added a collection to.
 *
 * 🔴 WHY ALL SLIDES ARE IN THE DOM, stacked and cross-faded.
 *
 * Swapping one `<Image>`'s `src` would make every advance a fresh network
 * request, so the first pass through the slider would flash a grey box on each
 * step — and the fade needs both frames present anyway. Inactive slides are
 * `opacity-0` and `aria-hidden`, so assistive technology sees exactly one
 * image. Only the opening slide is `priority`; the rest are lazy, so this
 * costs the same above-the-fold bytes as the single image did.
 *
 * ⚠ Interactivity is scoped to this component. The hero's founder portrait,
 * headline, buttons and statistics stay server-rendered — a slider is not a
 * reason to ship the whole hero to the browser.
 */

import { useCallback, useEffect, useState } from "react";
import { Frame } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import {
  AUTOPLAY_MS,
  initialIndex,
  shouldAutoplay,
  step,
  usableSlides,
  type Slide,
} from "@/lib/slider";

export function Slider({
  slides,
  label,
  className,
  sizes,
  priority = false,
  zoom = false,
  radius = "xl",
  imgClassName,
}: {
  slides: readonly Slide[] | undefined;
  /** Names the carousel for screen readers, e.g. "Acupressure treatment photos". */
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  radius?: "sm" | "md" | "lg" | "xl" | "full" | "none";
  imgClassName?: string;
}) {
  const usable = usableSlides(slides);
  const count = usable.length;

  const [index, setIndex] = useState(() => initialIndex(usable));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  /**
   * ⚠ Read in an effect, not during render. `window.matchMedia` does not exist
   * on the server, and assuming a value would make the first client render
   * disagree with the server's HTML — a hydration mismatch. Starting at
   * `false` and correcting immediately is the safe order, and the listener
   * keeps up with a preference changed while the page is open.
   */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (by: number) => setIndex((i) => step(i, by, count)),
    [count],
  );

  const autoplay = shouldAutoplay(count, reducedMotion) && !paused;

  /**
   * 🔴 The timer is cleared on every dependency change AND on unmount.
   *
   * Without the cleanup, navigating away from a service page would leave an
   * interval calling `setIndex` on an unmounted tree, and visiting several
   * service pages would stack one timer per visit.
   */
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setIndex((i) => step(i, 1, count));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, count]);

  /**
   * Hold the slideshow while a background tab is hidden.
   *
   * Browsers throttle timers in a hidden tab unevenly, so without this a
   * visitor returning after a while can find the slider mid-jump through
   * several frames at once.
   */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // An empty collection renders nothing at all. The callers that have a single
  // fallback image pass it in, so reaching here with none means there is
  // genuinely no image to show — and an empty bordered box is worse than a gap.
  if (count === 0) return null;

  const current = usable[index] ?? usable[0];
  if (current === undefined) return null;

  // ── One slide: exactly the markup this component replaced ────────────────
  if (count === 1) {
    return (
      <Frame
        src={current.src}
        alt={current.alt}
        radius={radius}
        priority={priority}
        zoom={zoom}
        {...(sizes === undefined ? {} : { sizes })}
        {...(className === undefined ? {} : { className })}
        {...(imgClassName === undefined ? {} : { imgClassName })}
      />
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Focus anywhere inside pauses too: a keyboard user stepping through the
      // dots should not be fighting an advance they did not trigger.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      {/* The stack. The container owns the aspect ratio, exactly as the single
          `Frame` did, so swapping slides cannot change the page's height. */}
      <div className={cn("relative", className)}>
        {usable.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i === index ? undefined : true}
            className={cn(
              "absolute inset-0",
              // The first slide is in flow so the box keeps its height from
              // the aspect-ratio class on the container; the rest are overlaid.
              i === 0 && "static",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
              !reducedMotion && "transition-opacity duration-700 ease-out",
            )}
          >
            <Frame
              src={slide.src}
              alt={slide.alt}
              radius={radius}
              // Only the opening frame competes with the rest of the page for
              // bandwidth; the others load as they are reached.
              priority={priority && i === index}
              zoom={zoom}
              {...(sizes === undefined ? {} : { sizes })}
              className="h-full w-full"
              {...(imgClassName === undefined ? {} : { imgClassName })}
            />
          </div>
        ))}
      </div>

      {/* Position, for assistive technology only. `polite` so it waits for a
          pause rather than interrupting whatever is being read. */}
      <p aria-live="polite" className="sr-only">
        Image {index + 1} of {count}
        {current.alt === "" ? "" : `: ${current.alt}`}
      </p>

      <Arrow side="left" onClick={() => go(-1)} />
      <Arrow side="right" onClick={() => go(1)} />

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {usable.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1} of ${count}`}
            aria-current={i === index ? "true" : undefined}
            className={cn(
              // A 24px tap target around an 8px dot: the dot is the visual, the
              // button is the thing a thumb has to hit.
              "grid h-6 w-6 place-items-center rounded-full",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-2 w-2 rounded-full transition-colors duration-300",
                i === index ? "bg-terracotta" : "bg-taupe hover:bg-muted",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A step control. Same glyph, size and hover treatment as `Lightbox`'s `Nav`,
 * recoloured for a light ground — these sit over a photograph on an ivory page
 * rather than inside a walnut overlay.
 */
function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 grid aspect-square w-10 -translate-y-1/2 place-items-center",
        "rounded-full border border-line bg-ivory/90 text-ink backdrop-blur-sm",
        "transition-colors hover:bg-ink hover:text-ivory",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <span className="sr-only">{side === "left" ? "Previous" : "Next"} image</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={side === "left" ? "rotate-180" : undefined}
      >
        <path
          d="M3 8h10m0 0L9 4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
