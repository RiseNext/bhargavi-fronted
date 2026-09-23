"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import type { Faq } from "@/content/site-content";

/** Real disclosure pattern: <button aria-expanded> controlling a region. */
export function Accordion({
  items,
  defaultOpen = 0,
  invert = false,
  className,
}: {
  items: Faq[];
  defaultOpen?: number | null;
  invert?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div
      className={cn(
        "border-t",
        invert ? "border-ivory/15" : "border-line",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-p-${i}`;
        const buttonId = `${baseId}-b-${i}`;

        return (
          <div
            key={item.question}
            className={cn("border-b", invert ? "border-ivory/15" : "border-line")}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-[clamp(1rem,3vw,2.5rem)] py-[clamp(1rem,0.8rem+0.9vw,1.5rem)] text-left"
              >
                <span
                  className={cn(
                    "font-display text-h4 transition-colors duration-300",
                    invert
                      ? isOpen
                        ? "text-ivory"
                        : "text-ivory/80"
                      : isOpen
                        ? "text-terracotta"
                        : "text-ink",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 grid aspect-square w-7 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
                    isOpen && "rotate-135",
                    invert
                      ? isOpen
                        ? "border-ivory bg-ivory text-ink"
                        : "border-ivory/30 text-ivory"
                      : isOpen
                        ? "border-ink bg-walnut text-ivory"
                        : "border-line text-ink",
                  )}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-[clamp(1rem,0.8rem+0.9vw,1.5rem)]"
            >
              <p
                className={cn(
                  "max-w-[62ch] pr-[clamp(0,4vw,3rem)] text-small",
                  invert ? "text-ivory/70" : "text-muted",
                )}
              >
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
