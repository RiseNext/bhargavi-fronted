# Backend PRD — Bhargavi Health World

**Audience:** Backend team
**Frontend repo:** `bhrgau` (this repo) · Production domain: `https://www.bhargavihealthworld.com`
**Date:** 2026-10-05
**Status of frontend:** Built, deployed-ready, fully static. **No working backend exists** — the only API route is a stub.

---

## 1. Overview

Bhargavi Health World is a holistic wellness clinic (acupuncture, acupressure, naturopathy) in Chikkadpally, Hyderabad. The website is a **Next.js 15 (App Router) + React 19 + Tailwind 4** frontend with **zero backend dependencies** — no database, no auth, no email SDK, no CMS. Deployment target is Vercel.

Key architectural facts the backend team must know before designing anything:

1. **All content is hardcoded** in TypeScript files under `src/content/` and `src/lib/site.ts`. Every page is a server component / statically generated.
2. **Lead delivery today is a WhatsApp deep-link**, not an API. When a visitor submits the appointment or contact form, the frontend opens `https://wa.me/917075157013?text=...` with the message pre-composed, and the visitor presses send in WhatsApp themselves.
3. The frontend **also** POSTs every submission to `POST /api/contact` as fire-and-forget telemetry. That route (`src/app/api/contact/route.ts`) validates and `console.info`s the payload, then returns `{ ok: true }`. **Nothing is stored or emailed.** If the visitor doesn't press send in WhatsApp, the lead is lost.
4. The appointment/contact forms **ignore the API response entirely** — they show "sent" regardless. Only the (currently unused) newsletter form checks `res.ok`.
5. The old PHP site (`reference/site/anjanabhargavi ayuvedic/appointment.php`) emailed submissions via `mail()` and **sent an auto-acknowledgement to the submitter**. The new build lost both behaviours. Phase 1 restores them properly.

Environment variables: only `NEXT_PUBLIC_SITE_URL` is wired today. `.env.example` already sketches (commented out) `RESEND_API_KEY` and `CONTACT_TO_EMAIL=bhargavihealthworld@gmail.com`.

---

## 2. Current frontend inventory

### 2.1 Routes

| Route | Data it renders | Source of data |
|---|---|---|
| `/` | Hero, stats, 10-therapy rail, featured testimonials (6), featured videos (6), why-us, appointment form, FAQs | `src/content/*`, `src/lib/site.ts` |
| `/about` | Founder story, stats, achievements, philosophy, 4 gallery photos, testimonials | `site-content.ts`, inline in page |
| `/services` | All 10 services grid, process steps, FAQs | `services.ts` |
| `/services/[slug]` | Full therapy detail + **AppointmentForm prefilled with the service slug** + "Ask on WhatsApp" link. 10 slugs statically pre-rendered | `services.ts` |
| `/gallery` | 8 clinic images in a lightbox | `media.ts` (generated paths) |
| `/videos` | 19 YouTube "Health Talks" | `media.ts` |
| `/testimonials` | All 23 testimonials | `testimonials.ts` |
| `/blog` | **Empty "coming soon" placeholder.** No post data, no `/blog/[slug]` route yet. Prime candidate for backend-driven content | — |
| `/contact` | Contact cards, live open/closed badge, Google Maps embed, ContactForm + AppointmentForm, FAQs | `site.ts` |
| `POST /api/contact` | The only API route — **stub** | `src/app/api/contact/route.ts` |

Service slugs (also the `service` values the appointment form submits): `acupuncture`, `acupressure`, `naturopathy-consultation`, `nutrition-and-diet`, `seed-therapy`, `cupping-therapy`, `magneto-therapy`, `chiropractic`, `physiotherapy`, `varma-kala`.

### 2.2 Forms — exact fields as submitted

Field names below are the literal `name=` attributes; payloads reach the API as flat JSON strings via `JSON.stringify({ kind, ...formData })`.

**AppointmentForm** (`src/components/forms/AppointmentForm.tsx`) — used on `/`, `/contact`, and every `/services/[slug]`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | ✅ | |
| `phone` | tel | ✅ | **No pattern validation on the frontend.** Old site enforced `[6789][0-9]{9}` |
| `email` | email | — | Browser-validated format if filled |
| `service` | select | — | A service **slug**, or `""` = "Not sure — please advise" |
| `datetime` | datetime-local | — | Raw value like `2026-10-07T15:30`; no min/max, not validated against clinic hours |
| `message` | textarea | — | |
| `consent` | checkbox | ✅ | Submitted as the string `"on"` |

Sent as `{ "kind": "appointment", ...fields }`.

**ContactForm** (`src/components/forms/ContactForm.tsx`) — `/contact` only:

| Field | Type | Required |
|---|---|---|
| `name` | text | ✅ |
| `phone` | tel | ✅ |
| `email` | email | — |
| `message` | textarea | ✅ |

Sent as `{ "kind": "contact", ...fields }`.

**NewsletterForm** (`src/components/forms/NewsletterForm.tsx`) — **exists but is not rendered on any page.** Single required `email` field, sent as `{ "kind": "newsletter", "email": "..." }`. This is the only form that awaits the response and shows an error state on `!res.ok`. The API's `newsletter` branch should still be implemented — the form will be mounted (likely in the footer) once the backend can store subscribers.

### 2.3 Existing `POST /api/contact` contract — **preserve this exactly**

The frontend is already built against this contract. Extend it; don't break it.

Request: `Content-Type: application/json`, flat object of strings.
`kind` is optional and defaults to `"contact"`. Allowed: `"appointment" | "contact" | "newsletter"`.

Validation (current stub behaviour, to be kept):

| Condition | Response |
|---|---|
| Malformed JSON | `400` · `{ "error": "Invalid JSON body." }` |
| `kind=newsletter` and `email` invalid/missing | `422` · `{ "error": "A valid email address is required." }` |
| other kinds: `name` or `phone` blank | `422` · `{ "error": "Name and phone number are required." }` |
| other kinds: `email` present but invalid | `422` · `{ "error": "That email address doesn't look right." }` |
| Success | `200` · `{ "ok": true, "kind": "<kind>" }` |

Email regex currently used: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`.

Error convention for **all** new endpoints: non-2xx + `{ "error": "<human-readable message>" }`. The frontend renders `error` strings directly to visitors, so keep them friendly.

---

## 3. Phase 1 — Lead capture & delivery (build this first)

**Goal:** no lead is ever lost, even if the visitor abandons the WhatsApp step. This is the only phase blocking launch.

### 3.1 `POST /api/contact` — make the stub real

Keep the request/response contract from §2.3 and add, server-side:

1. **Persist every valid submission** to a database with: all submitted fields, `kind`, server timestamp, status (`new` by default), and request metadata (IP, user-agent) for spam forensics.
2. **Notify the clinic by email** on `kind=appointment` and `kind=contact` — to `CONTACT_TO_EMAIL` (default `bhargavihealthworld@gmail.com`; confirm with client — the old PHP script sent to a different personal Gmail, `bhargavipragada538@gmail.com`). Subject should carry kind + name + phone so staff can triage from the inbox. Suggested provider: **Resend** (env var already sketched); SMTP is an acceptable fallback.
3. **Auto-acknowledgement to the submitter** when `email` was provided — restores old-site behaviour. Short, branded, "we'll call you back" + clinic phone/WhatsApp/hours.
4. **Server-side validation hardening** (frontend doesn't do these):
   - Normalize + validate `phone` — recommend accepting 10-digit Indian mobiles `[6-9]\d{9}` with optional `+91`/`91`/`0` prefix; store normalized E.164.
   - If `kind=appointment`: `service`, when non-empty, must be one of the 10 known slugs (reject or coerce to empty — don't 500); `datetime`, when present, must parse; optionally warn-flag values outside clinic hours (9:00–21:00 IST, all 7 days) rather than reject.
   - Trim all fields; cap lengths (e.g. 200 chars for name/email/phone, 2000 for message); strip control characters.
5. **Spam protection** — the form is public and unauthenticated:
   - Rate limit per IP (e.g. 5 submissions / 10 min).
   - Honeypot field support: frontend will add a hidden field (proposed name: `company`); if non-empty, return `200 { ok: true }` but silently drop. (Needs a tiny frontend change — see §8.)
   - Reject bodies over ~10 KB.
   - No CAPTCHA for v1 (hurts conversion for this audience); revisit if spam volume demands it.
6. **Newsletter kind:** store `email` in a `subscribers` table with unique constraint; duplicate subscribe returns `200 { ok: true }` (idempotent, don't leak existence).

**Important behavioural note:** the appointment/contact forms don't read the response, so a failed delivery is invisible to the visitor (WhatsApp remains their path). That means **backend-side alerting on delivery failures matters** — log + alert if the notification email fails, since nobody on the frontend will notice.

### 3.2 Data model (minimum)

```
submissions
  id, kind (appointment|contact), name, phone (E.164), email?,
  service_slug?, preferred_at? (timestamptz, IST intent), message?,
  consent (bool), status (new|contacted|closed), ip, user_agent,
  created_at

subscribers
  id, email (unique), created_at, unsubscribed_at?
```

### 3.3 Env vars introduced

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` (or SMTP creds) | outbound email |
| `CONTACT_TO_EMAIL` | clinic notification inbox |
| `DATABASE_URL` | persistence |

---

## 4. Phase 2 — Content APIs (replace hardcoded data)

**Goal:** clinic staff can change content without a code deploy. Each endpoint below replaces one hardcoded file; response shapes are **derived from the existing TS types**, so the frontend migration is mechanical. All are public, read-only, cacheable (`Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` or ISR-friendly equivalents). List endpoints return `{ "items": [...] }`; detail endpoints return the object; unknown slug → `404 { "error": "Not found." }`.

### 4.1 `GET /api/services` and `GET /api/services/{slug}`

From `Service` in `src/content/services.ts`:

```jsonc
{
  "slug": "acupuncture",
  "title": "Acupuncture",
  "excerpt": "...",            // card/listing text
  "image": "/images/services/acupuncture.jpg",
  "duration": "45–60 min",     // display string, shown as "Session length"
  "body": ["para 1", "para 2"],// long-form paragraphs
  "treats": ["Back pain", "..."],
  // NEW fields the backend should add (currently hardcoded JSX on the detail page):
  "priceFrom": 100,            // "From: ₹100" is a literal today — a placeholder, confirm real prices with client
  "typicalCourse": "2–4 sittings",
  "sortOrder": 1,
  "published": true
}
```

The frontend drops `copyStatus` (an editorial flag) — the CMS absorbs that concern. The appointment form's service dropdown and `/services/[slug]` static params both derive from this list, and `sitemap.xml` must include one entry per published slug.

### 4.2 `GET /api/testimonials`

From `Testimonial` in `src/content/testimonials.ts` (23 entries, 6 featured):

```jsonc
{
  "name": "Kranthi Gangapuri",
  "quote": "...",
  "when": "a year ago",   // free text today; backend should store a real date and let the frontend relativize
  "featured": true,        // home page shows featured only; /testimonials shows all
  // suggested new fields: "rating": 5, "source": "google"  (content is imported Google reviews)
}
```

Support `?featured=true` as a filter.

### 4.3 `GET /api/videos`

From `Video` in `src/content/media.ts` (19 entries, 6 featured):

```jsonc
{
  "id": "6STwtkvRBIA",     // YouTube video ID — frontend builds thumb/embed URLs from it
  "title": "...",
  "translation": "...",    // optional English translation of a Telugu title
  "featured": true
}
```

Support `?featured=true`.

### 4.4 `GET /api/gallery`

Today the gallery is a generated array of 8 `{ src, alt }` paths. Backend version adds managed uploads:

```jsonc
{ "src": "https://.../gallery/xyz.jpg", "alt": "...", "sortOrder": 1 }
```

Image hosting decision needed: if images move off `/public`, the frontend's `next.config.ts` `images.remotePatterns` must allowlist the host (today it only allows `i.ytimg.com`).

### 4.5 `GET /api/faqs`

From `Faq` in `src/content/site-content.ts` (6 entries): `{ "question": "...", "answer": "..." }`. Used on `/`, `/services`, `/contact` **and emitted as `FAQPage` JSON-LD**, so answers must be plain text. ⚠️ FAQ #4's answer currently hardcodes the phone number — once settings (§4.6) exist, author answers without embedded contact details or template them.

### 4.6 `GET /api/site-settings`

Single object replacing `src/lib/site.ts` (`name`, `tagline`, `description`, `founder {name, honorific, qualifications, role, photo}`, `phones[]`, `whatsapp {number, href}`, `email`, `address {line1, line2, city, state, postalCode, country, full}`, `geo {lat, lng}`, `mapsUrl`, `mapEmbedSrc`, `priceRange`, `hours[]`, `socials[]`) plus the stats band from `site-content.ts` (`stats: [{ value, suffix, label }]`).

**Hours need structure, not display strings.** Today hours exist as the string `"9:00 AM – 9:00 PM"` in `site.ts` **and separately** as a minutes-since-midnight window hardcoded in `src/components/ui/OpenStatus.tsx` (the live open/closed badge, evaluated in `Asia/Kolkata`). The API should return machine-readable hours so one source drives both, and allow per-weekday values:

```jsonc
"hours": [{ "days": [0,1,2,3,4,5,6], "open": "09:00", "close": "21:00" }]
```

Known hardcoded leaks the frontend will clean up during migration (listed so backend knows the settings object is the intended single source): phone number in FAQ #4 and in the form error fallback (`fields.tsx`), hours strings in the service detail page, address fragment in `/contact`, duplicate hero stats in `Hero.tsx`.

### 4.7 `GET /api/posts` and `GET /api/posts/{slug}` — blog

The `/blog` page is an intentional placeholder; post grid and prose styles already exist in the frontend. First real backend-driven collection:

```jsonc
// list item (support ?page=&limit=, return { items, total, page, limit })
{ "slug": "...", "title": "...", "excerpt": "...", "coverImage": "...", "publishedAt": "2026-10-01T00:00:00Z", "tags": ["..."] }
// detail adds:
{ "body": "<markdown or sanitized HTML — agree on one with frontend>", "author": "Anjana Bhargavi" }
```

Only `published` posts on the public endpoint. `sitemap.xml` needs these slugs too.

---

## 5. Phase 3 — Future (design for, don't build yet)

- **Real appointment booking** — slots/availability model, conflict checks, confirmations (likely WhatsApp Business API or SMS). Today "booking" = free-text preferred time + "we call back". Needs a product decision before any API design; the clinic runs 9:00–21:00 IST, 7 days, single practitioner.
- **Therapists collection** — 8 of the 23 testimonials praise a "Dr. Utheja" who appears nowhere on the site (open question in `docs/CONTENT-TODO.md` #5). If the clinic has multiple practitioners, add `GET /api/therapists` and a `therapistId` on appointments.
- **Health/fruit box subscription** — old site sold monthly boxes at ₹1499/₹2499/₹3499; never rebuilt. Would need products, orders, and payments (Razorpay is the obvious India choice). Out of scope until the client confirms it's wanted.

---

## 6. Admin / CMS requirements

Small clinic: 1–2 staff users, no roles needed beyond "admin" for v1.

**Auth:** email + password, session cookie (httpOnly, secure) or JWT. Endpoints: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`. All `/api/admin/*` routes require auth; return `401 { "error": "Unauthorized." }` otherwise. No public signup — users seeded manually.

**Lead inbox (Phase 1 companion — build alongside §3):**

- `GET /api/admin/submissions?kind=&status=&from=&to=&page=` — paginated list of form submissions.
- `PATCH /api/admin/submissions/{id}` — `{ "status": "new" | "contacted" | "closed" }`.
- `GET /api/admin/subscribers` — newsletter list, with CSV export (`?format=csv`).

**Content CRUD (Phase 2 companion)** — standard CRUD mirroring each public collection:

- `POST/PATCH/DELETE /api/admin/services/{slug}` (+ publish/unpublish, reorder)
- `POST/PATCH/DELETE /api/admin/testimonials/{id}` (+ featured toggle)
- `POST/PATCH/DELETE /api/admin/videos/{id}`, `/api/admin/gallery/{id}`, `/api/admin/faqs/{id}`, `/api/admin/posts/{slug}` (draft/published)
- `PUT /api/admin/site-settings`
- `POST /api/admin/uploads` — image upload (gallery, service images, post covers); returns the public URL.

**Note:** an off-the-shelf headless CMS (Payload, Strapi, Sanity, Directus) would satisfy all of §6 and most of §4 — a legitimate alternative to hand-rolling. If chosen, the public API shapes in §4 still define what the frontend consumes; map the CMS output to them (or adapt the frontend mapping layer, to be agreed).

On any content mutation, trigger revalidation of the static frontend (Next.js on-demand revalidation webhook or tag-based ISR — coordinate the mechanism with frontend).

---

## 7. Non-functional requirements

- **Errors:** always `{ "error": "<message>" }`, correct HTTP status (`400` malformed, `401` unauthenticated, `404` unknown resource, `422` validation, `429` rate-limited, `500` generic "Something went wrong — please call us on +91 70751 57013"). Visitor-facing messages must stay friendly; never leak stack traces.
- **CORS:** if endpoints live inside this Next app (recommended for v1), same-origin — no CORS config needed. If on a separate origin, allow only the production domain + Vercel preview URLs.
- **Rate limiting:** public POST endpoints per §3.1; public GETs can be generous (they're cached anyway).
- **Privacy / data retention:** submissions contain PII (name, phone, email, health concerns in `message`). The health context makes `message` sensitive — encrypt at rest if the platform allows, restrict admin access, and agree on a retention window (suggest auto-purge of `closed` submissions after 12 months). The `consent` checkbox is the lawful basis for contacting — store it.
- **Timezone:** clinic operates in `Asia/Kolkata`. Store timestamps as UTC; interpret the form's naive `datetime` value as IST.
- **Observability:** log every submission attempt (accepted/rejected/spam-dropped) and alert on email delivery failure (see §3.1 note — frontend will never surface these).

---

## 8. Frontend changes contingent on each phase

So the backend team knows what is and isn't their dependency:

| Phase | Frontend work needed |
|---|---|
| 1 | Minimal: add honeypot field; optionally make forms await the response and show real errors (today they show "sent" unconditionally — a product decision, since WhatsApp remains the primary path). Mount `NewsletterForm` (likely footer) once subscribe works. |
| 2 | Replace each `src/content/*` import with a fetch + ISR per collection; build `/blog` grid + `/blog/[slug]`; update `sitemap.ts` to pull dynamic slugs; wire `OpenStatus` to structured hours; clean up hardcoded phone/hours/address leaks; allowlist the image host in `next.config.ts`. |
| 3 | New UI throughout (booking flow, therapist pages, shop) — separate project. |
| Admin | None in this repo if the admin UI is a separate app or a headless CMS's own panel. |

---

## 9. Open questions for the client (blockers flagged)

| # | Question | Blocks |
|---|---|---|
| 1 | Confirm notification inbox: `bhargavihealthworld@gmail.com` vs the old script's `bhargavipragada538@gmail.com` | Phase 1 |
| 2 | Real per-therapy prices (₹100 is a placeholder; site-wide range says ₹100–1000) | Phase 2 (services) |
| 3 | Who is "Dr. Utheja"? Multiple practitioners? | Phase 3 (therapists) |
| 4 | Is the fruit/health box subscription wanted? | Phase 3 (commerce) |
| 5 | Blog: who writes, how often, markdown or rich text? | Phase 2 (posts) |

Related docs in this repo: `docs/PRD.md` (the frontend PRD — §13 sketches entities and marks `{{ENDPOINT_PENDING}}` integration points; note its route list is more ambitious than what was built) and `docs/CONTENT-TODO.md` (open content questions, incl. #9 "form delivery is a stub").
