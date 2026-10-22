"use client";

/**
 * 🔴 THE BRANCH STEP, SHARED BY EVERY WHATSAPP HANDOVER.
 *
 * The clinic has two branches with two different WhatsApp numbers. A form
 * that opens WhatsApp without asking sends every enquiry to one of them, and
 * the visitor has no idea which — that is exactly what `ContactForm` did: it
 * fired straight at `site.whatsapp.number`, so a Bowenpally patient's message
 * landed with Chikkadpally. The appointment form had already grown its own
 * chooser; this is that step lifted out so there is ONE of it.
 *
 * ⚠ THE TAP ON A BRANCH IS THE USER GESTURE THAT OPENS WHATSAPP. `onPick`
 * must stay synchronous all the way to `window.open` — any `await` between
 * the click and the open loses the gesture and the browser blocks the tab as
 * a popup. Nothing in here is async, and nothing added to it may be.
 */

export type ChoosableBranch = {
  name: string;
  phone: string;
  /** Raw number — `whatsappUrl` strips it to digits. */
  whatsapp: string;
};

export function BranchChoice({
  branches,
  onPick,
  onBack,
  compact = false,
  tone = "light",
}: {
  branches: readonly ChoosableBranch[];
  onPick: (branch: ChoosableBranch) => void;
  onBack: () => void;
  /** Stacks the buttons instead of pairing them, for narrow cards. */
  compact?: boolean;
  /** `dark` for the walnut message card, whose surrounding text is ivory. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <fieldset
      className={
        dark
          ? "form-step rounded-lg border border-ivory/20 bg-ivory/5 p-4 sm:p-5"
          : "form-step rounded-lg border border-line bg-sand/60 p-4 sm:p-5"
      }
    >
      <legend className="sr-only">Choose your branch</legend>
      <p className={dark ? "label text-terracotta-soft" : "label text-terracotta"}>
        One last step
      </p>
      <p className={dark ? "mt-1 text-small text-ivory/60" : "mt-1 text-small text-muted"}>
        Which branch should this go to?
      </p>

      <div className={compact ? "mt-4 grid gap-3" : "mt-4 grid gap-3 sm:grid-cols-2"}>
        {branches.map((branch) => (
          <button
            key={branch.name}
            type="button"
            onClick={() => {
              onPick(branch);
            }}
            className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta hover:shadow-md"
          >
            <span>
              <span className="block font-display text-h4 text-ink">{branch.name}</span>
              <span className="mt-0.5 block text-small tabular-nums text-muted">
                {branch.phone}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-terracotta"
            >
              →
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className={
          dark
            ? "mt-4 text-small text-ivory/55 underline underline-offset-4 transition-colors hover:text-ivory"
            : "mt-4 text-small text-muted underline underline-offset-4 transition-colors hover:text-ink"
        }
      >
        ← Back to edit details
      </button>
    </fieldset>
  );
}
