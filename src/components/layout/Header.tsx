"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { nav, site, type NavChild } from "@/lib/site";
import { services } from "@/content/services";

/**
 * Titles only. The durations read as a ragged second column here — they belong
 * on the service card, not in a ten-row menu.
 */
const servicesMenu: NavChild[] = services.map((s) => ({
  label: s.title,
  href: `/services/${s.slug}`,
}));

/** Ignore scroll jitter below this many pixels before flipping direction. */
const DIR_THRESHOLD = 6;
/** Keep the bar pinned over the hero — only hide once past this depth. */
const HIDE_AFTER = 160;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const lastY = useRef(0);

  /**
   * One rAF-throttled listener drives three things: the translucent
   * background, the hide-on-scroll-down / show-on-scroll-up direction, and
   * the reading-progress line. Progress is written straight to the node's
   * transform rather than through state, so scrolling never re-renders the
   * whole header.
   */
  useEffect(() => {
    let queued = false;

    const measure = () => {
      queued = false;
      const y = window.scrollY;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }

      setScrolled(y > 16);

      const delta = y - lastY.current;
      if (Math.abs(delta) > DIR_THRESHOLD) {
        setHidden(delta > 0 && y > HIDE_AFTER);
        lastY.current = y;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDrop(null);
    setHidden(false);
  }, [pathname]);

  // Scroll lock + Esc + focus trap while the mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
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
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const hoverOpen = useCallback((label: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenDrop(label), 100);
  }, []);
  const hoverClose = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenDrop(null), 220);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-gutter focus:top-4 focus:z-[90] focus:rounded-full focus:bg-walnut focus:px-5 focus:py-3 focus:text-small focus:text-ivory"
      >
        Skip to content
      </a>

      <header
        data-scrolled={scrolled}
        /* Tabbing into a hidden header must bring it back on screen. */
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          scrolled
            ? "border-b border-line/80 bg-ivory/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
          /* Never slide away with a menu open — it owns the close button. */
          hidden && !menuOpen && !openDrop ? "-translate-y-full" : "translate-y-0",
        )}
      >
        {/* Reading progress — fills left to right across the page. */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-terracotta transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: "scaleX(0)" }}
        />
        {/* Three tracks on desktop — logo, nav, actions — so the nav sits
            truly centred instead of being shoved about by the widths either
            side of it. Below `lg` it collapses back to a simple row. */}
        <div className="wrap flex items-center justify-between gap-[clamp(0.75rem,2vw,2rem)] py-[clamp(0.85rem,0.6rem+0.9vw,1.4rem)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 lg:justify-self-start"
          >
            <Image
              src={site.logo}
              alt=""
              width={64}
              height={64}
              priority
              className="aspect-square w-[clamp(2.4rem,2rem+1.3vw,3.1rem)] rounded-full object-contain"
            />
            <span className="leading-none">
              <span className="block font-display text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] font-semibold tracking-tight text-ink">
                Bhargavi
              </span>
              <span className="mt-1 block text-label font-semibold uppercase tracking-[0.2em] text-muted">
                Health World
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden lg:block lg:justify-self-center">
            <ul className="flex items-center gap-[clamp(0.15rem,0.7vw,0.6rem)]">
              {nav.map((item) => {
                const children =
                  item.label === "Services" ? servicesMenu : item.children;
                const active = isActive(item.href);

                if (!children) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative inline-flex items-center rounded-full px-[clamp(0.6rem,0.85vw,1rem)] py-2 text-[0.9375rem] transition-colors duration-200",
                          active
                            ? "font-semibold text-ink"
                            : "font-medium text-ink-2 hover:text-ink",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-x-[clamp(0.6rem,0.85vw,1rem)] bottom-1 h-[1.5px] origin-left rounded-full bg-terracotta transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
                            active
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                          )}
                        />
                      </Link>
                    </li>
                  );
                }

                const open = openDrop === item.label;
                const wide = item.label === "Services";

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hoverOpen(item.label)}
                    onMouseLeave={hoverClose}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDrop(open ? null : item.label)}
                      className={cn(
                        "group relative inline-flex items-center gap-1.5 rounded-full px-[clamp(0.6rem,0.85vw,1rem)] py-2 text-[0.9375rem] transition-colors duration-200",
                        active || open
                          ? "font-semibold text-ink"
                          : "font-medium text-ink-2 hover:text-ink",
                      )}
                    >
                      {item.label}
                      <Chevron open={open} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-[clamp(0.6rem,0.85vw,1rem)] bottom-1 h-[1.5px] origin-left rounded-full bg-terracotta transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
                          active || open
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
                        wide
                          ? "w-[min(31rem,calc(100vw-2*var(--spacing-gutter)))]"
                          : "w-[min(16rem,calc(100vw-2*var(--spacing-gutter)))]",
                        open
                          ? "pointer-events-auto translate-y-0 opacity-100"
                          : "pointer-events-none -translate-y-2 opacity-0",
                      )}
                    >
                      <div className="overflow-hidden rounded-lg border border-line bg-paper shadow-lg">
                        {/* Column-major so the list reads top-to-bottom, not zig-zag. */}
                        <ul
                          className={cn(
                            "grid gap-x-2 gap-y-px p-2",
                            wide && "grid-flow-col grid-cols-2 grid-rows-5",
                          )}
                        >
                          {children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                tabIndex={open ? 0 : -1}
                                className="group flex items-center gap-2.5 rounded-sm px-3 py-2.5 transition-colors duration-150 hover:bg-sand"
                              >
                                <span
                                  aria-hidden="true"
                                  className="size-1 shrink-0 rounded-full bg-terracotta opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                />
                                <span className="truncate text-[0.9375rem] text-ink-2 transition-colors group-hover:text-ink">
                                  {child.label}
                                </span>
                                {child.hint && (
                                  <span className="ml-auto shrink-0 text-label uppercase tracking-[0.12em] text-faint">
                                    {child.hint}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* The trigger is a button, so this is the only desktop
                            route to the services index. */}
                        {wide && (
                          <Link
                            href="/services"
                            tabIndex={open ? 0 : -1}
                            className="group flex items-center justify-between gap-3 border-t border-line bg-sand/50 px-5 py-3 text-small text-ink transition-colors hover:bg-sand"
                          >
                            <span>All {children.length} therapies</span>
                            <span
                              aria-hidden="true"
                              className="transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1"
                            >
                              <ArrowIcon />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:justify-self-end">
            <Link
              href="/contact"
              className="group/cta hidden items-center gap-2 rounded-full bg-walnut px-[clamp(1.1rem,0.75rem+1.1vw,1.75rem)] py-[clamp(0.65rem,0.55rem+0.35vw,0.9rem)] text-[0.875rem] font-semibold text-ivory transition-[background-color,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-terracotta sm:inline-flex"
            >
              Book Appointment
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover/cta:translate-x-1"
              >
                <ArrowMark />
              </span>
            </Link>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="inline-grid aspect-square w-[clamp(2.5rem,2.2rem+1vw,2.9rem)] place-items-center rounded-full border border-line bg-paper/60 text-ink transition-colors hover:bg-paper lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
                <path
                  d="M0 1h17M0 6h17M0 11h11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="site-menu"
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={cn(
            "absolute inset-0 bg-walnut-deep/40 transition-opacity duration-400",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(30rem,100%)] flex-col bg-ivory transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-gutter py-[clamp(0.85rem,0.6rem+0.9vw,1.4rem)]">
            <span className="label text-muted">Menu</span>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-grid aspect-square w-[clamp(2.5rem,2.2rem+1vw,2.9rem)] place-items-center rounded-full border border-line text-ink"
            >
              <span className="sr-only">Close menu</span>
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

          <nav
            aria-label="Mobile"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-gutter pb-8"
          >
            <ul className="divide-y divide-line">
              {nav.map((item, i) => {
                const children =
                  item.label === "Services" ? servicesMenu : item.children;
                return (
                  <li
                    key={item.label}
                    className="py-1"
                    style={{ transitionDelay: `${menuOpen ? i * 40 : 0}ms` }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-baseline gap-3 py-3.5 font-display text-[clamp(1.5rem,1.15rem+1.6vw,2.125rem)] font-semibold leading-tight transition-colors",
                        isActive(item.href) ? "text-terracotta" : "text-ink",
                      )}
                    >
                      <span className="index-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </Link>
                    {children && (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 pb-4 pl-[2.2rem]">
                        {children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="text-small text-muted underline-grow"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 space-y-3 border-t border-line px-gutter py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <Link
              href="/contact"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-walnut px-6 py-4 text-small font-semibold text-ivory"
            >
              Book Appointment
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-small text-muted">
              {site.phones.map((p) => (
                <a key={p.href} href={p.href} className="tabular-nums underline-grow">
                  {p.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className={cn("transition-transform duration-300", open && "rotate-180")}
    >
      <path
        d="M1 1l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path
        d="M1 6h13m0 0-4.5-4.5M14 6l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10m0 0L9 4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
