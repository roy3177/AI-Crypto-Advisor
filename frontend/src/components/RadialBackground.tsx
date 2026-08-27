/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Theme-aware radial gradient background used behind page content.
 *
 * A soft radial glow behind page content -- white/near-black at the
 * center fading to the app's accent color at the edges. Reads the same
 * `--background`/`--accent` CSS custom properties every other component
 * uses (see globals.css), so it re-colors itself automatically between
 * light and dark mode instead of needing its own theme handling.
 *
 * Absolutely positioned and `-z-10`: drop it as the first child of any
 * `position: relative` page container to sit behind that page's content.
 */
export function RadialBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--accent)_100%)]"
    />
  );
}
