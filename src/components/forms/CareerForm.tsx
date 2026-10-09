"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FileField, FormStatus, Honeypot, Select, TextArea } from "./fields";
import { jobs } from "@/content/careers";
import { site } from "@/lib/site";

type State = "idle" | "sending" | "sent" | "error";
type ResumeMethod = "upload" | "email";

const roleOptions = [
  ...jobs.map((j) => ({ value: j.title, label: j.title })),
  { value: "General application", label: "General application" },
];

/** D-008 — both routes are supported, and the applicant chooses. */
const methodOptions = [
  { value: "upload", label: "Upload it here" },
  { value: "email", label: "Email it to the clinic instead" },
];

/** The three formats the backend's `allowed_formats` permits. */
const ACCEPTED = ".pdf,.doc,.docx";
const FORMATS = ["pdf", "doc", "docx"] as const;

function formatOf(file: File): (typeof FORMATS)[number] | undefined {
  const ext = /\.([A-Za-z0-9]+)$/.exec(file.name)?.[1]?.toLowerCase();
  return FORMATS.find((f) => f === ext);
}

export function CareerForm({ role }: { role?: string }) {
  const [state, setState] = useState<State>("idle");
  const [method, setMethod] = useState<ResumeMethod>("upload");
  const [file, setFile] = useState<File | undefined>();
  /**
   * Set when the application was recorded but the CV did not attach. The
   * application itself is safe, so this is a follow-up instruction, not an
   * error — telling someone their application failed when it did not would be
   * the worse outcome.
   */
  const [uploadNote, setUploadNote] = useState<string | undefined>();

  /**
   * 🔴 The application is recorded FIRST and the upload follows.
   *
   * That order is deliberate: a failed or abandoned upload must never cost the
   * clinic the application. `/api/contact` returns the reference, which is the
   * only key the upload endpoints accept, and the server chooses the storage id
   * itself — the browser never names it.
   */
  async function attachResume(reference: string, chosen: File): Promise<string | undefined> {
    const format = formatOf(chosen);
    if (!format) return `Please send a PDF, DOC or DOCX. Email it to ${site.email} instead.`;

    const sigRes = await fetch(`/api/applications/${reference}/upload-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    if (!sigRes.ok) {
      return `We could not start the file upload. Please email your resume to ${site.email}, quoting ${reference}.`;
    }

    const signed = (await sigRes.json()) as {
      uploadUrl: string;
      fields: Record<string, string>;
      maxBytes: number;
    };

    // Advisory only — the server enforces the limit and destroys anything over.
    if (chosen.size > signed.maxBytes) {
      return `That file is ${String(Math.round(chosen.size / 1024))} KB; the limit is ${String(
        Math.round(signed.maxBytes / 1024),
      )} KB. Please email it to ${site.email}, quoting ${reference}.`;
    }

    const form = new FormData();
    for (const [k, v] of Object.entries(signed.fields)) form.append(k, v);
    form.append("file", chosen);

    // Straight to storage — the file never passes through our server (D-014).
    const put = await fetch(signed.uploadUrl, { method: "POST", body: form });
    if (!put.ok) {
      return `That file was not accepted. Please check it is a PDF, DOC or DOCX, or email it to ${site.email}, quoting ${reference}.`;
    }

    const confirmed = await fetch(`/api/applications/${reference}/confirm`, { method: "POST" });
    if (!confirmed.ok) {
      return `We received your application but could not verify the file. Please email your resume to ${site.email}, quoting ${reference}.`;
    }

    return undefined;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    // The file is held in state; FormData would carry it into the JSON body.
    delete data.resume;

    setState("sending");
    setUploadNote(undefined);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "career", ...data, resumeMethod: method }),
      });
      if (!res.ok) throw new Error(String(res.status));

      if (method === "upload" && file) {
        const body = (await res.json()) as { reference?: string };
        if (body.reference) {
          const note = await attachResume(body.reference, file);
          if (note) setUploadNote(note);
        }
      }

      setState("sent");
      setFile(undefined);
      form.reset();
    } catch {
      setState("error");
    }
  }

  const successText =
    method === "upload" && uploadNote === undefined
      ? "Thank you — your application and resume are in. We will be in touch."
      : (uploadNote ??
        `Thank you — your application is in. Email your resume to ${site.email} with the role in the subject line.`);

  return (
    <form onSubmit={onSubmit} className="space-y-stack">
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

      <div className="grid gap-stack sm:grid-cols-2">
        <Select
          label="Your resume"
          name="resumeMethod"
          required
          options={methodOptions}
          value={method}
          onChange={(e) => setMethod(e.target.value as ResumeMethod)}
        />
        {method === "upload" && (
          <FileField
            label="Resume file"
            name="resume"
            accept={ACCEPTED}
            hint="PDF, DOC or DOCX."
            onFileChange={setFile}
          />
        )}
      </div>

      <Button type="submit" size="lg" variant="solid" disabled={state === "sending"}>
        {state === "sending" ? "Submitting…" : "Submit application"}
      </Button>

      <FormStatus state={state} successText={successText} />
    </form>
  );
}
