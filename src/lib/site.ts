/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/site-settings.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export const site = {
  name: "Bhargavi Health World",
  shortName: "Bhargavi",
  tagline: "Wellness Center in Chikkadpally",
  description: "Holistic wellness care in Chikkadpally, Hyderabad. Acupuncture, acupressure, naturopathy and natural pain-relief therapies led by Anjana Bhargavi.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhargavihealthworld.com",
  locale: "en_IN",
  founder: {
    name: "Anjana Bhargavi",
    honorific: "Mrs.",
    qualifications: "BA, B.Ed, MA, Diploma in Acupuncture",
    role: "Founder Acupuncture",
    photo: "https://res.cloudinary.com/iojros3g/image/upload/v1791475666/bhw/dev/brand/anjana-bhargavi.jpg",
  },
  phones: [
    {
      label: "+91 70751 57013",
      href: "tel:+917075157013",
      branch: "Bowenpally",
    },
    {
      label: "+91 98663 76203",
      href: "tel:+919866376203",
      branch: "Chikkadpally",
    },
  ],
  branches: [
    {
      name: "Chikkadpally",
      phone: "+91 98663 76203",
      whatsapp: "+919866376203",
    },
    {
      name: "Bowenpally",
      phone: "+91 70751 57013",
      whatsapp: "+917075157013",
    },
  ],
  whatsapp: {
    number: "+917075157013",
    href: "https://api.whatsapp.com/send?phone=+917075157013&text=hello&lang=en",
  },
  email: "bhargavihealthworld@gmail.com",
  address: {
    line1: "H. No 1-8-539/1/a, Metro Pillar No-1115",
    line2: "Near Pista House, Chikkadpally",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500020",
    country: "IN",
    full: "H. No 1-8-539/1/a, Metro Pillar No-1115, Near Pista House, Chikkadpally, Hyderabad, Telangana - 500020",
  },
  geo: {
    lat: 17.405174930115965,
    lng: 78.49652574603265,
  },
  mapsUrl: "https://maps.app.goo.gl/XLX7hEATPodxRXa4A",
  mapEmbedSrc: "https://www.google.com/maps?q=17.405174930115965,78.49652574603265&z=16&output=embed",
  priceRange: "₹100–1000",
  hours: [
    {
      days: "Monday – Sunday",
      time: "9:00 AM – 9:00 PM",
    },
  ],
  socials: [
    {
      name: "Facebook",
      href: "https://www.facebook.com/Bhargavihealthworld",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/bhargavihealthworld/",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@bhargavihealthworld8686",
    },
  ],
  logo: "https://res.cloudinary.com/iojros3g/image/upload/v1791475661/bhw/dev/brand/bhargavi-mark.png",
  logoLockup: "https://res.cloudinary.com/iojros3g/image/upload/v1791475663/bhw/dev/brand/bhargavi-lockup.png",
  brandColor: "#44683d",
  ogImage: "https://res.cloudinary.com/iojros3g/image/upload/v1791475665/bhw/dev/brand/og-card.png",
} as const;

/** ✅ D-028 — additive. Consumed by OpenStatus and the JSON-LD builder. */
export const hoursStructured = [
  {
    day: 1,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 2,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 3,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 4,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 5,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 6,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
  {
    day: 0,
    windows: [
      {
        open: "09:00",
        close: "21:00",
      },
    ],
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
 * 🔴 D-026 — NAVIGATION IS CODE-OWNED.
 *
 * Re-emitted verbatim, not sourced from the CMS. `Header.tsx` imports `nav`,
 * `NavItem` and `NavChild`; losing any of them is a dead deployment. Editable
 * navigation was never requested and risks a non-technical admin breaking the
 * site's information architecture.
 * ──────────────────────────────────────────────────────────────────────────── */

export type NavChild = { label: string; href: string; hint?: string };

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const nav: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Media",
    href: "/gallery",
    children: [
      {
        label: "Clinic Gallery",
        href: "/gallery",
      },
      {
        label: "Health Talks",
        href: "/videos",
      },
    ],
  },
  {
    label: "Testimonials",
    href: "/testimonials",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Careers",
    href: "/careers",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];
