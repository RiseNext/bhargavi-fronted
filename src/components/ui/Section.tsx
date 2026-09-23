import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal, Wipe } from "./Reveal";

const tones = {
  ivory: "bg-ivory text-ink-2",
  paper: "bg-paper text-ink-2",
  sand: "bg-sand text-ink-2",
  olive: "bg-olive-soft text-ink-2",
  walnut: "bg-walnut text-ivory/85",
  walnutDeep: "bg-walnut-deep text-ivory/80",
} as const;

export type Tone = keyof typeof tones;

/** A full-width band. Never repeat a tone on two adjacent sections. */
export function Section({
  children,
  tone = "ivory",
  className,
  id,
  flush = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  /** Drop the vertical padding (for sections that manage their own). */
  flush?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("relative", tones[tone], !flush && "py-section", className)}
    >
      {children}
    </section>
  );
}

export function Wrap({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn(wide ? "wrap-wide" : "wrap", "relative", className)}>
      {children}
    </div>
  );
}

/**
 * Editorial section header: hairline rule, small label, large display title.
 * `align="split"` puts the label in a narrow left column on wide screens —
 * the layout that gives the page its magazine feel.
 */
export function SectionHead({
  label,
  title,
  lead,
  align = "split",
  invert = false,
  action,
  className,
}: {
  label?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "split" | "left" | "center";
  invert?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const labelNode = label && (
    <p className={cn("label", invert ? "text-terracotta-soft" : "text-terracotta")}>{label}</p>
  );

  const titleNode = (
    <Wipe
      as="h2"
      className={cn(
        "text-h2",
        invert ? "text-ivory" : "text-ink",
        align === "center" && "mx-auto",
      )}
    >
      {title}
    </Wipe>
  );

  const leadNode = lead && (
    <Reveal delay={140}>
      <p
        className={cn(
          "mt-stack max-w-[46ch] text-lead",
          invert ? "text-ivory/70" : "text-muted",
          align === "center" && "mx-auto",
        )}
      >
        {lead}
      </p>
    </Reveal>
  );

  if (align === "split") {
    return (
      <div
        className={cn(
          "grid gap-x-block gap-y-stack border-t pt-stack lg:grid-cols-[minmax(8rem,18%)_1fr]",
          invert ? "border-ivory/15" : "border-line",
          className,
        )}
      >
        <Reveal>{labelNode}</Reveal>
        <div>
          {/* Action drops below the title on small screens rather than
              squeezing in beside it. */}
          <div className="flex flex-col items-start gap-x-block gap-y-stack sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[20ch] sm:flex-1">{titleNode}</div>
            {action && <Reveal delay={200}>{action}</Reveal>}
          </div>
          {leadNode}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Reveal>{labelNode}</Reveal>
      <div className={cn("mt-stack max-w-[22ch]", align === "center" && "mx-auto")}>
        {titleNode}
      </div>
      {leadNode}
      {action && (
        <Reveal delay={200} className={cn("mt-stack", align === "center" && "flex justify-center")}>
          {action}
        </Reveal>
      )}
    </div>
  );
}

/** Hairline + index number, used to head list rows. */
export function IndexRule({
  n,
  invert = false,
}: {
  n: number;
  invert?: boolean;
}) {
  return (
    <span
      className={cn(
        "index-num shrink-0 tabular-nums",
        invert ? "text-ivory/45" : "text-faint",
      )}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}
