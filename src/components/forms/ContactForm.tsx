"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, TextArea } from "./fields";
import { whatsappUrl } from "@/lib/whatsapp";

type State = "idle" | "sending" | "sent" | "error";

/** Same WhatsApp handover as the appointment form — see AppointmentForm. */
export function ContactForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [state, setState] = useState<State>("idle");
  const [link, setLink] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const url = whatsappUrl("Website enquiry", [
      { label: "Name", value: data.name },
      { label: "Phone", value: data.phone },
      { label: "Email", value: data.email },
      { label: "Message", value: data.message },
    ]);

    setLink(url);

    // Synchronous: an await before this would cost us the user gesture.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    setState("sent");
    if (opened) form.reset();

    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "contact", ...data }),
    }).catch(() => {});
  }

  return (
    <form onSubmit={onSubmit} className="space-y-stack">
      <div className="grid gap-stack sm:grid-cols-2">
        <Field label="Your name" name="name" required autoComplete="name" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <TextArea label="Message" name="message" rows={4} required />

      <Button
        type="submit"
        size="lg"
        variant={tone === "dark" ? "inverse" : "solid"}
        disabled={state === "sending"}
      >
        Send on WhatsApp
      </Button>

      <FormStatus
        state={state}
        successText="Your message is ready in WhatsApp — press send there and we'll reply soon."
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
