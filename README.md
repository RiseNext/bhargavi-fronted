# Bhargavi Health World — website

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · React 19

```bash
npm run dev               # http://localhost:3000
npm run build
npm run lint
npm run audit:responsive  # overflow check, 10 routes × 7 widths (needs a running server)
npm run shots             # readable screenshot crops at 390 / 1440
```

## Design system — Kerala Ayurveda

Earth pigments only: **warm ivory · warm taupe · terracotta · olive green ·
walnut brown**. Nothing in the palette is grey or blue-shifted.

Tokens live in a single `@theme` block in
[src/app/globals.css](src/app/globals.css). No component contains a raw hex or
a fixed pixel size.

### Colour

| Token | Value | Role |
|---|---|---|
| `ivory` | `#f7f1e6` | Warm ivory — page ground |
| `paper` | `#fffdf8` | Warm white — cards, alternate band |
| `sand` | `#efe5d4` | Light taupe — third band |
| `line` | `#e0d6c5` | Taupe hairline — the main structural device |
| `ink` / `ink-2` | `#241a12` / `#4a3a2d` | Deep walnut text, never black |
| `muted` / `faint` | `#6e5f4d` / `#776750` | Secondary text, index numbers |
| `taupe` / `taupe-soft` | `#a99c8a` / `#ddd2bf` | Warm taupe |
| `terracotta` | `#a9522f` | Primary accent — labels, active nav, stars |
| `terracotta-soft` | `#d98a62` | The same accent, for use **on walnut** |
| `olive` / `olive-soft` | `#5f6b3c` / `#e8e9da` | Herbal secondary, prose marks, success |
| `walnut` / `walnut-deep` | `#3d2a1e` / `#2a1c13` | Dark bands, footer, buttons |

Every pair used for text clears WCAG AA on its ground. `terracotta` on ivory is
4.5:1; on walnut it flips to `terracotta-soft` (4.6:1) — never the same token
on both.

### Bands

`<Section tone>` takes `ivory · paper · sand · olive · walnut · walnutDeep`.
**Never repeat a tone on two adjacent sections** — the page's rhythm comes from
the background changes, not from borders.

### Type

**Fraunces** (variable serif, `SOFT`/`WONK` axes) for display ·
**Plus Jakarta Sans** for body and UI. Both self-hosted through `next/font`.

Scale: `text-d1`, `text-d2`, `text-h1`–`h4`, `text-lead`, `text-body`,
`text-small`, `text-label`. Every step is a `clamp()`, so type is continuous
from 320px to 2560px — there are no breakpoint jumps.

### Everything is fluid

Spacing is a clamp scale exposed as Tailwind spacing keys, so `py-section`,
`gap-gutter`, `mt-block`, `top-nav` all scale with the viewport:

| Token | Range |
|---|---|
| `gutter` | 18px → 48px |
| `stack` | 20px → 36px |
| `block` | 32px → 72px |
| `section` | 56px → 120px |
| `nav` | 68px → 104px (header clearance) |

Rules the build holds to:

- No fixed `h-` or `w-` on anything that has to survive a narrow viewport.
- Every grid column is `minmax(0, …)` so long words can't blow out a track.
- `* { min-width: 0 }` in base, so flex/grid children shrink instead of pushing.
- Overlays (the hero credential chip) are inset on **both** sides, never
  pinned to one edge with a fixed width.
- Horizontal scrollers use `.rail` + `.rail-pad`, which aligns the first card
  with the page container without fighting `max-width`.
- `body { overflow-x: clip }` as a backstop — but nothing should need it, and
  `npm run audit:responsive` proves it.

### Motion

`.reveal` (fade + lift) and `.wipe` (headline mask slide) — both
IntersectionObserver-driven, fire once. `prefers-reduced-motion` disables all
of it, and `@media (scripting: none)` makes sure nothing stays invisible
without JS.

### Verification

`scripts/audit.mjs` drives real Chrome with **device-metrics emulation** (not
a resized window — Chrome clamps window width on Windows and will lie to you).
It loads 10 routes at 7 widths, forces every reveal to its end state, and
reports any element whose box escapes the viewport.

Current status: **70/70 viewports clean.**

## Structure

```
src/
  app/                      routes
    api/contact/            form endpoint (STUB — see docs/CONTENT-TODO.md)
    services/[slug]/        10 statically generated therapy pages
  components/
    layout/                 Header, Footer, FloatingActions
    ui/                     Section, Button, Media, Reveal, Accordion, Lightbox, Decor
    cards/                  ServiceCard, TestimonialCard, VideoCard
    forms/                  Appointment, Contact, Newsletter
    sections/               Hero + composable home-page bands
  content/                  all copy — services, testimonials, media, FAQs
  lib/site.ts               single source of truth for business details
public/images/              brand, team, services, gallery, icons, bg
reference/site/             the old website (gitignored — local reference only)
scripts/                    responsive audit + screenshot tooling
docs/                       PRD, old-site content extract, content TODO
```

## Conventions

- `<SectionHead>` defaults to the `split` layout (label in a narrow left
  column, display title beside it). That split is what gives the page its
  magazine feel.
- Sections are prop-driven and fetch nothing; pages compose them.
- Forms post JSON to `/api/contact` and render loading / success / error
  inline — never `alert()`.

## Deploying to Vercel

Zero-config — Vercel detects Next.js and needs no `vercel.json`. Push to
GitHub, then **New Project → Import** the repo and deploy.

**Build settings** (all auto-detected, leave as-is):

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build command | `next build` |
| Output directory | `.next` |
| Install command | `npm install` |
| Node version | 20.x or 22.x |

**Environment variables** — none are required to build. See
[.env.example](.env.example). Set `NEXT_PUBLIC_SITE_URL` only if the live
origin differs from the one in `src/lib/site.ts`; it drives `metadataBase`,
canonical tags, `sitemap.xml` and `robots.txt`.

**After the first deploy**

1. Add the custom domain under *Settings → Domains*. Until then, canonical
   URLs and the sitemap point at `www.bhargavihealthworld.com`. Preview
   deployments are safe — Vercel serves them `X-Robots-Tag: noindex`.
2. Check `/sitemap.xml` and `/robots.txt` resolve on the live domain.
3. Submit the sitemap in Google Search Console.
4. Re-scrape the social card (`/images/brand/og-card.png`, 1200×630) with the
   Facebook Sharing Debugger and WhatsApp.

> [!IMPORTANT]
> **Forms do not deliver yet.** `/api/contact` validates and logs, then returns
> `{ ok: true }` — so an appointment request looks successful to the visitor
> and is lost. On Vercel the log line goes to the function logs and nothing
> else. Wire up a provider before you give this URL to patients.

## Known stubs

See **[docs/CONTENT-TODO.md](docs/CONTENT-TODO.md)** — form delivery, the
Mrs./Dr. question, conflicting patient numbers, the rewritten cupping copy,
and the imagery pulled from `public/`.
