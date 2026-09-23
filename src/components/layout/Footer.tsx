import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const explore = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Health Talks", href: "/videos" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/**
 * Deliberately short: brand, one row of links, the details someone actually
 * needs to visit or call, and a thin legal line.
 */
export function Footer() {
  return (
    <footer className="bg-walnut text-ivory/70">
      <div className="wrap">
        <div className="grid gap-x-block gap-y-stack py-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-start">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src={site.logo}
                alt=""
                width={40}
                height={40}
                className="aspect-square w-9 rounded-full object-contain"
              />
              <span className="font-display text-h4 text-ivory">{site.name}</span>
            </Link>

            <ul className="mt-4 flex flex-wrap gap-2">
              {site.socials.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid aspect-square w-8 place-items-center rounded-full border border-ivory/20 text-label font-semibold uppercase tracking-wider text-ivory/70 transition-colors duration-300 hover:border-ivory hover:bg-ivory hover:text-ink"
                  >
                    <span className="sr-only">{s.name}</span>
                    <span aria-hidden="true">{s.name.slice(0, 2)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-x-gutter gap-y-stack sm:grid-cols-2">
            {/* Links — one wrapped row rather than a stack of columns. */}
            <nav aria-label="Footer">
              <h2 className="label text-ivory/45">Explore</h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {explore.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="underline-grow text-small text-ivory/65 transition-colors duration-300 hover:text-ivory"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Visit */}
            <div>
              <h2 className="label text-ivory/45">Visit</h2>
              <address className="mt-3 not-italic text-small leading-relaxed text-ivory/60">
                {site.address.line1}, {site.address.city} –{" "}
                {site.address.postalCode}
                <span className="mt-1.5 block">
                  {site.phones.map((p, i) => (
                    <span key={p.href}>
                      {i > 0 && <span aria-hidden="true"> · </span>}
                      <a
                        href={p.href}
                        className="tabular-nums text-ivory/75 transition-colors hover:text-ivory"
                      >
                        {p.label}
                      </a>
                    </span>
                  ))}
                </span>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-1 block break-all text-ivory/75 transition-colors hover:text-ivory"
                >
                  {site.email}
                </a>
                <span className="mt-1.5 block">
                  {site.hours.map((h) => `${h.days} ${h.time}`).join(" · ")}
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-ivory/12 py-4 text-label text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Complementary therapies. Not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
