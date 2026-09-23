import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * All site imagery goes through here so radius, background and object-fit
 * stay consistent. The parent controls the aspect ratio, which keeps every
 * image fluid instead of pinned to a pixel size.
 */
export function Frame({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(min-width: 1024px) 45vw, 92vw",
  priority = false,
  radius = "lg",
  zoom = false,
  bordered = true,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  radius?: "sm" | "md" | "lg" | "xl" | "full" | "none";
  /** Scale the image slightly when a parent `.group` is hovered. */
  zoom?: boolean;
  /** Walnut edge. On by default — opt out only for inset/decorative art. */
  bordered?: boolean;
  /**
   * Overlay content — scrims, badges, hover labels. Rendered inside the
   * clipped, bordered box so it lands on the photo rather than over the edge.
   */
  children?: ReactNode;
}) {
  const radii = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  } as const;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-sand",
        radii[radius],
        bordered && "img-edge",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          zoom &&
            "transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]",
          imgClassName,
        )}
      />
      {children}
    </div>
  );
}
