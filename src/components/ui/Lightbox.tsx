"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Item = { src: string; alt: string };

export function GalleryLightbox({ images }: { images: Item[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) =>
      setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="img-edge group relative block aspect-4/3 w-full overflow-hidden rounded-lg bg-sand"
            >
              <span className="sr-only">Open image {i + 1} full size</span>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-walnut-deep/0 transition-colors duration-400 group-hover:bg-walnut-deep/20"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 right-4 grid aspect-square w-9 place-items-center rounded-full bg-ivory text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 1H1v5M10 15h5v-5M15 6V1h-5M1 10v5h5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-walnut-deep/95 p-gutter"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-gutter top-gutter grid aspect-square w-11 place-items-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            <span className="sr-only">Close</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <Nav side="left" onClick={() => step(-1)} />
          <Nav side="right" onClick={() => step(1)} />

          <figure
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-4/3 max-h-[78vh] w-full">
              <Image
                src={images[index].src}
                alt={images[index].alt}
                fill
                sizes="(min-width: 1024px) 64rem, 92vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-small tabular-nums text-ivory/70">
              {index + 1} / {images.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function Nav({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 grid aspect-square w-11 -translate-y-1/2 place-items-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory hover:text-ink ${
        side === "left" ? "left-gutter" : "right-gutter"
      }`}
    >
      <span className="sr-only">{side === "left" ? "Previous" : "Next"} image</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={side === "left" ? "rotate-180" : undefined}
      >
        <path
          d="M3 8h10m0 0L9 4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
