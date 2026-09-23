"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Edge-to-edge horizontal scroller with arrow controls. Dragging, trackpads
 * and keyboard scrolling all still work — the arrows are an affordance on
 * top, not the only way through, and they disable at each end so the rail
 * never looks broken.
 */
export function Rail({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Names the scroll region for screen readers. */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    // `max <= 2` means everything already fits: park both arrows as disabled.
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        /* Breathing room top and bottom: `overflow-x: auto` also clips the
           Y axis, which would cut off a card's hover lift and shadow. */
        className="rail pb-6 pt-2"
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <ul className="rail-pad flex w-max gap-gutter">{children}</ul>
      </div>

      <div className="wrap mt-stack flex justify-end gap-2.5">
        <Control dir={-1} disabled={atStart} onClick={() => step(-1)} />
        <Control dir={1} disabled={atEnd} onClick={() => step(1)} />
      </div>
    </div>
  );
}

function Control({
  dir,
  disabled,
  onClick,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid aspect-square w-11 place-items-center rounded-full border border-line text-ink",
        "transition-[background-color,border-color,color,opacity] duration-300",
        "hover:border-walnut hover:bg-walnut hover:text-ivory",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      <span className="sr-only">{dir === 1 ? "Next" : "Previous"}</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={dir === -1 ? "rotate-180" : undefined}
      >
        <path
          d="M3 8h10m0 0L9 4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
