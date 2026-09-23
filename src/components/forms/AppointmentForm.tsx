"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, Select, TextArea } from "./fields";
import { services } from "@/content/services";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Appointment request. Posts to /api/contact — that route is a STUB that
 * validates and logs but does not yet deliver mail. See docs/CONTENT-TODO.md.
 */
export function AppointmentForm({
  defaultService = "",
  compact = false,
}: {
  defaultService?: string;
  compact?: boolean;
}) {
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
          kind: "appointment",
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
    <form onSubmit={onSubmit} className="space-y-stack">
      <div
        className={compact ? "space-y-stack" : "grid gap-stack sm:grid-cols-2"}
      >
        <Field label="Your name" name="name" required autoComplete="name" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
        />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Select
          label="Therapy of interest"
          name="service"
          defaultValue={defaultService}
          options={[
            { value: "", label: "Not sure — please advise" },
            ...services.map((s) => ({ value: s.slug, label: s.title })),
          ]}
        />
        <Field
          label="Preferred date & time"
          name="datetime"
          type="datetime-local"
          className={compact ? undefined : "sm:col-span-2"}
        />
      </div>

      <TextArea
        label="What would you like help with?"
        name="message"
        rows={compact ? 2 : 3}
        placeholder="Briefly describe your symptoms…"
      />

      <label className="flex items-start gap-3 text-small text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-4 shrink-0 accent-[#a9522f]"
        />
        <span>I agree to be contacted about my appointment request.</span>
      </label>

      <Button type="submit" size="lg" disabled={state === "sending"} className="w-full">
        {state === "sending" ? "Sending…" : "Request appointment"}
      </Button>

      <FormStatus
        state={state}
        successText="Thank you — we've received your request and will call you back shortly."
      />
    </form>
  );
}
