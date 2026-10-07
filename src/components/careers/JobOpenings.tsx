"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CareerForm } from "@/components/forms/CareerForm";
import { jobs, type Job } from "@/content/careers";

/**
 * Job cards on white, each opening an application modal with that role
 * preselected. Mirrors the Lightbox dialog conventions (scroll lock,
 * Escape, backdrop click).
 */
export function JobOpenings() {
  const [active, setActive] = useState<Job | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, close]);

  return (
    <>
      <ul className="mt-block grid gap-gutter lg:grid-cols-2">
        {jobs.map((job, i) => (
          <Reveal as="li" key={job.slug} delay={(i % 2) * 90} className="h-full">
            <article className="flex h-full flex-col rounded-xl border border-walnut/60 bg-paper p-[clamp(1.25rem,1rem+1vw,1.75rem)]">
              <div className="flex flex-wrap items-center justify-between gap-x-stack gap-y-3">
                <div>
                  <p className="index-num text-terracotta">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-h4 text-ink">
                    {job.title}
                  </h3>
                  <p className="mt-1.5 text-label text-muted">
                    {job.type} · {job.branch} · {job.experience}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setActive(job)}
                >
                  Apply for this role
                </Button>
              </div>

              <div className="mt-stack grid grow gap-stack border-t border-walnut/60 pt-stack sm:grid-cols-2">
                <div>
                  <p className="label font-semibold text-ink-2">Responsibilities</p>
                  <ul className="mt-3 space-y-2">
                    {job.responsibilities.map((item) => (
                      <li key={item} className="flex gap-2.5 text-small text-muted">
                        <span
                          aria-hidden="true"
                          className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-terracotta"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label font-semibold text-ink-2">
                    What you&apos;ll need
                  </p>
                  <ul className="mt-3 space-y-2">
                    {job.requirements.map((item) => (
                      <li key={item} className="flex gap-2.5 text-small text-muted">
                        <span
                          aria-hidden="true"
                          className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-olive"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Apply — ${active.title}`}
          className="modal-backdrop fixed inset-0 z-[90] flex items-end justify-center bg-walnut-deep/70 sm:items-center sm:p-gutter"
          onClick={close}
        >
          {/* Bottom sheet on phones, centered dialog from sm up. The header
              stays fixed so Close is always reachable while the form scrolls. */}
          <div
            className="modal-panel flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-paper sm:max-h-[88vh] sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-[clamp(1.1rem,0.9rem+1vw,2rem)]">
              <div className="min-w-0">
                <p className="label text-terracotta">Apply</p>
                <h3 className="mt-1.5 font-display text-h4 text-ink sm:text-h3">
                  {active.title}
                </h3>
                <p className="mt-1.5 text-label text-muted">
                  {active.type} · {active.branch} · {active.experience}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid aspect-square w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-walnut hover:text-ivory"
              >
                <span className="sr-only">Close</span>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain p-[clamp(1.1rem,0.9rem+1vw,2rem)] pb-[max(1.1rem,env(safe-area-inset-bottom))]">
              <CareerForm role={active.title} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
