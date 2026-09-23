"use client";

import { useId, useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

export function NewsletterForm() {
  const id = useId();
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "newsletter",
          ...Object.fromEntries(new FormData(form)),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-ivory/25 pb-3 focus-within:border-ivory"
      >
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="min-w-[12rem] flex-1 border-0 bg-transparent p-0 text-body text-ivory placeholder:text-ivory/35 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="group/link inline-flex shrink-0 items-center gap-2 text-small font-medium text-ivory disabled:opacity-55"
        >
          <span className="underline-grow">
            {state === "sending" ? "Sending" : "Subscribe"}
          </span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover/link:translate-x-1"
          >
            <path
              d="M3 8h10m0 0L9 4m4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      {state !== "idle" && state !== "sending" && (
        <p role="status" className="mt-3 text-small text-ivory/70">
          {state === "sent"
            ? "You're on the list — thank you."
            : "That didn't go through. Please try again."}
        </p>
      )}
    </div>
  );
}
