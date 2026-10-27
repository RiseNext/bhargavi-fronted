import { ButtonLink } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Media";
import { Slider } from "@/components/ui/Slider";
// `Arc` is gone with the decorative curve this section no longer renders
// (removed on main at the client's request); `Seed` is still used by the label.
import { Seed } from "@/components/ui/Decor";
import { Reveal, Wipe } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { getContactDetails, getFounder, getServices, getStats } from "@/lib/content";
import * as copy from "@/lib/copy";

/**
 * The wide treatment image — now the `home.hero` image GROUP, not one row.
 *
 * 🔴 D-044 widens D-027's "1 row" to a collection. `copy.items` reads every
 * row in `sort_order`, so a hero with one image behaves exactly as before
 * (`Slider` renders a single slide as a plain `Frame`) and gains arrows, dots
 * and autoplay the moment an administrator adds a second. D-027's mapping
 * fixed the row COUNT at the time it was written; it was never a ceiling.
 *
 * ⚠ Still `copy.items`, which THROWS on an empty group — the same loud failure
 * `copy.item(…, 0)` gave. A hero that silently lost its photograph to a seed
 * that did not run is the failure `lib/copy.ts` exists to make impossible.
 *
 * 🔴 The portrait beside the headline is NOT a row here, deliberately. Its src
 * is `founder.photo` and its alt is built from the founder's honorific, name
 * and role — storing either would freeze a copy of a derived value, which is
 * the duplication defect `lib/hours.ts` exists to prevent. It is NOT part of
 * the slider and must not become one: it is the one photograph that is
 * actually her, and it carries the credential chip.
 */
const heroSlides = copy.items("home", "hero", "images").map((row, i) => ({
  src: copy.itemText(row, "image", `home.hero.images[${String(i)}]`),
  alt: copy.itemText(row, "alt", `home.hero.images[${String(i)}]`),
  ...(row.isDefault === true ? { isDefault: true as const } : {}),
}));
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
/* Resolution rule lives here; the data is awaited inside `Hero` (D-042). */

export async function Hero() {
  const [services, stats, contact, founder] = await Promise.all([
    getServices(),
    getStats(),
    getContactDetails(),
    // Same endpoint and tag as `getContactDetails`, so this is one fetch.
    getFounder(),
  ]);

  // ✅ D-023 — `showInHero` selects the rows, `heroLabel ?? label` is the rule.
  const heroStats = stats
    .filter((s) => s.showInHero)
    .map((s) => ({
      // ⚠ `|| "+"`, not a hard-coded "+". Every figure on the site should
      // read as a minimum rather than an exact count, so a stat stored with
      // NO suffix gets one — but a stat whose suffix the admin actually set
      // ("%", "k", anything) is still rendered as entered. Hard-coding would
      // make the stored field unusable.
      k: `${String(s.value)}${s.suffix || "+"}`,
      v: s.heroLabel ?? s.label,
    }));

  return (
    <section className="relative overflow-clip pb-block pt-[calc(var(--spacing-nav)+var(--spacing-block))]">
      {/* 🔴 The decorative `Arc` was removed here at the client's request.
          It drew a solid quarter-curve plus a dashed one across the top-right
          of the section, and at the widths the hero now uses those strokes
          ran into the portrait card and read as a stray line stuck to its
          bottom-right corner rather than as background texture.

          ⚠ Removed from THIS section only. `PageHero` and the appointment
          band still render their own arcs, where nothing overlaps them. */}

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
      {/*
         ⚠ THE PORTRAIT COLUMN SCALES WITH THE PAGE CONTAINER.

         It was a flat `24rem`. Once `--container-page` grew on wide
         displays the headline column absorbed every extra pixel and the
         portrait was left stranded at 384px beside it, which looked smaller
         on a 2560px screen than it did on a laptop.

         The clamp is tuned to the container's own floor: 26.3vw equals
         exactly 24rem at 1461px, which is the width where `--container-page`
         stops being pinned to 84rem and starts tracking 92vw. So every
         viewport at or below that keeps the original 384px column to the
         pixel, and only the screens that just gained width spend any of it
         here.

         ⚠ RE-DERIVE THIS IF `--container-page` CHANGES. The floor vw is
         `384 / crossoverWidth * 100`, where the crossover is where the
         container's vw term overtakes its rem floor.

         ⚠ THE 34rem CEILING IS ABOUT HEIGHT, not width. The picture is 4:5,
         so every pixel of column width costs 1.25 of hero height — at 42rem
         the hero stood 840px tall on a 2560px screen and left a void under
         the buttons. 34rem keeps it to ~680px.
       */}
      <div className="wrap flex flex-col gap-block lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,clamp(24rem,26.3vw,34rem))] lg:items-start lg:gap-x-gutter lg:gap-y-block">
        {/* Headline + CTAs */}
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          {/* Everything in this column is above the fold, so it plays on load
              rather than waiting for a scroll that may never come. */}
          <Reveal immediate>
            {/*
              Two deliberate lines: the practice name, then where it practises.

              ⚠ `.label` is an `inline-flex` row (it exists to sit the Seed
              glyph beside a single line of small caps), so a `<br>` or a
              `block` child inside it would be laid out as another flex item
              and stay on the same line. The fix is to give it exactly ONE
              child — the stack below — and rebuild the Seed's row inside the
              first line, where it belongs anyway: the glyph should sit
              against the name, not centred against a two-line block.
            */}
            <p className="label !items-start text-terracotta">
              {/* ⚠ `!items-start`. `.label` hard-codes `align-items: center`,
                  which against a two-line stack would float the glyph into
                  the gap between the lines. `items-start` alone is a utility
                  of equal specificity, so whether it wins depends on emitted
                  source order — the important flag removes that coin-toss.
                  The small top offset optically centres the glyph on the
                  cap-height of line one rather than its line box. */}
              <Seed className="mt-[0.15em] shrink-0" />
              {/* Both text lines are ONE flex item, so they share a left edge
                  and sit indented past the glyph — a hanging glyph rather
                  than a ragged two-line block. */}
              <span className="block">
                <span className="block">{site.name} ·</span>
                {/* Both clinics, named from the live branch records rather
                    than retyped — D-013 owns their order, and a third branch
                    would appear here with no code change. */}
                {/* ⚠ Tighter tracking below `sm`. `.label` sets 0.16em, which
                    at 360px pushed "Hyderabad" onto a THIRD line — three lines
                    of small caps stacked above a three-line headline. 0.09em
                    holds it at two lines on the narrowest phones and the full
                    tracking returns as soon as there is room. */}
                <span className="mt-1.5 block tracking-[0.09em] sm:tracking-[0.16em]">
                  {contact.branches.map((b) => b.name).join(" & ")}, Hyderabad
                </span>
              </span>
            </p>
          </Reveal>

          {/*
            ⚠ NOT `text-d1`. The token's ceiling is 7rem, which at the
            client's request is larger than this headline should be — but the
            token is a site-wide display size, so editing it would resize
            anything else that adopts it later. The clamp below is the same
            shape, scaled down, and keeps the fluid behaviour between the two
            ends rather than stepping at a breakpoint.
          */}
          <h1 className="mt-stack max-w-[13ch] text-[clamp(2.25rem,1.2rem+5.2vw,5rem)] font-normal leading-[0.98] tracking-[-0.03em] text-ink">
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
            {/*
              🔴 FULL WIDTH ON PHONES, content width from `sm` up.

              `flex-wrap` alone let the two pills wrap to their own lines at
              their own content widths — "Book an appointment" wide, "See
              therapies" visibly narrower — which reads as two unrelated
              controls stacked crookedly rather than a primary and a secondary
              action. Matching their width fixes the ragged edge and gives
              each a full-width tap target, which is what a phone wants
              anyway. Above `sm` there is room for a row, so they shrink back
              to their labels.

              ⚠ `mt-stack` below `sm`: at `mt-block` the gap under a headline
              that is already three lines tall pushed the buttons most of a
              screen away from it.
            */}
            <div className="mt-stack flex flex-col gap-3 sm:mt-block sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href={heroCta.href} size="xl" className="w-full sm:w-auto">
                {heroCta.label}
              </ButtonLink>
              <ButtonLink
                href={heroCta2.href}
                variant="outline"
                size="xl"
                className="w-full sm:w-auto"
              >
                {heroCta2.label}
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/*
          Portrait — directly right of the headline.

          🔴 IT KEEPS ITS 4:5 RATIO. This was briefly stretched to the grid
          row height so its bottom edge squared off against the headline
          column's buttons. That worked while the headline was the full `d1`
          display size; once the headline shrank at the client's request AND
          the column widened on large screens, the row height became far
          shorter than the column is wide, and `object-cover` turned a
          portrait photograph into a landscape letterbox with the subject's
          head cropped off.

          ⚠ So the picture now sets its own height and is the taller of the
          two columns, which is the ordinary way an image-led hero reads. Do
          not reintroduce `self-stretch` here without re-checking the crop at
          1920 and 2560 — it is only safe while the text column is the taller
          one.
        */}
        <Reveal
          immediate
          delay={140}
          className="group relative order-2 lg:col-start-2 lg:row-start-1"
        >
          <Frame
            src={founder.photo}
            alt={`${founder.honorific} ${founder.name}, ${founder.role}`}
            radius="xl"
            priority
            zoom
            sizes="(min-width: 1024px) 26vw, 92vw"
            className="aspect-4/5 w-full"
            imgClassName="object-top"
          />

          {/*
            Credential chip — the portrait is the one photograph that is
            actually her, so the name belongs here rather than over a stock
            treatment shot. Stacked, since the column is narrow.

            🔴 THE QUALIFICATIONS LINE. This showed the name and the role and
            stopped, while /about showed name, role AND qualifications from
            the same admin field — so the home page understated the clinician's
            credentials, and an administrator editing them changed one page of
            two. Both surfaces now read `getFounder()` and show the same three
            lines, in the same order, from the same request.

            ⚠ The typography is deliberately the one /about already uses for
            this field: the small-caps `text-label` with the same tracking, so
            the two pages read as one statement rather than two designs.
          */}
          <div className="mt-4 lg:absolute lg:inset-x-4 lg:bottom-4 lg:mt-0 lg:rounded-lg lg:bg-ivory/92 lg:px-5 lg:py-4 lg:backdrop-blur-md">
            <span className="block font-display text-h4 leading-tight text-ink">
              {founder.honorific} {founder.name}
            </span>
            <span className="mt-1 block text-small leading-snug text-muted">
              {founder.role}
            </span>
            {founder.qualifications && (
              /* `border-t` rather than more margin: three stacked lines in a
                 narrow overlay need the credentials read as a separate note,
                 not as a third line of the role. */
              <span className="mt-2.5 block border-t border-line pt-2.5 text-label uppercase leading-relaxed tracking-[0.14em] text-muted">
                {founder.qualifications}
              </span>
            )}
          </div>
        </Reveal>

        {/* Supporting copy — where the portrait used to sit */}
        <Reveal delay={220} className="order-3 lg:col-start-2 lg:row-start-2">
          <p className="max-w-[42ch] text-lead text-muted">
            Acupuncture, acupressure and natural pain relief led by{" "}
            <span className="text-ink">
              {founder.honorific} {founder.name}
            </span>{" "}
            — treating the whole person, not just the symptom.
          </p>
        </Reveal>

        {/* Wide treatment image */}
        <Reveal
          delay={280}
          className="group order-4 lg:col-start-1 lg:row-span-2 lg:row-start-2"
        >
          <Slider
            slides={heroSlides}
            label="Treatment photographs"
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
