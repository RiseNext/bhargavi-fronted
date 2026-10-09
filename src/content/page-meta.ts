/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/page-meta.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export type PageMetaEntry = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
};

export const pageMeta: Record<string, PageMetaEntry> = {
  about: {
    title: "Anjana Bhargavi | Acupuncture Therapist in Chikkadpally",
    description: "Anjana Bhargavi, a leading acupuncture therapist in Chikkadpally, offers expert holistic treatments at Bhargavi Health World. Restore balance and well-being with natural therapies in Hyderabad.",
    canonical: "/about",
  },
  blog: {
    title: "Blog | Acupuncture Clinic in Chikkadpally",
    description: "Read the latest articles from Bhargavi Health World, a trusted acupuncture clinic in Chikkadpally, Hyderabad. Explore tips on acupuncture and holistic wellness.",
    canonical: "/blog",
  },
  careers: {
    title: "Careers | Join Bhargavi Health World, Hyderabad",
    description: "Therapist, consultant and front-desk openings at Bhargavi Health World's Chikkadpally and Bowenpally branches. Build a career in holistic wellness care.",
    canonical: "/careers",
  },
  contact: {
    title: "Contact | Trusted Acupuncture Clinic in Chikkadpally",
    description: "Reach out to Bhargavi Health World for expert acupuncture treatments in Chikkadpally, Hyderabad. Contact us for appointments, consultations, or inquiries about our pain relief and wellness services.",
    canonical: "/contact",
  },
  gallery: {
    title: "Clinic Gallery",
    description: "Explore images of holistic acupuncture and acupressure therapy at Bhargavi Health World, Chikkadpally, Hyderabad. See how our treatments enhance wellness and relieve pain naturally.",
    canonical: "/gallery",
  },
  home: {
    title: "Wellness Center in Chikkadpally | Acupressure Clinic in Chikkadpally",
    description: "Bhargavi Health World in Chikkadpally, Hyderabad offers holistic wellness care. Led by Anjana Bhargavi (Diploma in Acupuncture), we specialize in acupuncture, pain management & natural healing therapies.",
    canonical: "/",
  },
  privacy: {
    canonical: "/privacy",
  },
  services: {
    title: "Services",
    description: "Bhargavi Health World in Chikkadpally offers expert holistic care through acupuncture, acupressure, physiotherapy, and more. Restore your health naturally in the heart of Hyderabad.",
    canonical: "/services",
  },
  testimonials: {
    title: "Testimonials | Acupuncture & Wellness Treatment Reviews",
    description: "Read patient testimonials at Bhargavi Health World, Hyderabad, and see how our acupuncture and wellness treatments aid pain relief and stress management.",
    canonical: "/testimonials",
  },
  videos: {
    title: "Health Talks | Acupressure Treatment in Chikkadpally",
    description: "Watch videos on acupuncture and acupressure at Bhargavi Health World, Chikkadpally, Hyderabad. Discover expert pain relief and wellness therapies.",
    canonical: "/videos",
  },
};

/** Derived helper — code-owned (R-g). */
export const metaForPage = (page: string): PageMetaEntry => pageMeta[page] ?? {};

/** 🔴 SEO-01 — newest content change, for sitemap.xml's static routes. */
export const contentUpdatedAt = "2026-10-09T15:46:11.210Z";
