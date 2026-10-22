"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, Honeypot, TextArea } from "./fields";
import { BranchChoice, type ChoosableBranch } from "./BranchChoice";
import { whatsappUrl } from "@/lib/whatsapp";

type State = "idle" | "choose" | "sent" | "error";

/**
 * General enquiry, delivered over WhatsApp.
 *
 * 🔴 TWO STEPS, NOT ONE. This used to call `whatsappUrl(...)` with no phone
 * argument, which silently defaulted to `site.whatsapp.number` — one branch's
 * line — and opened WhatsApp the instant Send was pressed. Every enquiry
 * therefore reached the same branch no matter who the visitor meant to
 * contact, and nothing on screen told them where it had gone. The visitor now
 * picks the branch, exactly as the appointment form has always made them.
 *
 * ⚠ The branch tap is the user gesture that opens WhatsApp, so `sendTo` must
 * stay synchronous up to `window.open`. The `/api/contact` record is fired
 * afterwards and deliberately unawaited — it is a server-side copy, never the
 * delivery path.
 */
export function ContactForm({
  branches,
  tone = "light",
}: {
  branches: readonly ChoosableBranch[];
  tone?: "light" | "dark";
}) {
  const [state, setState] = useState<State>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, string> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Step 1 — validate and hold the details, then ask which branch.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
      string,
      string
    >;
    setPending(data);
    setState("choose");
  }

  // Step 2 — the branch tap opens WhatsApp. Synchronous, see above.
  function sendTo(branch: ChoosableBranch) {
    if (!pending) return;

    const url = whatsappUrl(
      "Website enquiry",
      [
        { label: "Branch", value: branch.name },
        { label: "Name", value: pending.name },
        { label: "Phone", value: pending.phone },
        { label: "Email", value: pending.email },
        { label: "Message", value: pending.message },
      ],
      branch.whatsapp,
    );

    setLink(url);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    setState("sent");
    if (opened) formRef.current?.reset();

    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "contact", branch: branch.name, ...pending }),
    }).catch(() => {});
  }

  const choosing = state === "choose";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-stack">
      {/* F-1 spam honeypot. Invisible to visitors; adds no layout. */}
      <Honeypot />
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

      {choosing ? (
        <BranchChoice
          branches={branches}
          tone={tone}
          onPick={sendTo}
          onBack={() => {
            setState("idle");
          }}
        />
      ) : (
        <Button
          type="submit"
          size="lg"
          variant={tone === "dark" ? "inverse" : "solid"}
        >
          Send on WhatsApp
        </Button>
      )}

      <FormStatus
        state={choosing ? "idle" : state}
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
