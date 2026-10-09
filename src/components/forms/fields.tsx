"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/** Underlined inputs — lighter than boxes, and they scale with the type. */
const control =
  "w-full rounded-none border-0 border-b border-line bg-transparent px-0 pb-3 pt-2 " +
  "text-body text-ink placeholder:text-faint transition-colors duration-300 " +
  "focus:border-terracotta focus:outline-none focus:ring-0";

type Base = {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  hint?: string;
};

export function Field({
  label,
  name,
  required,
  className,
  hint,
  type = "text",
  ...rest
}: Base & React.ComponentProps<"input">) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={control}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-label text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  name,
  required,
  className,
  rows = 3,
  ...rest
}: Base & React.ComponentProps<"textarea">) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className={cn(control, "resize-y")}
        {...rest}
      />
    </div>
  );
}

export function Select({
  label,
  name,
  required,
  className,
  options,
  ...rest
}: Base & { options: { value: string; label: string }[] } & React.ComponentProps<"select">) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          className={cn(control, "appearance-none pr-8")}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 right-1 text-muted"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Spam honeypot — F-1, and the permitted change to the two gesture-sensitive
 * forms under D-030.
 *
 * A real visitor never sees or fills this; many bots fill every field they find.
 * The backend records a filled value and still returns success, because telling
 * a bot it was detected only helps it tune.
 *
 * Hidden with `position:absolute` and `left:-9999px` rather than
 * `display:none` or `type="hidden"`: a field that is not rendered at all is
 * trivially skipped, whereas this one looks real to a form parser. `tabIndex`
 * and `aria-hidden` keep it away from keyboard and screen-reader users, and
 * `autoComplete="off"` stops a browser helpfully filling it in.
 *
 * It adds no layout: absolutely positioned out of flow, zero height.
 *
 * 🔴 The `id` comes from `useId()`, not a literal. `/contact` renders TWO forms
 * on one page, so a hardcoded id appeared twice — an invalid duplicate, and the
 * `<label for>` then bound only to the first input. The `name` stays the literal
 * `"company"`: that one IS the contract with the backend's `HONEYPOT_FIELD`.
 */
/**
 * A file input, for the careers resume upload (D-008).
 *
 * Styled from the same `control` string every other field uses, so it sits on
 * the same underlined baseline rather than introducing a second input idiom.
 * The accepted types are stated in the hint because a rejection after choosing
 * a file is a worse experience than being told first.
 */
export function FileField({
  label,
  name,
  required,
  className,
  hint,
  accept,
  onFileChange,
}: Base & { accept: string; onFileChange?: (file: File | undefined) => void }) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onFileChange?.(e.target.files?.[0])}
        className={cn(
          control,
          "cursor-pointer file:mr-3 file:cursor-pointer file:rounded-none file:border-0",
          "file:bg-transparent file:p-0 file:text-small file:text-terracotta",
        )}
      />
      {hint !== undefined && <p className="mt-2 text-small text-faint">{hint}</p>}
    </div>
  );
}

export function Honeypot() {
  const id = useId();
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={id}>Company</label>
      <input
        id={id}
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="label block text-muted">
      {children}
      {required && (
        <span className="text-terracotta" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

/**
 * The "something went wrong" line, with the clinic's number read from the
 * generated site data.
 *
 * 🔴 It used to be a literal here, duplicating `site.phones[0]`. This is the
 * one message a visitor sees when their enquiry did NOT go through, so a number
 * that silently went stale after an admin edit would strand exactly the person
 * who most needs to reach the clinic.
 *
 * `phones[0]` is deliberate: D-013 makes it the clinic's first-listed number
 * (currently Bowenpally), which is the same number this line always showed.
 *
 * If no number is available the sentence simply omits it rather than falling
 * back to a hardcoded one — a wrong number is worse than no number.
 */
function failureText(): string {
  const phone = site.phones[0]?.label;
  return phone
    ? `Something went wrong. Please call us on ${phone} instead.`
    : "Something went wrong. Please call us instead.";
}

export function FormStatus({
  state,
  successText,
  action,
}: {
  state: "idle" | "sending" | "sent" | "error";
  successText: string;
  /** Fallback control — e.g. a manual "Open WhatsApp" link if the tab was blocked. */
  action?: React.ReactNode;
}) {
  if (state === "idle" || state === "sending") return null;

  return (
    <div
      role="status"
      className={cn(
        "rounded-md px-4 py-3 text-small",
        state === "sent"
          ? "bg-olive-soft text-olive"
          : "bg-terracotta/10 text-terracotta-deep",
      )}
    >
      <p>
        {state === "sent" ? successText : failureText()}
      </p>
      {action && <p className="mt-2">{action}</p>}
    </div>
  );
}
