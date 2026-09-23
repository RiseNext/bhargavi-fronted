import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "accent" | "outline" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-medium " +
  "text-center transition-[background-color,color,border-color,transform] duration-300 " +
  "ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 active:translate-y-0 " +
  "disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  solid: "bg-walnut text-ivory hover:bg-terracotta",
  accent: "bg-terracotta text-ivory hover:bg-terracotta-deep",
  outline: "border border-walnut/22 text-ink hover:border-walnut hover:bg-walnut hover:text-ivory",
  inverse: "bg-ivory text-ink hover:bg-terracotta hover:text-ivory",
};

const sizes: Record<Size, string> = {
  sm: "px-[clamp(0.9rem,0.7rem+0.6vw,1.2rem)] py-2.5 text-small",
  md: "px-[clamp(1.15rem,0.85rem+1vw,1.75rem)] py-[clamp(0.7rem,0.6rem+0.4vw,0.95rem)] text-small",
  lg: "px-[clamp(1.4rem,1rem+1.5vw,2.25rem)] py-[clamp(0.85rem,0.7rem+0.6vw,1.15rem)] text-[0.9375rem]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: Common & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  children,
  href,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const external = typeof href === "string" && /^(https?:|tel:|mailto:)/.test(href);

  if (external) {
    const isHttp = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        target={isHttp ? "_blank" : undefined}
        rel={isHttp ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/** Text link with a growing underline and a nudging arrow. */
export function ArrowLink({
  href,
  children,
  className,
  invert = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  invert?: boolean;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="underline-grow">{children}</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover/link:translate-x-1"
      >
        <path
          d="M3 8h10m0 0L9 4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  const classes = cn(
    "group/link inline-flex items-center gap-2 text-small font-medium",
    invert ? "text-ivory" : "text-ink",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
