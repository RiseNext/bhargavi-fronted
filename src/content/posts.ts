/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/posts and GET /api/posts/{slug}.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

/**
 * One block of a post's body.
 *
 * Six types, not three: `text`, `heading`, `image`, `youtube`, `quote`, `list`.
 *
 * 🔴 `textHtml` is sanitised ON WRITE (an allowlist of
 * `p,strong,em,u,a,ul,ol,li,br`), asserted against the stored rows, and is
 * deliberately NOT re-sanitised on read. Every other field is plain text, and
 * `youtubeId` is an 11-character id.
 */
export type PostBlock = {
  type: "text" | "heading" | "image" | "youtube" | "quote" | "list";
  textHtml: string | null;
  headingLevel: number | null;
  headingText: string | null;
  image: string | null;
  imageAlt: string | null;
  imageCaption: string | null;
  youtubeId: string | null;
  youtubeTitle: string | null;
  listItems: string[] | null;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  author: string;
  tags: string[];
  publishedAt: string | null;
  readingMinutes: number | null;
  /** Real timestamp from the row — `dateModified` in BlogPosting JSON-LD. */
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  blocks: PostBlock[];
};

export const posts: Post[] = [];

/** Derived helper — code-owned (R-g). */
export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
