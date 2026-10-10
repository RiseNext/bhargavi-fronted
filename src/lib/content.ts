/**
 * 🔴 THE RUNTIME CONTENT LAYER — D-042, superseding D-016.
 *
 * Content used to be fetched at BUILD time, written into `src/content/*.ts`,
 * committed, and imported statically. Publishing an edit therefore meant
 * rebuilding and redeploying the whole site, and the only thing that triggered
 * that rebuild was a single Vercel Deploy Hook. When the hook was unconfigured,
 * thirteen content mutations published nothing while the admin panel reported
 * success for every one of them.
 *
 * Content is now read from the backend API through Next's Data Cache, tagged
 * per collection, and cached **indefinitely** — `revalidate: false`. Nothing
 * expires on a timer and nothing is re-fetched per request. A collection is
 * re-read only when the backend calls `POST /api/revalidate` and that route
 * calls `revalidateTag` for it.
 *
 * ⚠ THIS IS NOT A MOVE TO PER-REQUEST SSR. Because every fetch is cached and
 * none of them reads request state, the routes still **prerender** — they are
 * `○`/`●` in the build output exactly as before. What changes is that a cached
 * render can be invalidated and regenerated without a deployment. Performance,
 * SEO and structured data are unaffected; D-010 holds because the rendered
 * output is identical.
 *
 * 🔴 WHY THERE IS NO FALLBACK TO THE COMMITTED FILES. It is tempting to catch a
 * fetch failure and fall back to `src/content/*.ts`. That would reintroduce,
 * exactly, the failure this project has already been burned by: the site would
 * serve weeks-old content while every status surface reported success. A failed
 * read here throws. Next then keeps serving the last good cached render of that
 * route, which is the correct behaviour — stale but *known* stale, and loud in
 * the logs — and a cold build with an unreachable backend fails rather than
 * shipping a site with no content.
 */

import "server-only";

import type { Service } from "@/content/services";
import type { Testimonial } from "@/content/testimonials";
import type { Video } from "@/content/media";
import type { Job } from "@/content/careers";
import type { Faq, Stat } from "@/content/site-content";
import type { Post } from "@/content/posts";
import type { PageMetaEntry } from "@/content/page-meta";
import type { PageCopyBlock } from "@/content/page-copy";

// Pure, secret-free and independently tested against the generator.
import {
  shapeService,
  shapeStat,
  shapeTestimonial,
  shapeVideo,
  type RawService,
  type RawStat,
  type RawTestimonial,
  type RawVideo,
} from "./content-shapes";

// ---------------------------------------------------------------------------
// Cache tags
// ---------------------------------------------------------------------------

/**
 * One tag per admin-managed collection.
 *
 * The backend sends these names verbatim, so they are a wire contract: renaming
 * one without changing the backend's `REVALIDATE_TAGS` makes that collection
 * silently unpublishable. `tests/revalidation-contract.test.ts` compares the two
 * lists for exactly that reason.
 */
export const CONTENT_TAGS = {
  settings: "site-settings",
  services: "services",
  testimonials: "testimonials",
  videos: "videos",
  gallery: "gallery",
  faqs: "faqs",
  jobs: "jobs",
  contentLists: "content-lists",
  contentBlocks: "content-blocks",
  pageMeta: "page-meta",
  posts: "posts",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];

export const ALL_CONTENT_TAGS: readonly ContentTag[] = Object.values(CONTENT_TAGS);

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

function backendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    // 🔴 Loud, and deliberately not recoverable. Under D-016 a missing
    // BACKEND_URL meant "use the committed files", which is how a production
    // build could publish stale content and still exit 0. There is no longer a
    // committed copy to fall back to, so an unset value is a configuration
    // error with exactly one honest outcome.
    throw new Error(
      "BACKEND_URL is not set. Content is read from the backend at runtime (D-042); " +
        "without it no page can render its content.",
    );
  }
  return url.replace(/\/+$/, "");
}

const TIMEOUT_MS = 15_000;

async function getJson<T>(path: string, tag: ContentTag): Promise<T> {
  const key = process.env.BACKEND_API_KEY;

  let response: Response;
  try {
    response = await fetch(`${backendUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        // Exempts rendering from the public GET rate limit. Server-only — this
        // module is `server-only`, so the key can never reach the browser.
        ...(key ? { "x-api-key": key } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: {
        // The whole design in one line: cache until told otherwise.
        revalidate: false,
        tags: [tag],
      },
    });
  } catch (err) {
    throw new Error(
      `GET ${path} failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!response.ok) {
    throw new Error(`GET ${path} returned ${String(response.status)}`);
  }

  return (await response.json()) as T;
}

/** Collection endpoints answer `{ items: [...] }`. */
async function getItems<T>(path: string, tag: ContentTag): Promise<T[]> {
  const body = await getJson<{ items?: T[] }>(path, tag);
  const items = body.items;
  if (!Array.isArray(items)) {
    throw new Error(`GET ${path} did not return an items array`);
  }
  return items;
}

// ---------------------------------------------------------------------------
// Public readers — one per collection, each tagged
// ---------------------------------------------------------------------------

export async function getServices(): Promise<Service[]> {
  const items = await getItems<RawService>("/api/services", CONTENT_TAGS.services);
  return items.map(shapeService);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((s) => s.slug === slug);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const items = await getItems<RawTestimonial>(
    "/api/testimonials",
    CONTENT_TAGS.testimonials,
  );
  return items.map(shapeTestimonial);
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return (await getTestimonials()).filter((t) => t.featured);
}

export async function getVideos(): Promise<Video[]> {
  const items = await getItems<RawVideo>("/api/videos", CONTENT_TAGS.videos);
  return items.map(shapeVideo);
}

export async function getFeaturedVideos(): Promise<Video[]> {
  return (await getVideos()).filter((v) => v.featured);
}

export async function getGalleryImages(): Promise<Array<{ src: string; alt: string }>> {
  const items = await getItems<{ src: string; alt: string }>(
    "/api/gallery",
    CONTENT_TAGS.gallery,
  );
  return items.map((g) => ({ src: g.src, alt: g.alt }));
}

export async function getFaqs(): Promise<Faq[]> {
  const items = await getItems<{ question: string; answer: string }>(
    "/api/faqs",
    CONTENT_TAGS.faqs,
  );
  return items.map((f) => ({ question: f.question, answer: f.answer }));
}

export async function getJobs(): Promise<Job[]> {
  const items = await getItems<Job>("/api/jobs", CONTENT_TAGS.jobs);
  return items.map((j) => ({
    slug: j.slug,
    title: j.title,
    type: j.type,
    // D-015: already the derived display string — "Either branch" or the name.
    branch: j.branch,
    experience: j.experience,
    excerpt: j.excerpt,
    responsibilities: j.responsibilities,
    requirements: j.requirements,
  }));
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  return (await getJobs()).find((j) => j.slug === slug);
}

// -- content_lists: the five prose collections -------------------------------

interface RawContentListItem {
  collection: string;
  title: string | null;
  text: string | null;
  icon: string | null;
  step: number | null;
}

async function getContentLists(): Promise<RawContentListItem[]> {
  return getItems<RawContentListItem>("/api/content-lists", CONTENT_TAGS.contentLists);
}

/**
 * ⚠ One fetch, five exports. `/api/content-lists` returns every collection in a
 * single response, and it is cached under one tag, so these five readers share
 * a single network round trip rather than issuing five.
 */
export async function getWhyChooseUs(): Promise<
  Array<{ title: string; icon: string; text: string }>
> {
  return (await getContentLists())
    .filter((c) => c.collection === "why_choose_us")
    .map((c) => ({ title: c.title ?? "", icon: c.icon ?? "", text: c.text ?? "" }));
}

export async function getProcess(): Promise<
  Array<{ step: number; title: string; text: string }>
> {
  return (await getContentLists())
    .filter((c) => c.collection === "process")
    .map((c) => ({ step: c.step ?? 0, title: c.title ?? "", text: c.text ?? "" }));
}

export async function getPhilosophy(): Promise<Array<{ title: string; text: string }>> {
  return (await getContentLists())
    .filter((c) => c.collection === "philosophy")
    .map((c) => ({ title: c.title ?? "", text: c.text ?? "" }));
}

export async function getAboutStory(): Promise<string[]> {
  return (await getContentLists())
    .filter((c) => c.collection === "about_story")
    .map((c) => c.text ?? "");
}

export async function getAchievements(): Promise<string[]> {
  return (await getContentLists())
    .filter((c) => c.collection === "achievements")
    .map((c) => c.text ?? "");
}

// -- stats ------------------------------------------------------------------

/**
 * Statistics live on `/api/site-settings`, not on a collection endpoint.
 *
 * ⚠ So they are tagged `site-settings`: editing a statistic in the admin panel
 * must invalidate THIS tag, not a `stats` tag that no endpoint backs. Getting
 * that wrong is a silently unpublishable collection, which is the whole class
 * of bug this migration exists to remove.
 */
export async function getStats(): Promise<Stat[]> {
  const settings = await getJson<{ stats?: RawStat[] }>(
    "/api/site-settings",
    CONTENT_TAGS.settings,
  );
  if (!Array.isArray(settings.stats)) {
    throw new Error("GET /api/site-settings returned no stats array");
  }
  return settings.stats.map(shapeStat);
}

/** ✅ D-023 — the hero's three statistics, resolved by the documented rule. */
export async function getHeroStats(): Promise<Array<{ k: string; v: string }>> {
  return (await getStats())
    .filter((s) => s.showInHero)
    .map((s) => ({ k: `${String(s.value)}${s.suffix}`, v: s.heroLabel ?? s.label }));
}

// -- page_meta --------------------------------------------------------------

interface RawPageMeta {
  page: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
  noindex: boolean;
  updatedAt?: string;
}

export async function getPageMeta(): Promise<Record<string, PageMetaEntry>> {
  const items = await getItems<RawPageMeta>("/api/page-meta", CONTENT_TAGS.pageMeta);
  const entries: Record<string, PageMetaEntry> = {};
  for (const m of items) {
    const entry: PageMetaEntry = {};
    if (m.title !== null) entry.title = m.title;
    if (m.description !== null) entry.description = m.description;
    if (m.canonical !== null) entry.canonical = m.canonical;
    if (m.ogImage !== null) entry.ogImage = m.ogImage;
    if (m.noindex) entry.noindex = true;
    entries[m.page] = entry;
  }
  return entries;
}

export async function getMetaForPage(page: string): Promise<PageMetaEntry> {
  return (await getPageMeta())[page] ?? {};
}

// -- content_blocks: page copy ----------------------------------------------

const UNKNOWN_MARKER = "UNKNOWN — CLIENT INPUT REQUIRED";

interface RawContentBlock {
  page: string;
  slot: string;
  label: string | null;
  title: string | null;
  lead: string | null;
  body: string[] | null;
  cta: { label: string; href: string } | null;
  cta2: { label: string; href: string } | null;
  ctaHref: string | null;
  cta2Href: string | null;
  extra: Record<string, unknown> | null;
  items: Array<Record<string, unknown> & { groupKey: string }>;
}

/**
 * 🔴 THE PRIVACY PUBLICATION GATE, preserved exactly (D-021).
 *
 * The generator withheld the WHOLE privacy page while any slot still carried an
 * unresolved legal fact — not the offending slots only, because publishing
 * eleven correct sections and silently dropping the retention period reads as a
 * complete policy while being materially misleading. That gate has to survive
 * the move to runtime, or this migration would quietly publish an unapproved
 * privacy policy the moment the page re-rendered.
 */
function privacySlotsWithMarkers(blocks: RawContentBlock[]): string[] {
  const offending: string[] = [];
  for (const block of blocks) {
    if (block.page !== "privacy") continue;
    const haystack = [
      block.label ?? "",
      block.title ?? "",
      block.lead ?? "",
      ...(block.body ?? []),
      block.extra === null ? "" : JSON.stringify(block.extra),
    ].join("\n");
    if (haystack.includes(UNKNOWN_MARKER)) offending.push(block.slot);
  }
  return offending;
}

export interface PageCopyResult {
  pageCopy: Record<string, PageCopyBlock>;
  privacyPublished: boolean;
}

export async function getPageCopy(): Promise<PageCopyResult> {
  const blocks = await getItems<RawContentBlock>(
    "/api/content-blocks",
    CONTENT_TAGS.contentBlocks,
  );

  const withheld = privacySlotsWithMarkers(blocks);
  const privacyPublished =
    withheld.length === 0 && blocks.some((b) => b.page === "privacy");

  const pageCopy: Record<string, PageCopyBlock> = {};

  for (const block of blocks) {
    if (block.page === "privacy" && withheld.length > 0) continue;

    const entry: PageCopyBlock = {};
    if (block.label !== null) entry.label = block.label;
    if (block.title !== null) entry.title = block.title;
    if (block.lead !== null) entry.lead = block.lead;
    if (block.body !== null) entry.body = block.body;
    if (block.cta !== null) entry.cta = block.cta;
    if (block.cta2 !== null) entry.cta2 = block.cta2;
    if (block.ctaHref != null) entry.ctaHref = block.ctaHref;
    if (block.cta2Href != null) entry.cta2Href = block.cta2Href;
    if (block.extra !== null) entry.extra = block.extra;

    if (block.items.length > 0) {
      const groups: Record<string, Array<Record<string, unknown>>> = {};
      for (const item of block.items) {
        groups[item.groupKey] ??= [];
        const row: Record<string, unknown> = {};
        for (const field of [
          "label", "value", "text", "href", "iconKey", "image", "alt", "lines",
        ]) {
          if (item[field] !== null && item[field] !== undefined) row[field] = item[field];
        }
        groups[item.groupKey]?.push(row);
      }
      entry.items = groups as PageCopyBlock["items"];
    }

    pageCopy[`${block.page}.${block.slot}`] = entry;
  }

  return { pageCopy, privacyPublished };
}

// -- blog posts -------------------------------------------------------------

/**
 * Every published post, WITH its content blocks.
 *
 * ⚠ Two defects the generator had to fix and this must not reintroduce: the
 * list endpoint caps at 50 (so page through it), and it carries no `blocks`
 * (so each post needs its own detail read, which is the only authority on
 * body content).
 */
export async function getPosts(): Promise<Post[]> {
  const PAGE_SIZE = 50;
  const summaries: Array<{ slug: string }> = [];

  for (let page = 1; ; page++) {
    const body = await getJson<{ items?: Array<{ slug: string }>; total?: number }>(
      `/api/posts?limit=${String(PAGE_SIZE)}&page=${String(page)}`,
      CONTENT_TAGS.posts,
    );
    const items = body.items ?? [];
    summaries.push(...items);
    const total = typeof body.total === "number" ? body.total : summaries.length;
    if (items.length === 0 || summaries.length >= total) break;
    if (page > 200) throw new Error("Refusing to page through /api/posts 200+ times");
  }

  const full: Post[] = [];
  for (const summary of summaries) {
    const detail = await getJson<Post>(
      `/api/posts/${encodeURIComponent(summary.slug)}`,
      CONTENT_TAGS.posts,
    );
    full.push({
      slug: detail.slug,
      title: detail.title,
      excerpt: detail.excerpt,
      cover: detail.cover,
      author: detail.author,
      tags: detail.tags,
      publishedAt: detail.publishedAt,
      readingMinutes: detail.readingMinutes,
      updatedAt: detail.updatedAt,
      seoTitle: detail.seoTitle ?? null,
      seoDescription: detail.seoDescription ?? null,
      blocks: detail.blocks ?? [],
    });
  }

  return full;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}
