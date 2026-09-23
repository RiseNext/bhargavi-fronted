"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, TextArea } from "./fields";

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm({ tone = "light" }: { tone?: "light" | "dark" }) {
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
          kind: "contact",
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
        {state === "sending" ? "Sending…" : "Send message"}
      </Button>

      <FormStatus
        state={state}
        successText="Thank you — your message has reached us. We'll reply soon."
      />
    </form>
  );
}
