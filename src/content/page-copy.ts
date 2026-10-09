/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/content-blocks.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export type PageCopyLink = { label: string; href: string };

export type PageCopyItem = {
  label?: string;
  value?: string;
  text?: string;
  href?: string;
  iconKey?: string;
  image?: string;
  alt?: string;
  lines?: string[];
};

export type PageCopyBlock = {
  label?: string;
  /** May contain `*emphasis*` markers — render with `lib/emphasis.tsx`. */
  title?: string;
  lead?: string;
  body?: string[];
  cta?: PageCopyLink;
  cta2?: PageCopyLink;
  /** A destination whose label the component supplies from code (D-040). */
  ctaHref?: string;
  cta2Href?: string;
  extra?: Record<string, unknown>;
  items?: Record<string, PageCopyItem[]>;
};

export const pageCopy: Record<string, PageCopyBlock> = {
  "about.achievements": {
    label: "Recognition",
    title: "Some key achievements",
    lead: "Beyond the clinic, her work extends into lecturing, NGO service and community health.",
  },
  "about.hero": {
    label: "Our founder",
  },
  "about.philosophy": {
    label: "Our philosophy",
    title: "Three things we hold to",
  },
  "about.story": {
    label: "Her story",
    title: "The brain child behind Bhargavi Health World",
    ctaHref: "/contact",
    extra: {
      pullQuote: "“The only way to do great work is to love what you do.”",
      pullQuoteCaption: "The belief the clinic was built on",
    },
  },
  "about.theSpace": {
    label: "The space",
    title: "Where treatment happens",
    lead: "Clean, private treatment rooms in Chikkadpally — a two-minute walk from Metro Pillar 1115.",
  },
  "blog.comingSoon": {
    label: "Coming soon",
    title: "The first articles are being written",
    lead: "Acupressure points you can use at home, what to eat for joint pain, and what really happens in a cupping session.",
    cta: {
      label: "Watch Health Talks",
      href: "/videos",
    },
    cta2: {
      label: "Browse therapies",
      href: "/services",
    },
    extra: {
      secondary: "In the meantime, the Health Talks videos cover much of the same ground.",
    },
  },
  "blog.hero": {
    label: "Journal",
    title: "Notes on *natural* healing",
    lead: "Practical writing on pressure points, diet and everyday pain relief — from the clinic floor.",
  },
  "careers.apply": {
    label: "Apply",
    title: "Tell us about yourself",
    lead: "Fill in the form and we'll get back to you — shortlisted candidates hear from us within a week.",
    extra: {
      callLabel: "Prefer to call?",
      formRoleDefault: "General application",
    },
  },
  "careers.generalApplication": {
    label: "No matching role?",
    title: "We still want to hear from you",
    lead: "If you care about honest, patient-first wellness work, send a general application — we keep good people in mind.",
    cta: {
      label: "Send a general application",
      href: "#apply",
    },
  },
  "careers.jobCards": {
    extra: {
      modalLabel: "Apply",
      applyButton: "Apply for this role",
      modalCloseLabel: "Close",
      requirementsHeading: "What you'll need",
      responsibilitiesHeading: "Responsibilities",
    },
  },
  "careers.openings": {
    label: "Open positions",
    title: "Current openings",
    extra: {
      asideLead: "Join a small team that treats the cause, not just the pain — shortlisted candidates hear back within a week.",
    },
  },
  "contact.appointmentBlock": {
    label: "For appointment",
    title: "Tell us what's troubling you",
    lead: "Share a little detail and a time that suits. We call back to confirm — usually the same day.",
  },
  "contact.faqSection": {
    label: "Before you come in",
    title: "Quick answers",
  },
  "contact.hero": {
    label: "For appointment",
    title: "Book a *consultation*",
    lead: "Walk in to experience a world of exceptional care in alternate medicine — or reserve a slot so you don't have to wait.",
  },
  "contact.infoCards": {
    items: {
      items: [
        {
          label: "Call",
          value: "Tap to call",
          iconKey: "phone",
        },
        {
          label: "Visit",
          value: "Open in Maps",
          iconKey: "pin",
        },
        {
          label: "Email",
          value: "Send an email",
          iconKey: "mail",
        },
        {
          label: "Hours",
          value: "Message on WhatsApp",
          iconKey: "clock",
        },
      ],
    },
  },
  "contact.map": {
    extra: {
      captionBelow: "Near Pista House, Chikkadpally · Metro Pillar 1115",
    },
  },
  "contact.messageBlock": {
    title: "Leave a message instead",
    lead: "Not ready to book? Ask a question and we’ll reply.",
  },
  "gallery.hero": {
    label: "Inside the clinic",
    title: "A look *around* the clinic",
    lead: "Treatment rooms, therapy charts and the everyday work of natural healing in Chikkadpally.",
  },
  "global.ctaBand": {
    label: "Start today",
    title: "Your body has been asking for this",
    lead: "Book a consultation and find out what is actually causing the pain — then what to do about it.",
    cta: {
      label: "Book an appointment",
      href: "/contact",
    },
  },
  "global.processSteps": {
    label: "How it works",
    title: "Your first visit, step by step",
    lead: "No guesswork and no packages you didn't ask for. Here is exactly what happens from the moment you walk in.",
  },
  "home.appointmentBand": {
    label: "For appointment",
    title: "Walk in to exceptional care",
    lead: "Tell us what's troubling you and when suits. We call back to confirm — usually the same day.",
    extra: {
      formCardNote: "Fields marked * are required.",
      formCardTitle: "Request an appointment",
    },
    items: {
      rows: [
        {
          label: "Call",
        },
        {
          label: "WhatsApp",
        },
        {
          label: "Visit",
        },
      ],
    },
  },
  "home.faqSection": {
    label: "What people ask",
    title: "Questions before you book",
    lead: "Understanding alternate therapies is part of getting the right treatment — and of helping your body along.",
    cta: {
      label: "Ask us something else",
      href: "/contact",
    },
  },
  "home.healthTalks": {
    label: "Our expert",
    title: "Health talks",
    cta: {
      label: "All videos",
      href: "/videos",
    },
  },
  "home.hero": {
    cta: {
      label: "Book an appointment",
      href: "/contact",
    },
    cta2: {
      label: "See therapies",
      href: "/services",
    },
    items: {
      images: [
        {
          label: "wide treatment image",
          image: "https://res.cloudinary.com/iojros3g/image/upload/v1791475633/bhw/dev/services/acupuncture.jpg",
          alt: "Acupuncture needles placed along a patient's back at Bhargavi Health World",
        },
      ],
    },
  },
  "home.intro": {
    label: "About the clinic",
    title: "Healing that treats the *whole* person",
    cta: {
      label: "Read her story",
      href: "/about",
    },
    extra: {
      sinceCard: {
        label: "Since",
        value: "2017",
        caption: "Practising in Chikkadpally",
      },
    },
    items: {
      bulletList: [
        {
          text: "A full consultation before any treatment begins",
        },
        {
          text: "Plans built around your routine, not a template",
        },
        {
          text: "Therapies that complement your existing medication",
        },
        {
          text: "Clear pricing from the very first visit",
        },
      ],
      images: [
        {
          image: "https://res.cloudinary.com/iojros3g/image/upload/v1791475640/bhw/dev/services/seed-therapy.jpg",
          alt: "Seed therapy applied to pressure points on the hand",
        },
        {
          image: "https://res.cloudinary.com/iojros3g/image/upload/v1791475635/bhw/dev/services/accupressure.jpg",
          alt: "Acupressure applied by hand",
        },
      ],
    },
  },
  "home.testimonials": {
    label: "Happy patients",
    title: "In their own words",
    ctaHref: "/testimonials",
  },
  "home.therapyIndex": {
    label: "What we provide",
    title: "Ten therapies, one approach",
    lead: "Alternative medicine treats the whole person — mind, body and spirit — rather than just the symptom that brought you in.",
    cta: {
      label: "All services",
      href: "/services",
    },
  },
  "home.whyUs": {
    label: "Why choose us",
    title: "Reasons people come back",
    cta: {
      label: "Patient stories",
      href: "/testimonials",
    },
  },
  "notFound.notFound": {
    label: "Error 404",
    title: "This page has wandered off",
    lead: "The link may be old, or the page may have moved. Let us get you back to something useful.",
    cta: {
      label: "Back to home",
      href: "/",
    },
    cta2: {
      label: "Browse therapies",
      href: "/services",
    },
    extra: {
      bigNumeral: "404",
    },
  },
  "serviceDetail.bookingAside": {
    extra: {
      note: "We call back to confirm your slot — usually the same day.",
    },
  },
  "serviceDetail.callAside": {
    label: "Prefer to call?",
  },
  "serviceDetail.disclaimer": {
    lead: "Please note: this is a complementary therapy. It works alongside — not instead of — the medical care you already receive. Bring your current prescriptions to your first consultation.",
  },
  "serviceDetail.indications": {
    label: "Indications",
    title: "What it can help with",
  },
  "serviceDetail.metaRow": {
    items: {
      items: [
        {
          label: "Session length",
        },
        {
          label: "From",
        },
        {
          label: "Typical course",
        },
      ],
    },
  },
  "serviceDetail.overview": {
    label: "Overview",
    title: "About this therapy",
  },
  "serviceDetail.related": {
    label: "Explore more",
    title: "Other therapies you might need",
  },
  "services.faqSection": {
    label: "Before you book",
    title: "Common questions",
    lead: "Still unsure which therapy fits? Call us and we'll tell you honestly — including when we are not the right option.",
  },
  "services.hero": {
    title: "Ten therapies, one *whole-person* approach",
  },
  "testimonials.hero": {
    label: "Happy patients",
    title: "In their *own* words",
  },
  "videos.hero": {
    label: "Our expert",
    title: "Health *talks*",
  },
  "videos.subscribeCta": {
    label: "Subscribe on YouTube",
  },
};

/**
 * Derived helper — code-owned (R-g).
 *
 * Returns an empty block rather than throwing, so an unmapped slot renders
 * nothing instead of breaking the page. The generator's own validation is what
 * catches a missing slot, at build time.
 */
export const copyFor = (page: string, slot: string): PageCopyBlock =>
  pageCopy[`${page}.${slot}`] ?? {};

/**
 * 🔴 Whether the privacy policy may be shown (D-021).
 *
 * `false` while any slot still contains an unresolved
 * `UNKNOWN — CLIENT INPUT REQUIRED` fact, in which case the privacy slots are
 * absent from `pageCopy` entirely and `/privacy` must answer not-found. The
 * footer link and the sitemap entry are gated on this too, so an unapproved
 * policy is never advertised.
 */
export const privacyPublished = false;
