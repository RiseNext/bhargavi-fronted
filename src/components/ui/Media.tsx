import Image from "next/image";
import type { CSSProperties, ReactNode, SyntheticEvent } from "react";
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
  fit = "cover",
  bordered = true,
  style,
  onNaturalSize,
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
  /**
   * `cover` fills the frame and crops whatever overflows. `contain` fits the
   * whole picture inside it, letterboxing on the sand ground — use it where
   * losing an edge of the photo is not acceptable.
   */
  fit?: "cover" | "contain";
  /** Walnut edge. On by default — opt out only for inset/decorative art. */
  bordered?: boolean;
  /** Inline box sizing — an `aspectRatio` measured at runtime, in practice. */
  style?: CSSProperties;
  /**
   * Fires once the photo has decoded, with its natural width ÷ height.
   *
   * ⚠ A CLIENT-ONLY PROP. Passing it from a server component is a build error,
   * which is correct: only a component that can hold state has any use for the
   * measurement. `Slider` uses it to shape its box around the photograph.
   */
  onNaturalSize?: (ratio: number) => void;
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
      {...(style === undefined ? {} : { style })}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          fit === "contain" ? "object-contain" : "object-cover",
          zoom &&
            "transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]",
          imgClassName,
        )}
        {...(onNaturalSize === undefined
          ? {}
          : {
              onLoad: (e: SyntheticEvent<HTMLImageElement>) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                  onNaturalSize(img.naturalWidth / img.naturalHeight);
                }
              },
            })}
      />
      {children}
    </div>
  );
}
