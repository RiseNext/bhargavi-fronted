"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { AppointmentForm } from "./AppointmentForm";
import type { ChoosableBranch } from "./BranchChoice";
import type { Service } from "@/content/services";

/**
 * Phone-only booking.
 *
 * On a wide screen the appointment form sits beside the therapy photo, so
 * there is room for it. On a phone that column would push the whole page
 * down, so the form lives behind this button and rises as a bottom sheet —
 * the same motion, scrim and dismiss rules as the mobile site menu, so the
 * two gestures feel like one system.
 */
export function BookingSheet({
  services,
  branches,
  defaultService,
  title,
  note,
  label = "Book this therapy",
  className,
}: {
  services: readonly Service[];
  branches: readonly ChoosableBranch[];
  defaultService: string;
  /** Therapy name — used in the sheet heading and the dialog label. */
  title: string;
  note: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  /* The sheet is portalled to <body>: every ancestor here is inside a
     `Reveal`, whose lift transform would otherwise become the containing
     block for a fixed child and trap the sheet mid-page. */
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // Scroll lock + Esc + focus trap while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea',
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusable();
      if (!f?.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    focusable()?.[0]?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const sheet = (
    <div
      id="booking-sheet"
      className={cn(
        "fixed inset-0 z-[75] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
      /* Keeps the form's fields out of the tab order while it is shut. */
      inert={!open}
    >
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-walnut-deep/40 transition-opacity duration-400",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Book ${title}`}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-xl bg-ivory transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Grab handle — the affordance that says "this came up, it can go
            back down", matching the menu sheet. */}
        <span
          aria-hidden="true"
          className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line"
        />

        <div className="flex shrink-0 items-start justify-between gap-4 px-gutter pb-2 pt-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-h4 text-ink">Book {title}</h2>
            <p className="mt-1 text-small text-muted">{note}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-grid aspect-square w-10 shrink-0 place-items-center rounded-full border border-line text-ink"
          >
            <span className="sr-only">Close</span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path
                d="M1 1l11 11M12 1L1 12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-stack">
          <AppointmentForm
            services={services}
            branches={branches}
            defaultService={defaultService}
            compact
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="booking-sheet"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-walnut px-6 py-4 text-small font-semibold text-ivory transition-colors duration-300 active:bg-terracotta sm:w-auto sm:px-8",
          className,
        )}
      >
        {label}
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8h10m0 0L9 4m4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {mounted && createPortal(sheet, document.body)}
    </>
  );
}
