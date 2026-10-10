import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getPosts, getServices } from "@/lib/content";
/*
 * ⚠ `privacyPublished` and `contentUpdatedAt` stay STATIC — they come from
 * `content_blocks` and `page_meta`, which are tranche 2. The consequence is
 * narrow and worth stating: every URL below is correct and fresh, but the
 * `lastModified` stamp for the STATIC routes lags until the next deployment.
 * Per-service and per-post stamps come from their own rows and are fresh.
 */
import { privacyPublished } from "@/content/page-copy";
import { contentUpdatedAt } from "@/content/page-meta";

/**
 * 🔴 SEO-01 — `lastModified` must be a REAL content timestamp, not build time.
 *
 * 19 of the 20 URLs here were stamped `new Date()`, which CLAUDE.md §8 names
 * outright as the defect to fix: "today's sitemap stamps `new Date()`, which is
 * meaningless". Measured before the fix: 19 URLs, **1 distinct** lastmod, equal
 * to the moment the build ran. Every page therefore claimed to have changed on
 * every deploy, which tells a crawler nothing and dilutes the signal for the
 * pages that genuinely did change.
 *
 * Each URL now uses the most specific real timestamp available:
 *
 *   /services/<slug>  the service row's own `updatedAt`
 *   /blog/<slug>      the post's own `updatedAt` (already correct)
 *   static routes     `contentUpdatedAt`, the newest change across all content
 *
 * The static pages have no single owning row — `/about` draws on
 * content_blocks, site_settings and the founder's details at once — so a
 * site-wide maximum is the honest answer rather than a fabricated per-page one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([getServices(), getPosts()]);

  const contentChanged = new Date(contentUpdatedAt);
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    { path: "/gallery", priority: 0.6 },
    { path: "/videos", priority: 0.6 },
    { path: "/testimonials", priority: 0.7 },
    { path: "/blog", priority: 0.5 },
    { path: "/careers", priority: 0.5 },
    { path: "/contact", priority: 0.8 },
    // 🔴 Listed only once the policy is actually published (D-021).
    // Advertising /privacy to crawlers while the page 404s would be worse than
    // omitting it, and advertising an unapproved policy worse still. Every
    // existing priority above is unchanged.
    ...(privacyPublished ? [{ path: "/privacy", priority: 0.3 }] : []),
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: contentChanged,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    // One entry per PUBLISHED post — drafts never reach `posts`. `/blog` itself
    // stays listed unconditionally because it renders a real page in both
    // states, and every existing priority above is unchanged.
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
