"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { youtubeThumb, type Video } from "@/content/media";

/**
 * Lite YouTube facade — the iframe only mounts after a click, so the Health
 * Talks page doesn't load 19 embeds up front.
 */
export function VideoCard({ video, className }: { video: Video; className?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className={cn("group", className)}>
      <div className="img-edge relative aspect-video w-full overflow-hidden rounded-lg bg-walnut">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 size-full cursor-pointer"
          >
            <span className="sr-only">Play video: {video.title}</span>
            <Image
              src={youtubeThumb(video.id)}
              alt=""
              fill
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-walnut-deep/20 transition-colors duration-400 group-hover:bg-walnut-deep/35"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 grid aspect-square w-[clamp(3rem,2.5rem+2vw,4rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ivory text-ink transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
            >
              <svg
                width="16"
                height="18"
                viewBox="0 0 20 22"
                fill="currentColor"
                className="ml-0.5"
              >
                <path d="M19 9.27a2 2 0 0 1 0 3.46L3 21.66A2 2 0 0 1 0 19.93V2.07A2 2 0 0 1 3 .34l16 8.93Z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <h3 className="mt-stack text-h4 text-ink">{video.title}</h3>
      {video.translation && (
        <p className="mt-1 text-small text-muted">{video.translation}</p>
      )}
    </article>
  );
}
