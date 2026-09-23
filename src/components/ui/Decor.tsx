import { cn } from "@/lib/cn";

/**
 * Decorative marks. Deliberately spare — the v2 design gets its character
 * from type, whitespace and hairlines, not from ornament. Everything here
 * is aria-hidden and non-interactive.
 */

/** Small seed/leaf glyph used beside labels. */
export function Seed({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={cn("size-[1em] shrink-0", className)}
    >
      <path
        d="M11 1c0 5.2-3.4 9-9.4 9.6C1 5.4 4.6 1.4 11 1Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Concentric rings — a quiet nod to pressure points. */
export function Rings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="0.75" />
      <circle
        cx="100"
        cy="100"
        r="70"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 6"
      />
      <circle cx="100" cy="100" r="41" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  );
}

/** Thin arc used as a quiet corner accent. */
export function Arc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <path
        d="M239 120A119 119 0 0 1 120 239"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path
        d="M199 120a79 79 0 0 1-79 79"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="2 7"
      />
    </svg>
  );
}

/** Dotted hairline, used between process steps. */
export function DottedRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_10px)]",
        className,
      )}
    />
  );
}
