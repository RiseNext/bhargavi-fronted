"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, Select, TextArea } from "./fields";
import { jobs } from "@/content/careers";
import { site } from "@/lib/site";

type State = "idle" | "sending" | "sent" | "error";

const roleOptions = [
  ...jobs.map((j) => ({ value: j.title, label: j.title })),
  { value: "General application", label: "General application" },
];

export function CareerForm({ role }: { role?: string }) {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "career", ...data }),
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
      <div className="grid gap-stack sm:grid-cols-2">
        <Select
          label="Role applying for"
          name="role"
          required
          options={roleOptions}
          defaultValue={role}
        />
        <Field
          label="Experience"
          name="experience"
          placeholder="e.g. 2 years, fresher"
        />
      </div>
      <TextArea
        label="Why you?"
        name="message"
        rows={4}
        required
        placeholder="A few lines about yourself and your work"
      />

      <Button type="submit" size="lg" variant="solid" disabled={state === "sending"}>
        {state === "sending" ? "Submitting…" : "Submit application"}
      </Button>

      <FormStatus
        state={state}
        successText={`Thank you — your application is in. Email your resume to ${site.email} with the role in the subject line.`}
      />
    </form>
  );
}
