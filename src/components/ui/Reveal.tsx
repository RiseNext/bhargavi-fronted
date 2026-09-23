"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/**
 * Shared "has this scrolled into view yet" hook.
 *
 * `immediate` skips the observer and plays on mount. Use it for anything
 * above the fold: the observer's bottom root margin means content sitting at
 * the very bottom edge of the first screen is not counted as visible, so it
 * would sit blank until the visitor happened to scroll.
 */
function useInView<T extends HTMLElement>(threshold = 0.15, immediate = false) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      immediate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // A frame's grace so the browser paints the hidden state first and the
      // transition actually runs, rather than snapping straight to shown.
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, immediate]);

  return { ref, shown };
}

/** Fade + lift, once. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  /** Play on load instead of on scroll. For above-the-fold content. */
  immediate?: boolean;
}) {
  const { ref, shown } = useInView<HTMLElement>(0.15, immediate);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      data-shown={shown}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * Headline mask-wipe: the text slides up from behind a clipped edge.
 * Reserved for h1/h2 — it is the signature motion of the site.
 */
export function Wipe({
  children,
  className,
  delay = 0,
  as: Tag = "span",
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  /** Play on load instead of on scroll. For above-the-fold content. */
  immediate?: boolean;
}) {
  const { ref, shown } = useInView<HTMLElement>(0.3, immediate);

  return (
    <Tag ref={ref} className={className}>
      <span
        className="wipe"
        data-shown={shown}
        style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      >
        <span>{children}</span>
      </span>
    </Tag>
  );
}
