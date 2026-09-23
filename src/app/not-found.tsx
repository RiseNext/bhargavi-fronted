import { ButtonLink } from "@/components/ui/Button";
import { Rings } from "@/components/ui/Decor";

export default function NotFound() {
  return (
    <section className="relative overflow-clip py-section pt-[calc(var(--spacing-nav)+var(--spacing-section))]">
      <Rings className="absolute left-1/2 top-1/2 w-[min(34rem,80vw)] -translate-x-1/2 -translate-y-1/2 text-line" />

      <div className="wrap relative text-center">
        <p className="label justify-center text-terracotta">Error 404</p>
        <p
          aria-hidden="true"
          className="mt-stack font-display text-[clamp(5rem,3rem+14vw,12rem)] leading-[0.85] tracking-tight text-ink/10"
        >
          404
        </p>
        <h1 className="mt-stack text-h1 text-ink">This page has wandered off</h1>
        <p className="mx-auto mt-stack max-w-[44ch] text-lead text-muted">
          The link may be old, or the page may have moved. Let us get you back
          to something useful.
        </p>
        <div className="mt-block flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/services" variant="outline" size="lg">
            Browse therapies
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
