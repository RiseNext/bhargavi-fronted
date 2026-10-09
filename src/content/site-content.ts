/**
 * ⚠ GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Produced by `scripts/generate-content.mjs` from GET /api/site-settings (stats), /api/content-lists and /api/faqs.
 * Run `npm run generate:content` to refresh; the result is committed so a
 * build never depends on the API being reachable (D-016).
 *
 * Hand edits are lost on the next build. Change the content in the admin panel.
 */

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  /** ✅ D-023 — the hero's own wording. Resolution rule: `heroLabel ?? label`. */
  heroLabel?: string;
  showInHero?: boolean;
};

export const stats: Stat[] = [
  {
    value: 8,
    suffix: "+",
    label: "Years of expertise",
    heroLabel: "Years practising",
    showInHero: true,
  },
  {
    value: 1000,
    suffix: "+",
    label: "Acupuncture cases",
  },
  {
    value: 3000,
    suffix: "+",
    label: "Patients treated",
    showInHero: true,
  },
  {
    value: 10,
    suffix: "",
    label: "Therapies offered",
    heroLabel: "Therapies",
    showInHero: true,
  },
];

export const whyChooseUs = [
  {
    title: "Personalized Treatment",
    icon: "https://res.cloudinary.com/iojros3g/image/upload/v1791475657/bhw/dev/icons/personalized-treatment.png",
    text: "No two bodies respond the same way. Every plan starts with a full consultation, not a template.",
  },
  {
    title: "Experienced Therapists",
    icon: "https://res.cloudinary.com/iojros3g/image/upload/v1791475658/bhw/dev/icons/licensed-therapists.png",
    text: "Eight years of practice across acupuncture, acupressure, cupping and varma therapy.",
  },
  {
    title: "Affordable Pricing",
    icon: "https://res.cloudinary.com/iojros3g/image/upload/v1791475659/bhw/dev/icons/affordable-pricing.png",
    text: "Sessions from ₹100. Clear pricing before you begin — no packages you didn't ask for.",
  },
  {
    title: "High Standards",
    icon: "https://res.cloudinary.com/iojros3g/image/upload/v1791475660/bhw/dev/icons/high-industry-standards.png",
    text: "Single-use needles, sterile technique and a clean, private treatment room every time.",
  },
];

export const process = [
  {
    step: "01",
    title: "Consultation",
    text: "We sit down and go through your history, symptoms, diet and daily routine — not just the pain you walked in with.",
  },
  {
    step: "02",
    title: "Assessment",
    text: "Pressure points, posture and energy flow are assessed to find where the problem actually originates.",
  },
  {
    step: "03",
    title: "Treatment Plan",
    text: "You get a plan: which therapies, how many sittings, and what you can do at home between visits.",
  },
  {
    step: "04",
    title: "Follow-Up",
    text: "Progress is reviewed each sitting and the plan is adjusted. Most people notice a change within 2–4 sessions.",
  },
];

/** ⚠ Previously hardcoded inside about/page.tsx:26-39, not a content file. */
export const philosophy = [
  {
    title: "Treat the cause",
    text: "Pain is a message, not the problem. We look at posture, diet, sleep and stress before we reach for a needle.",
  },
  {
    title: "Complement, never replace",
    text: "These therapies work alongside your existing medical care. Bring your prescriptions — we build the plan around them.",
  },
  {
    title: "Teach you to self-care",
    text: "Every patient leaves knowing which points to press, what to eat, and what to do between sittings.",
  },
];

export const aboutStory = [
  "Mrs Anjana Bhargavi is the brain child behind the inspiring and exceptional Bhargavi Health World. A centre dedicated to providing world class treatments and counselling in alternate medicine which are tried, tested and proven to be effective. She believes “The only way to do great work is to love what you do”, and she most definitely has poured her heart and soul into the centre and into every patient's well being. Bhargavi was born and brought up in Mahabubnagar, Telangana. Now she serves as a senior Acupuncture Therapist.",
  "She started her career in 2017 and has since successfully treated 1000+ patients. Learning new things has always been a passion of hers and as a part of that, she learnt Varma Therapy, Cupping Therapy and more, to enhance patient well being through targeted treatment. She started Bhargavi Health World to spread happiness by making her patients healthy from within.",
  "Bhargavi Health World provides services including Acupressure Therapy, Acupuncture Therapy, Yoga, and meditation through Sunya.",
];

export const achievements = [
  "Invited to give a guest lecture by the NGO IAHO",
  "An active member of various NGOs",
  "Vice President — PR & Marketing, Junior Chamber International, Secunderabad Walkertown",
  "Council member, Sunyati International Foundation, Telangana State",
  "Recipient of SIMA awards and recognitions for her service",
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "How many sessions are needed for acupuncture to be effective?",
    answer: "The number of sessions required varies by individual and condition, but many people notice improvements after 2–4 sessions, with chronic issues potentially requiring more frequent visits.",
  },
  {
    question: "What conditions can seed therapy help with?",
    answer: "Seed therapy is often used to help with issues such as stress, anxiety, chronic pain, digestive problems, and respiratory issues, although its effectiveness can vary based on the individual.",
  },
  {
    question: "Is physiotherapy painful?",
    answer: "While some techniques may cause mild discomfort, physiotherapy should not be excessively painful. Your therapist will work with you to ensure the treatment is within your comfort levels while still being effective.",
  },
  {
    question: "Do I need an appointment, or can I walk in?",
    answer: "Walk-ins are welcome during clinic hours, but booking ahead means you won't wait. Call or WhatsApp +91 70751 57013 to reserve a slot.",
  },
  {
    question: "What are your timings?",
    answer: "Every day, Monday to Sunday, 9:00 AM – 9:00 PM.",
  },
  {
    question: "Can these therapies be taken alongside my existing medication?",
    answer: "In most cases, yes — these are complementary therapies, not replacements for medical treatment. Bring your current prescriptions to your first consultation so your plan can be built around them.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * Prose still awaiting its CMS home — re-emitted verbatim.
 *
 * `homeIntro` belongs in `content_blocks` (`home.intro`), which seeds in stage
 * S3 behind gate 0.12. `treatmentsIntro` is dead code — exported but rendered
 * on no page — so it is preserved rather than seeded (R-20).
 *
 * Preserving them keeps the site byte-identical in the meantime, which is
 * exactly what D-011 requires.
 * ──────────────────────────────────────────────────────────────────────────── */

export const homeIntro = "Mrs Anjana Bhargavi is the brain child behind the inspiring and exceptional Bhargavi Health World — a centre dedicated to providing world class treatments and counselling in alternate medicine which are tried, tested and proven to be effective. She believes “The only way to do great work is to love what you do”, and she has most definitely poured her heart and soul into the centre and into every patient's well being.";

export const treatmentsIntro = "Alternative medicine plays a vital role in holistic health by offering diverse therapeutic options that may complement conventional treatments. It emphasizes treating the whole person — mind, body, and spirit — rather than just symptoms. Techniques such as acupuncture, chiropractic care, and nutrition can alleviate chronic conditions, reduce stress, and improve quality of life.";
