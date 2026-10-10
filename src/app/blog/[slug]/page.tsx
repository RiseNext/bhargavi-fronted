import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Frame } from "@/components/ui/Media";
import { CtaBand } from "@/components/sections/HomeSections";
import { getPostBySlug, getPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { blogPosting, serialiseJsonLd } from "@/lib/schema";
import { PostBlocks } from "./PostBlocks";

/**
 * A single journal article.
 *
 * 🔴 `dynamicParams = false`. The listing links to `/blog/<slug>` from the same
 * `posts` array `generateStaticParams` reads, so by construction every link has
 * a page and nothing else is reachable. Without this, a slug that is absent at
 * build time would be rendered on demand from a module that does not contain
 * it — a 500 instead of an honest 404.
 *
 * Only PUBLISHED posts reach `posts` at all: `GET /api/posts` filters on
 * `status = 'published'`, so a draft has no page here and no entry in the
 * listing or the sitemap.
 */
/*
 * 🔴 `true` since D-042, changed from `false`.
 *
 * Tag revalidation re-renders paths that already exist; it cannot ADD one.
 * With `false`, a post published through the admin panel would 404 until the
 * next deployment — the exact coupling this migration removes. The original
 * justification for `false` was that every link comes from the same array
 * `generateStaticParams` reads, which is still true, so allowing an unknown
 * slug to render on demand costs nothing and `notFound()` still handles a slug
 * that genuinely is not published.
 */
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  // Admin-supplied SEO text wins; otherwise the post's own title and excerpt,
  // which are never empty. Nothing is invented.
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      type: "article",
      ...(post.publishedAt !== null ? { publishedTime: post.publishedAt } : {}),
      ...(post.cover !== null ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Returns undefined when there is no publication date, rather than inventing
  // one — exactly as `medicalClinic` and `jobPosting` gate incomplete nodes.
  const schema = blogPosting(site, {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover: post.cover,
    author: post.author,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  });

  const meta = [formatDate(post.publishedAt), readingLabel(post.readingMinutes), post.author]
    .filter((part) => part !== "")
    .join(" · ");

  return (
    <>
      <PageHero
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
        label={meta === "" ? undefined : meta}
        // Plain text, NOT `emphasise()`. The `*marker*` convention belongs to
        // page-copy titles only; a post title containing an asterisk must not
        // silently become italic.
        title={post.title}
        lead={post.excerpt}
      />

      <Section tone="ivory">
        <Wrap className="max-w-[72ch]">
          {post.cover !== null && (
            <Frame src={post.cover} alt="" sizes="(min-width: 1024px) 70vw, 92vw" priority />
          )}

          <div className={post.cover === null ? "" : "mt-block"}>
            <PostBlocks blocks={post.blocks} />
          </div>

          {post.tags.length > 0 && (
            <ul className="mt-block flex flex-wrap gap-2 border-t border-line pt-stack">
              {post.tags.map((tag) => (
                <li key={tag} className="label text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </Wrap>
      </Section>

      <CtaBand />

      {schema !== undefined && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(schema) }}
        />
      )}
    </>
  );
}

/** Fixed locale and explicit timezone, so the build machine cannot change it. */
function formatDate(iso: string | null): string {
  if (iso === null) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function readingLabel(minutes: number | null): string {
  return minutes === null ? "" : `${String(minutes)} min read`;
}
