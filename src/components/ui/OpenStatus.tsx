"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Live "are they open right now" badge, evaluated in the clinic's timezone
 * rather than the visitor's — someone checking from another state should see
 * whether Chikkadpally is open, not their own local hours.
 *
 * Mirrors `site.hours`. Keep the two in step if the hours ever change.
 */
const WINDOWS = [
  { from: 9 * 60, to: 21 * 60, opens: "9:00 AM", closes: "9:00 PM" },
];

type State = { open: boolean; detail: string };

function clinicNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function evaluate(): State {
  const { minutes } = clinicNow();

  const current = WINDOWS.find((w) => minutes >= w.from && minutes < w.to);
  if (current) return { open: true, detail: `Open until ${current.closes}` };

  const next = WINDOWS.find((w) => minutes < w.from);
  if (next) return { open: false, detail: `Opens at ${next.opens}` };

  return { open: false, detail: "Opens tomorrow, 9:00 AM" };
}

export function OpenStatus({ className }: { className?: string }) {
  // Null on the server and on first paint — the answer depends on the clock,
  // so rendering it during hydration would risk a mismatch.
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    setState(evaluate());
    const id = setInterval(() => setState(evaluate()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-label uppercase tracking-[0.12em]",
        state.open
          ? "border-olive/30 bg-olive-soft text-olive-deep"
          : "border-line bg-sand text-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          state.open ? "bg-olive animate-pulse" : "bg-taupe",
        )}
      />
      {state.detail}
    </span>
  );
}
