import type { Metadata } from "next";
import Link from "next/link";
import { metadataFor } from "@/lib/page-metadata";

import { PageHero } from "@/components/ui/PageHero";
import { Section, Wrap } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Rings } from "@/components/ui/Decor";
import { Frame } from "@/components/ui/Media";
import { CtaBand } from "@/components/sections/HomeSections";
import { getPosts } from "@/lib/content";
import type { Post } from "@/content/posts";
import * as copy from "@/lib/copy";

export const metadata: Metadata = metadataFor("blog");

/**
 * The journal listing, driven by the generated `posts` module.
 *
 * 🔴 WHY THE EMPTY STATE IS A SEPARATE FUNCTION, COPIED VERBATIM.
 *
 * There are zero posts today, and that is the real, correct state (D-036). The
 * coming-soon panel below is the committed `2fdf32a` markup, moved — not
 * rewritten, reformatted or re-wrapped. Keeping it byte-identical is what lets
 * the rendered-HTML diff prove that wiring the CMS changed nothing a visitor
 * sees. Please do not "tidy" it.
 *
 * `PageHero` and `<CtaBand />` sit OUTSIDE the branch for the same reason: they
 * render identically either way, so they must not move inside a conditional.
 */
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        label={copy.text("blog", "hero", "label")}
        title={copy.heading("blog", "hero")}
        lead={copy.text("blog", "hero", "lead")}
      />

      {posts.length === 0 ? <ComingSoon /> : <PostList posts={posts} />}

      <CtaBand />
    </>
  );
}

/**
 * 🔒 The committed 2fdf32a markup and class list, unchanged — only the literal
 * strings now come from `blog.comingSoon`. See the note above for why the
 * structure must not be tidied.
 */
function ComingSoon() {
  const watch = copy.action("blog", "comingSoon");
  const browse = copy.action("blog", "comingSoon", "cta2");

  return (
    <Section tone="ivory" className="overflow-clip">
      <Rings className="absolute -right-[10%] top-1/2 w-[min(24rem,45vw)] -translate-y-1/2 text-line" />
      <Wrap>
        <Reveal className="max-w-[44ch] border-t border-line pt-block">
          <p className="label text-terracotta">
            {copy.text("blog", "comingSoon", "label")}
          </p>
          <h2 className="mt-stack text-h2 text-ink">
            {copy.heading("blog", "comingSoon")}
          </h2>
          <p className="mt-stack text-lead text-muted">
            {copy.text("blog", "comingSoon", "lead")}
          </p>
          <p className="mt-stack text-small text-muted">
            {copy.extra("blog", "comingSoon", "secondary")}
          </p>
          <div className="mt-block flex flex-wrap gap-3">
            <ButtonLink href={watch.href}>{watch.label}</ButtonLink>
            <ButtonLink href={browse.href} variant="outline">
              {browse.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Wrap>
    </Section>
  );
}

/**
 * The real listing. Built from the same primitives as every other index page,
 * so it inherits the existing grid rhythm, type scale and reveal behaviour
 * rather than introducing a new card idiom.
 *
 * `null` means unknown and renders NOTHING — never a placeholder (CLAUDE.md §8).
 * `cover` and `readingMinutes` are both commonly null: the latter is an
 * admin-supplied field, not a computed one.
 */
function PostList({ posts }: { posts: readonly Post[] }) {
  return (
    <Section tone="ivory" className="overflow-clip">
      <Rings className="absolute -right-[10%] top-1/2 w-[min(24rem,45vw)] -translate-y-1/2 text-line" />
      <Wrap>
        <ul className="grid gap-block sm:grid-cols-2">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={index * 60}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  {post.cover !== null && (
                    <Frame
                      src={post.cover}
                      alt=""
                      sizes="(min-width: 640px) 45vw, 92vw"
                      zoom
                    />
                  )}
                  <p className="label mt-stack text-terracotta">
                    {[formatDate(post.publishedAt), readingLabel(post.readingMinutes)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h2 className="mt-1 text-h3 text-ink">{post.title}</h2>
                  <p className="mt-stack text-body text-muted">{post.excerpt}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Wrap>
    </Section>
  );
}

/**
 * `2026-03-04` → `4 March 2026`, in the clinic's timezone.
 *
 * Fixed locale and an explicit `timeZone`, deliberately: an `Intl` call without
 * them renders differently depending on which machine ran the build, which is
 * exactly the class of bug the hours formatter was hand-rolled to avoid.
 */
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
