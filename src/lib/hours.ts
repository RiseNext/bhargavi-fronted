/**
 * Opening hours, derived from the ONE generated source.
 *
 * 🔴 WHY THIS EXISTS. The hours were previously written out by hand in four
 * places: `site.hours` (generated), `OpenStatus`'s own `WINDOWS`, a literal
 * line on the service detail page, and the `MedicalClinic` JSON-LD in
 * `layout.tsx`. Three of those four did not move when the hours changed in the
 * admin panel — so editing them would have left the live "open now" badge, the
 * service page and the structured data all contradicting the footer.
 *
 * Everything here reads `hoursStructured`, which the generator emits from
 * `branches.hours` (D-028). Change the hours in the admin panel and every
 * surface follows.
 *
 * 🔴 The output strings are byte-for-byte what the four sites rendered before.
 * This is a consistency fix, not a content or design change (D-010).
 */

import { hoursStructured } from "./site";

/** `hoursStructured` entries are `{ day: 0-6, windows: [{ open, close }] }`. */
type Window = { open: string; close: string };
type DaySchedule = { day: number; windows: ReadonlyArray<Window> };

/*
 * The generator emits `hoursStructured` with `as const`, so its type is a deep
 * literal union ("09:00" rather than string). Widening it once here keeps every
 * helper below readable — otherwise each predicate has to restate that union,
 * and each would break the next time the seeded hours change.
 */
const schedule: ReadonlyArray<DaySchedule> = hoursStructured;

/** Minutes from midnight, from a `"HH:MM"` 24-hour string. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * `"09:00"` → `"9:00 AM"`, `"21:00"` → `"9:00 PM"`.
 *
 * Hand-rolled rather than `Intl`, matching the generator's own formatter: the
 * clinic's hours are displayed in one fixed style, and `Intl` would vary it
 * with the runtime's locale data. No leading zero on the hour, one space
 * before the meridiem — exactly the previous literals.
 */
export function to12Hour(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h24 = Math.floor(total / 60);
  const minutes = total % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12)}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * The open windows for the badge: minutes for comparison, display strings for
 * the text.
 *
 * Flattened across days because `OpenStatus` asks "is it open right now",
 * which only needs today's windows — and every day currently carries the same
 * one. Taking the first day's windows keeps the previous single-window
 * behaviour; a future per-day schedule would want `windowsForDay` below.
 */
export const openWindows: ReadonlyArray<{
  from: number;
  to: number;
  opens: string;
  closes: string;
}> = (schedule[0]?.windows ?? []).map((w: Window) => ({
  from: toMinutes(w.open),
  to: toMinutes(w.close),
  opens: to12Hour(w.open),
  closes: to12Hour(w.close),
}));

/** Today's windows in the clinic's timezone, for a per-day schedule. */
export function windowsForDay(day: number): ReadonlyArray<{
  from: number;
  to: number;
  opens: string;
  closes: string;
}> {
  const entry = schedule.find((h) => h.day === day);
  return (entry?.windows ?? []).map((w: Window) => ({
    from: toMinutes(w.open),
    to: toMinutes(w.close),
    opens: to12Hour(w.open),
    closes: to12Hour(w.close),
  }));
}

/** The earliest opening time across the week, for "opens tomorrow at …". */
export const earliestOpening: string = openWindows[0]?.opens ?? "";

/**
 * The compact one-line form the service detail page shows —
 * e.g. `"Mon–Sun · 9:00 AM – 9:00 PM"`.
 *
 * Abbreviated day range rather than `site.hours[0].days` ("Monday – Sunday")
 * because that page has always shown the short form, and D-010 forbids
 * changing what a visitor reads. The range collapses only when every day
 * carries identical windows; otherwise each distinct group is listed, so an
 * unusual schedule degrades into something accurate rather than something
 * wrong.
 */
export const hoursShort: string = (() => {
  if (schedule.length === 0) return "";

  const signature = (h: DaySchedule) =>
    h.windows.map((w) => `${w.open}-${w.close}`).join(",");

  const allSame = schedule.every((h) => signature(h) === signature(schedule[0]));

  const times = (h: DaySchedule) =>
    h.windows.map((w) => `${to12Hour(w.open)} – ${to12Hour(w.close)}`).join(", ");

  if (allSame && schedule.length > 1) {
    const first = DAY_ABBREV[schedule[0].day];
    const last = DAY_ABBREV[schedule[schedule.length - 1].day];
    return `${String(first)}–${String(last)} · ${times(schedule[0])}`;
  }

  return schedule
    .map((h) => `${String(DAY_ABBREV[h.day])} ${times(h)}`)
    .join(" · ");
})();

const SCHEMA_DAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * `OpeningHoursSpecification` for the `MedicalClinic` JSON-LD.
 *
 * Days whose windows are identical are grouped into one specification, which
 * is both what schema.org expects and what the hand-written version did.
 */
export const openingHoursSpecification: ReadonlyArray<{
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}> = (() => {
  const groups = new Map<string, { days: number[]; window: Window }>();

  for (const entry of schedule) {
    for (const w of entry.windows) {
      const key = `${w.open}-${w.close}`;
      const existing = groups.get(key);
      if (existing) existing.days.push(entry.day);
      else groups.set(key, { days: [entry.day], window: w });
    }
  }

  return [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification" as const,
    // Monday-first, matching the previous hand-written order.
    dayOfWeek: [...g.days]
      .sort((a, b) => ((a === 0 ? 7 : a) - (b === 0 ? 7 : b)))
      .map((d) => String(SCHEMA_DAY[d])),
    opens: g.window.open,
    closes: g.window.close,
  }));
})();
