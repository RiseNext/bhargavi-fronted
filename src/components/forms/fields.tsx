"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

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

export function FormStatus({
  state,
  successText,
}: {
  state: "idle" | "sending" | "sent" | "error";
  successText: string;
}) {
  if (state === "idle" || state === "sending") return null;

  return (
    <p
      role="status"
      className={cn(
        "rounded-md px-4 py-3 text-small",
        state === "sent"
          ? "bg-olive-soft text-olive"
          : "bg-terracotta/10 text-terracotta-deep",
      )}
    >
      {state === "sent"
        ? successText
        : `Something went wrong. Please call us on +91 70751 57013 instead.`}
    </p>
  );
}
