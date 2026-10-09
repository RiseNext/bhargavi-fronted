import { ButtonLink } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Media";
import { Arc, Seed } from "@/components/ui/Decor";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { services } from "@/content/services";
import { stats } from "@/content/site-content";
import * as copy from "@/lib/copy";

/**
 * The wide treatment image, the single `home.hero` image row under D-027.
 *
 * 🔴 The portrait beside the headline is NOT a row here, deliberately. Its src
 * is `site.founder.photo` and its alt is built from the founder's honorific,
 * name and role — storing either would freeze a copy of a derived value, which
 * is the duplication defect `lib/hours.ts` exists to prevent. D-027's mapping
 * says so explicitly: "`home.hero` → `images` (1 row, the wide treatment
 * image)".
 */
const wideImage = copy.item("home", "hero", "images", 0);
const heroCta = copy.action("home", "hero");
const heroCta2 = copy.action("home", "hero", "cta2");

/**
 * The hero's three statistics, from the admin-managed `stats` rows.
 *
 * 🔴 This was a hardcoded array — `8+ Years practising`, `3000+ Patients
 * treated`, `10 Therapies` — while the statistics band on the same page read
 * the database. That divergence is the whole reason D-023 exists: the hero
 * shows the SAME statistics with DIFFERENT wording ("Years practising" against
 * the band's "Years of expertise"), so `stats.hero_label` was added and the
 * generator emits `heroLabel` and `showInHero`. Both fields were being emitted
 * and neither was ever read, so an owner editing a statistic changed the band
 * and never the hero.
 *
 * ⚠ `heroLabel ?? label` is D-023's resolution rule, and `showInHero` selects
 * exactly the three rows the hero has always shown — "Acupuncture cases" is
 * the one excluded. The rendered output is byte-identical to the array it
 * replaces, which is what D-010 requires: the data source changes, the website
 * does not.
 */
const heroStats = stats
  .filter((s) => s.showInHero)
  .map((s) => ({ k: `${String(s.value)}${s.suffix}`, v: s.heroLabel ?? s.label }));

export function Hero() {
  return (
    <section className="relative overflow-clip pb-block pt-[calc(var(--spacing-nav)+var(--spacing-block))]">
      <Arc className="absolute -right-[12%] -top-[8%] w-[min(46rem,70vw)] text-line" />

      {/**
       * Desktop grid
       *   col 1 / row 1      headline + CTAs
       *   col 2 / row 1      portrait, sitting right of the headline
       *   col 1 / rows 2–3   wide treatment image
       *   col 2 / row 2      supporting copy
       *   col 2 / row 3      stats
       *
       * Mobile is a plain column ordered by `order-*`:
       *   headline + CTAs → portrait → copy → wide image → stats
       */}
      <div className="wrap flex flex-col gap-block lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-x-gutter lg:gap-y-block">
        {/* Headline + CTAs */}
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          {/* Everything in this column is above the fold, so it plays on load
              rather than waiting for a scroll that may never come. */}
          <Reveal immediate>
            <p className="label text-terracotta">
              <Seed />
              {site.name} · Chikkadpally, Hyderabad
            </p>
          </Reveal>

          <h1 className="mt-stack max-w-[13ch] text-d1 text-ink">
            <Wipe as="span" immediate className="block">
              Wellness
            </Wipe>
            <Wipe as="span" immediate delay={110} className="block">
              Center made
            </Wipe>
            <Wipe as="span" immediate delay={220} className="block">
              for <span className="italic text-terracotta">you</span>
            </Wipe>
          </h1>

          <Reveal immediate delay={340}>
            <div className="mt-block flex flex-wrap gap-3">
              <ButtonLink href={heroCta.href} size="lg">
                {heroCta.label}
              </ButtonLink>
              <ButtonLink href={heroCta2.href} variant="outline" size="lg">
                {heroCta2.label}
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Portrait — directly right of the headline */}
        <Reveal
          immediate
          delay={140}
          className="group relative order-2 lg:col-start-2 lg:row-start-1"
        >
          <Frame
            src={site.founder.photo}
            alt={`${site.founder.honorific} ${site.founder.name}, ${site.founder.role}`}
            radius="xl"
            priority
            zoom
            sizes="(min-width: 1024px) 26vw, 92vw"
            className="aspect-4/5 w-full"
            imgClassName="object-top"
          />

          {/* Credential chip — the portrait is the one photograph that is
              actually her, so the name belongs here rather than over a stock
              treatment shot. Stacked, since the column is narrow. */}
          <div className="mt-4 lg:absolute lg:inset-x-4 lg:bottom-4 lg:mt-0 lg:rounded-lg lg:bg-ivory/92 lg:px-5 lg:py-4 lg:backdrop-blur-md">
            <span className="block font-display text-h4 text-ink">
              {site.founder.honorific} {site.founder.name}
            </span>
            <span className="mt-1 block text-small text-muted">
              {site.founder.role}
            </span>
          </div>
        </Reveal>

        {/* Supporting copy — where the portrait used to sit */}
        <Reveal delay={220} className="order-3 lg:col-start-2 lg:row-start-2">
          <p className="max-w-[42ch] text-lead text-muted">
            Acupuncture, acupressure and natural pain relief led by{" "}
            <span className="text-ink">
              {site.founder.honorific} {site.founder.name}
            </span>{" "}
            — treating the whole person, not just the symptom.
          </p>
        </Reveal>

        {/* Wide treatment image */}
        <Reveal
          delay={280}
          className="group order-4 lg:col-start-1 lg:row-span-2 lg:row-start-2"
        >
          <Frame
            src={copy.itemText(wideImage, "image", "home.hero.images[0]")}
            alt={copy.itemText(wideImage, "alt", "home.hero.images[0]")}
            radius="xl"
            zoom
            sizes="(min-width: 1024px) 62vw, 92vw"
            className="aspect-4/3 w-full sm:aspect-16/10"
          />
        </Reveal>

        {/* Stats */}
        <Reveal delay={340} className="order-5 lg:col-start-2 lg:row-start-3">
          <dl className="grid grid-cols-3 gap-4 rounded-lg bg-walnut p-[clamp(1.1rem,0.8rem+1.2vw,1.75rem)] text-ivory">
            {heroStats.map((s) => (
              <div key={s.v}>
                <dt className="sr-only">{s.v}</dt>
                <dd>
                  <span className="block font-display text-[clamp(1.375rem,1rem+1.5vw,2.125rem)] leading-none">
                    {s.k}
                  </span>
                  <span className="mt-2 block text-label uppercase tracking-[0.14em] text-ivory/60">
                    {s.v}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Marquee */}
      <div className="marquee mt-block overflow-hidden border-y border-line py-[clamp(0.75rem,0.6rem+0.5vw,1.1rem)]">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 items-center">
              {services.map((s) => (
                <li
                  key={s.slug}
                  className="flex items-center gap-[clamp(1.5rem,3vw,3rem)] px-[clamp(0.75rem,1.5vw,1.5rem)]"
                >
                  <span className="whitespace-nowrap font-display text-[clamp(1rem,0.9rem+0.5vw,1.375rem)] text-ink/70">
                    {s.title}
                  </span>
                  <Seed className="text-olive" />
                </li>
              ))}
            </ul>
          ))}
        </div>
        <p className="sr-only">
          Therapies offered: {services.map((s) => s.title).join(", ")}.
        </p>
      </div>
    </section>
  );
}
