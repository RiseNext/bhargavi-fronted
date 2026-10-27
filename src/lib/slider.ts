/**
 * Slider logic, kept pure and separate from the component (D-044).
 *
 * Everything here is a function of its arguments — no React, no DOM, no
 * timers — so the rules that decide WHICH slide shows are unit-testable
 * without a browser. `lib/content-shapes.ts` is separated from its reader for
 * the same reason: the interesting part is the transform, and a test that has
 * to boot a renderer to check an index is a test nobody runs.
 */

/** One slide. `isDefault` marks the admin-chosen opening frame. */
export interface Slide {
  src: string;
  alt: string;
  isDefault?: boolean;
}

/** How long each slide holds before advancing, in milliseconds. */
export const AUTOPLAY_MS = 6000;

/**
 * The slide the slider opens on.
 *
 * The admin-chosen default wins. With none chosen — which is the state of
 * every collection before anyone picks one, and of a collection whose default
 * was just deleted — it opens on the FIRST, which is the same thing the page
 * showed when it had a single static image.
 *
 * ⚠ Returns 0 for an empty list rather than -1. Callers that render nothing
 * for an empty collection check `length` themselves; handing back an index
 * that cannot be used would push that check into every call site.
 */
export function initialIndex(slides: readonly Slide[]): number {
  const chosen = slides.findIndex((s) => s.isDefault === true);
  return chosen === -1 ? 0 : chosen;
}

/**
 * Move `by` slides from `current`, wrapping in both directions.
 *
 * The modulo is written with `+ length` because JavaScript's `%` keeps the
 * sign of the dividend: `-1 % 3` is `-1`, not `2`, so stepping back from the
 * first slide would produce a negative index and render nothing.
 */
export function step(current: number, by: number, length: number): number {
  if (length <= 0) return 0;
  return (((current + by) % length) + length) % length;
}

/**
 * Whether the slider should advance on its own.
 *
 * Two independent reasons not to:
 *  · One slide (or none) has nothing to advance to, and a running timer that
 *    re-renders the same frame forever is pure waste.
 *  · `prefers-reduced-motion` is a user telling us that movement they did not
 *    ask for causes them problems. Manual controls stay available — the
 *    preference is about unrequested motion, not about navigation.
 */
export function shouldAutoplay(count: number, reducedMotion: boolean): boolean {
  return count > 1 && !reducedMotion;
}

/**
 * Normalise whatever the API returned into usable slides.
 *
 * 🔴 A slide with no `src` is DROPPED rather than rendered. `next/image`
 * throws on an empty src, which would take down the whole page for one bad
 * row — and a blank frame among real photographs reads as a broken site.
 * Dropping it degrades to a shorter slider, which is the recoverable outcome.
 *
 * Alt text is allowed to be empty here even though the database requires it:
 * this function's job is to keep the page up, and `alt=""` is valid HTML for
 * an image that carries no information. The admin API is where the requirement
 * is enforced.
 */
export function usableSlides(slides: readonly Slide[] | undefined): Slide[] {
  if (slides === undefined) return [];
  return slides
    .filter((s) => typeof s.src === "string" && s.src !== "")
    .map((s) => ({
      src: s.src,
      alt: typeof s.alt === "string" ? s.alt : "",
      ...(s.isDefault === true ? { isDefault: true as const } : {}),
    }));
}
