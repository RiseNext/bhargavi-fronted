"use client";

import { useState } from "react";
import { Frame } from "@/components/ui/Media";
import type { PostBlock } from "@/content/posts";

/**
 * Renders a post's body blocks.
 *
 * A client component only because the YouTube block needs a click to mount its
 * iframe. Everything else is static markup.
 *
 * 🔴 Styling comes entirely from the existing `.prose` rules in `globals.css` —
 * h2/h3, `ul` with its custom `li::before` dash, terracotta links and the olive
 * blockquote rule. No CSS was added for this, deliberately: the blog template
 * was already styled and waiting for content.
 */
export function PostBlocks({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="prose">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "text":
      // 🔴 NOT sanitised here, and that is correct. `textHtml` is sanitised ON
      // WRITE against an allowlist of p/strong/em/u/a/ul/ol/li/br
      // (src/lib/sanitize.ts, enforced in admin/blog-blocks.ts and asserted
      // against the stored rows), and the public read deliberately does not
      // re-sanitise. Do not add read-time sanitisation here: two sanitisers for
      // one value is how they drift.
      return block.textHtml === null ? null : (
        <div dangerouslySetInnerHTML={{ __html: block.textHtml }} />
      );

    case "heading": {
      if (block.headingText === null) return null;
      // Only h2 and h3 are styled by `.prose`; anything else would be unstyled.
      return block.headingLevel === 3 ? (
        <h3>{block.headingText}</h3>
      ) : (
        <h2>{block.headingText}</h2>
      );
    }

    case "quote":
      return block.textHtml === null ? null : (
        <blockquote dangerouslySetInnerHTML={{ __html: block.textHtml }} />
      );

    case "list":
      return block.listItems === null || block.listItems.length === 0 ? null : (
        <ul>
          {block.listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "image":
      return block.image === null ? null : (
        <figure>
          <Frame
            src={block.image}
            alt={block.imageAlt ?? ""}
            sizes="(min-width: 1024px) 70vw, 92vw"
          />
          {/* null means unknown — render nothing, never an empty caption. */}
          {block.imageCaption !== null && (
            <figcaption className="mt-stack text-small text-muted">
              {block.imageCaption}
            </figcaption>
          )}
        </figure>
      );

    case "youtube":
      return block.youtubeId === null ? null : (
        <YouTube id={block.youtubeId} title={block.youtubeTitle} />
      );

    default:
      // An unknown block type renders nothing rather than breaking the article.
      return null;
  }
}

/**
 * The same click-to-load facade `VideoCard` uses, for the same reasons: no
 * third-party iframe until the visitor asks for it, and `youtube-nocookie`.
 */
function YouTube({ id, title }: { id: string; title: string | null }) {
  const [playing, setPlaying] = useState(false);
  const label = title ?? "Play video";

  return (
    <div className="not-prose overflow-hidden rounded-lg border border-line">
      <div className="relative aspect-video bg-sand">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 grid place-items-center"
          >
            <span className="sr-only">{label}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="relative grid aspect-square w-14 place-items-center rounded-full bg-ivory/90 text-ink transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {title !== null && (
        <p className="border-t border-line px-4 py-3 text-small text-muted">{title}</p>
      )}
    </div>
  );
}
