/**
 * The slider's decision rules (D-044).
 *
 * `src/lib/slider.ts` is imported DIRECTLY as TypeScript — Node 24 strips the
 * types, and the module has no imports of its own, so there is no build step
 * and no renderer between the test and the logic under test. The DOM wiring
 * lives in `Slider.tsx`; what matters here is which slide is chosen and when
 * the timer is allowed to run, because those are the rules that decide whether
 * an administrator's "main image" choice is honoured.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTOPLAY_MS,
  initialIndex,
  shouldAutoplay,
  step,
  usableSlides,
} from "../src/lib/slider.ts";

const slide = (src, extra = {}) => ({ src, alt: `${src} alt`, ...extra });

// ---------------------------------------------------------------------------
// initialIndex — the admin's main-image choice
// ---------------------------------------------------------------------------

test("opens on the slide the admin marked as the main image", () => {
  const slides = [slide("a"), slide("b", { isDefault: true }), slide("c")];
  assert.equal(initialIndex(slides), 1);
});

test("opens on the first slide when no main image is chosen", () => {
  // The normal state of a brand-new collection, and of one whose chosen
  // default was just removed. Must behave like the old static image did.
  assert.equal(initialIndex([slide("a"), slide("b")]), 0);
});

test("honours a main image that is also the first slide", () => {
  assert.equal(initialIndex([slide("a", { isDefault: true }), slide("b")]), 0);
});

test("honours a main image in the last position", () => {
  assert.equal(initialIndex([slide("a"), slide("b"), slide("c", { isDefault: true })]), 2);
});

test("an empty collection resolves to 0 rather than -1", () => {
  // A usable index matters: -1 would render nothing and push an extra guard
  // into every call site.
  assert.equal(initialIndex([]), 0);
});

test("takes the FIRST default if data somehow carries two", () => {
  // The database forbids this (one partial unique index per collection), but
  // the reader must still be deterministic rather than render-order dependent.
  const slides = [slide("a"), slide("b", { isDefault: true }), slide("c", { isDefault: true })];
  assert.equal(initialIndex(slides), 1);
});

// ---------------------------------------------------------------------------
// step — wrap-around in both directions
// ---------------------------------------------------------------------------

test("advances to the next slide", () => {
  assert.equal(step(0, 1, 3), 1);
  assert.equal(step(1, 1, 3), 2);
});

test("wraps forward past the last slide", () => {
  assert.equal(step(2, 1, 3), 0);
});

test("🔴 wraps BACKWARD past the first slide", () => {
  // JavaScript's `%` keeps the dividend's sign, so a naive (i - 1) % len gives
  // -1 here and renders nothing at all.
  assert.equal(step(0, -1, 3), 2);
});

test("steps backward within range", () => {
  assert.equal(step(2, -1, 3), 1);
});

test("handles a step larger than the collection", () => {
  assert.equal(step(0, 7, 3), 1);
  assert.equal(step(0, -7, 3), 2);
});

test("a single slide always resolves to itself", () => {
  assert.equal(step(0, 1, 1), 0);
  assert.equal(step(0, -1, 1), 0);
});

test("an empty collection never produces a negative index", () => {
  assert.equal(step(0, 1, 0), 0);
  assert.equal(step(0, -1, 0), 0);
});

// ---------------------------------------------------------------------------
// shouldAutoplay
// ---------------------------------------------------------------------------

test("autoplays a collection of several images", () => {
  assert.equal(shouldAutoplay(3, false), true);
});

test("does not autoplay a single image", () => {
  // Nothing to advance to; a timer re-rendering one frame forever is waste.
  assert.equal(shouldAutoplay(1, false), false);
});

test("does not autoplay an empty collection", () => {
  assert.equal(shouldAutoplay(0, false), false);
});

test("🔴 does not autoplay when the visitor prefers reduced motion", () => {
  assert.equal(shouldAutoplay(5, true), false);
});

test("the autoplay interval is a sane, calm value", () => {
  // A guard against a stray edit making the hero flicker: anything under a
  // couple of seconds reads as a glitch rather than a slideshow.
  assert.ok(AUTOPLAY_MS >= 3000, `expected a calm interval, got ${AUTOPLAY_MS}`);
});

// ---------------------------------------------------------------------------
// usableSlides — keeping the page up on bad data
// ---------------------------------------------------------------------------

test("drops a slide with no src rather than rendering a broken frame", () => {
  // `next/image` throws on an empty src, which would take the whole page down
  // for one bad row.
  const out = usableSlides([slide("a"), { src: "", alt: "x" }, slide("c")]);
  assert.deepEqual(
    out.map((s) => s.src),
    ["a", "c"],
  );
});

test("an undefined collection is an empty collection", () => {
  assert.deepEqual(usableSlides(undefined), []);
});

test("preserves the main-image flag through normalisation", () => {
  const out = usableSlides([slide("a"), slide("b", { isDefault: true })]);
  assert.equal(initialIndex(out), 1);
});

test("a missing alt becomes an empty string, not undefined", () => {
  // `alt=""` is valid HTML for a decorative image; `undefined` reaching JSX
  // renders no attribute at all, which is an accessibility defect.
  const out = usableSlides([{ src: "a" }]);
  assert.equal(out[0].alt, "");
});

test("does not carry isDefault:false as a key", () => {
  // Matches what the generator emits, so a round trip through the generated
  // module and through the runtime reader produce the same object.
  const out = usableSlides([slide("a")]);
  assert.equal("isDefault" in out[0], false);
});

test("dropping a slide re-resolves the opening index correctly", () => {
  // The default survived but its POSITION moved, which is exactly the case a
  // naive "remember the index" implementation gets wrong.
  const out = usableSlides([{ src: "", alt: "gone" }, slide("b", { isDefault: true })]);
  assert.equal(out.length, 1);
  assert.equal(initialIndex(out), 0);
});
