/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/videos and GET /api/gallery.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export type Video = {
  id: string;
  title: string;
  translation?: string;
  featured?: boolean;
};

export const videos: Video[] = [
  {
    id: "BKnMSEtq6Rk",
    title: "I Felt Relaxed in Just 5–10 Minutes!",
  },
  {
    id: "ym7HVCi9tX4",
    title: "Abhyanga Therapy Patient Experience",
  },
  {
    id: "Tde7BiunYMs",
    title: "Patient Experience at Bhargavi Health World",
  },
  {
    id: "JSNZRrijxsg",
    title: "Her Wellness Journey",
  },
  {
    id: "uaGMSzRSOjo",
    title: "Kansa Therapy for Deep Relaxation",
  },
  {
    id: "Yf-qc_s4A5w",
    title: "Agni Karma Therapy in Ayurveda",
  },
  {
    id: "EpJXaBDkUPs",
    title: "Shiro Vasti Therapy",
  },
  {
    id: "-aRuGxjhknw",
    title: "Netra Tarpana Treatment in Ayurveda",
  },
  {
    id: "JAq_VcgMTV4",
    title: "Nasya Therapy Explained",
  },
];

/** Derived helpers — code-owned (R-g). Thumb and embed URLs are never stored. */
export const featuredVideos = videos.filter((v) => v.featured);

export const youtubeThumb = (id: string) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const youtubeWatch = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;

export const galleryImages = [
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792048848/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-32-pm-1-c9b3c9f826.jpg",
    alt: "img 1",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792048914/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-32-pm-e8291b9956.jpg",
    alt: "img 2",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792048948/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-33-pm-1-eed93db8fc.jpg",
    alt: "img 3",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792048985/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-33-pm-2-6604d1e99a.jpg",
    alt: "img 4",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792049043/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-33-pm-7d8583ef14.jpg",
    alt: "img 5",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792049073/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-34-pm-1-ad8c8b7fe0.jpg",
    alt: "img 6",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792049099/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-34-pm-2-65e77dae21.jpg",
    alt: "img 7",
  },
  {
    src: "https://res.cloudinary.com/iojros3g/image/upload/v1792049163/bhw/prod/services/whatsapp-image-2026-10-02-at-3-19-35-pm-1-ea6282441e.jpg",
    alt: "img 8",
  },
];
