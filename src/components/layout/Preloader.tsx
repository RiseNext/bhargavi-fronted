"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Held at least this long so the screen never flickers past on a warm cache. */
const MIN_VISIBLE = 1200;
/** Curtain duration — must match `.pl-panel` in globals.css. */
const EXIT = 820;
/** Never hold the page hostage if `load` somehow never fires. */
const SAFETY = 6000;

/**
 * First-load curtain. Renders on the server too, so it is painted in the very
 * first frame rather than flashing in after hydration — which is the whole
 * point of a loading screen.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;

    const start = performance.now();

    const dismiss = () => {
      const held = performance.now() - start;
      holdTimer = setTimeout(
        () => {
          setLeaving(true);
          exitTimer = setTimeout(() => setDone(true), EXIT);
        },
        Math.max(0, MIN_VISIBLE - held),
      );
    };

    if (document.readyState === "complete") dismiss();
    else window.addEventListener("load", dismiss, { once: true });

    const safety = setTimeout(dismiss, SAFETY);

    return () => {
      window.removeEventListener("load", dismiss);
      clearTimeout(safety);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  // Hold the page still underneath while the curtain is up.
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  if (done) return null;

  return (
    <>
      {/* Without JS the curtain would never lift, so hide it outright. */}
      <noscript>
        <style>{`#preloader{display:none!important}`}</style>
      </noscript>

      <div
        id="preloader"
        data-leaving={leaving}
        aria-hidden="true"
        className="fixed inset-0 z-[200] overflow-hidden"
      >
        {/* Two halves that part vertically. The top overlaps by a pixel so no
            hairline seam shows at fractional viewport heights. */}
        <div className="pl-panel pl-panel-top absolute inset-x-0 top-0 h-[calc(50%+1px)] bg-brand" />
        <div className="pl-panel pl-panel-bottom absolute inset-x-0 bottom-0 top-1/2 bg-brand" />

        <div className="pl-stage absolute inset-0 grid place-items-center">
          <div className="relative grid place-items-center">
            {/* Ripples from the mark — the acupressure point made visible. */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pl-ring absolute aspect-square w-[min(21rem,62vw)] rounded-full border border-white/45"
                style={{ animationDelay: `${i * 1100}ms` }}
              />
            ))}

            <Image
              src={site.logoLockup}
              alt=""
              width={510}
              height={456}
              priority
              unoptimized
              className="pl-mark relative w-[min(15rem,46vw)] object-contain"
            />
          </div>

          {/* Hairline that draws itself across while the page settles. */}
          <span className="absolute bottom-[14vh] h-px w-[min(11rem,40vw)] overflow-hidden bg-white/20">
            <span className="pl-bar block h-full w-full bg-white/80" />
          </span>
        </div>
      </div>

      <span className="sr-only" role="status">
        {leaving ? "Loaded" : `Loading ${site.name}`}
      </span>
    </>
  );
}
