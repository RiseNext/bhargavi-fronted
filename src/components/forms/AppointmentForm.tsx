"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, Select, TextArea } from "./fields";
import { services } from "@/content/services";
import { formatDateTime, whatsappUrl } from "@/lib/whatsapp";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Appointment request, delivered over WhatsApp.
 *
 * The visitor's WhatsApp opens with the whole request composed, addressed to
 * the clinic; they press send. It arrives from their own number, so the reply
 * goes straight back in the same thread. /api/contact is still pinged in the
 * background purely as a server-side record — it is not the delivery path.
 */
export function AppointmentForm({
  defaultService = "",
  compact = false,
}: {
  defaultService?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [link, setLink] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const service = services.find((s) => s.slug === data.service);

    const url = whatsappUrl("New appointment request", [
      { label: "Name", value: data.name },
      { label: "Phone", value: data.phone },
      { label: "Email", value: data.email },
      { label: "Therapy", value: service?.title ?? "Not sure — please advise" },
      { label: "Preferred time", value: formatDateTime(data.datetime) },
      { label: "Concern", value: data.message },
    ]);

    setLink(url);

    // Opened synchronously, before any await — an async gap here loses the
    // user-gesture context and the browser blocks the tab.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    setState("sent");
    if (opened) form.reset();

    // Background record only; never let a failure here affect the handover.
    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "appointment", ...data }),
    }).catch(() => {});
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
        Send on WhatsApp
      </Button>

      <FormStatus
        state={state}
        successText="Your request is ready in WhatsApp — press send there and we'll call you back shortly."
        action={
          link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              WhatsApp didn&apos;t open? Tap here
            </a>
          )
        }
      />
    </form>
  );
}
