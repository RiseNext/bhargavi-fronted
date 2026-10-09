import { ButtonLink } from "@/components/ui/Button";
import { Rings } from "@/components/ui/Decor";
import * as copy from "@/lib/copy";

export default function NotFound() {
  const home = copy.action("notFound", "notFound");
  const browse = copy.action("notFound", "notFound", "cta2");

  return (
    <section className="relative overflow-clip py-section pt-[calc(var(--spacing-nav)+var(--spacing-section))]">
      <Rings className="absolute left-1/2 top-1/2 w-[min(34rem,80vw)] -translate-x-1/2 -translate-y-1/2 text-line" />

      <div className="wrap relative text-center">
        <p className="label justify-center text-terracotta">
          {copy.text("notFound", "notFound", "label")}
        </p>
        <p
          aria-hidden="true"
          className="mt-stack font-display text-[clamp(5rem,3rem+14vw,12rem)] leading-[0.85] tracking-tight text-ink/10"
        >
          {copy.extra("notFound", "notFound", "bigNumeral")}
        </p>
        <h1 className="mt-stack text-h1 text-ink">
          {copy.heading("notFound", "notFound")}
        </h1>
        <p className="mx-auto mt-stack max-w-[44ch] text-lead text-muted">
          {copy.text("notFound", "notFound", "lead")}
        </p>
        <div className="mt-block flex flex-wrap justify-center gap-3">
          <ButtonLink href={home.href} size="lg">
            {home.label}
          </ButtonLink>
          <ButtonLink href={browse.href} variant="outline" size="lg">
            {browse.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
