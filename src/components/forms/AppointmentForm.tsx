"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormStatus, Honeypot, Select, TextArea } from "./fields";
import type { Service } from "@/content/services";
import { site } from "@/lib/site";
import { formatDateTime, whatsappUrl } from "@/lib/whatsapp";

type State = "idle" | "choose" | "sent" | "error";

type Branch = (typeof site.branches)[number];

/**
 * Appointment request, delivered over WhatsApp.
 *
 * Two steps: the visitor fills in their details, then picks which branch
 * they want. Their WhatsApp opens with the whole request composed, addressed
 * to that branch's number; they press send. It arrives from their own number,
 * so the reply goes straight back in the same thread. /api/contact is still
 * pinged in the background purely as a server-side record — it is not the
 * delivery path.
 */
export function AppointmentForm({
  services,
  defaultService = "",
  compact = false,
}: {
  services: readonly Service[];
  defaultService?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, string> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Step 1 — validate and hold the details, then ask which branch.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(
      new FormData(e.currentTarget),
    ) as Record<string, string>;
    setPending(data);
    setState("choose");
  }

  // Step 2 — the branch tap is the user gesture that opens WhatsApp.
  // Must stay synchronous: an async gap here loses the gesture context
  // and the browser blocks the tab.
  function sendTo(branch: Branch) {
    if (!pending) return;

    const service = services.find((s) => s.slug === pending.service);

    const url = whatsappUrl(
      "New appointment request",
      [
        { label: "Branch", value: branch.name },
        { label: "Name", value: pending.name },
        { label: "Phone", value: pending.phone },
        { label: "Email", value: pending.email },
        { label: "Therapy", value: service?.title ?? "Not sure — please advise" },
        { label: "Preferred time", value: formatDateTime(pending.datetime) },
        { label: "Concern", value: pending.message },
      ],
      branch.whatsapp,
    );

    setLink(url);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    setState("sent");
    if (opened) formRef.current?.reset();

    // Background record only; never let a failure here affect the handover.
    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "appointment", branch: branch.name, ...pending }),
    }).catch(() => {});
  }

  const choosing = state === "choose";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-stack">
      {/* F-1 spam honeypot. Invisible to visitors; adds no layout. */}
      <Honeypot />
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

      {choosing ? (
        <fieldset className="form-step rounded-lg border border-line bg-sand/60 p-4 sm:p-5">
          <legend className="sr-only">Choose your branch</legend>
          <p className="label text-terracotta">One last step</p>
          <p className="mt-1 text-small text-muted">
            Which branch would you like to visit?
          </p>

          <div className={compact ? "mt-4 grid gap-3" : "mt-4 grid gap-3 sm:grid-cols-2"}>
            {site.branches.map((branch) => (
              <button
                key={branch.name}
                type="button"
                onClick={() => sendTo(branch)}
                className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta hover:shadow-md"
              >
                <span>
                  <span className="block font-display text-h4 text-ink">
                    {branch.name}
                  </span>
                  <span className="mt-0.5 block text-small tabular-nums text-muted">
                    {branch.phone}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-terracotta"
                >
                  →
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-4 text-small text-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            ← Back to edit details
          </button>
        </fieldset>
      ) : (
        <Button type="submit" size="lg" className="w-full">
          Send on WhatsApp
        </Button>
      )}

      <FormStatus
        state={state === "choose" ? "idle" : state}
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
