/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Pure function that reorders dashboard sections based on saved content-type preferences.
 */

export type SectionId = "coin_prices" | "market_news" | "ai_insight" | "crypto_meme";

const DEFAULT_ORDER: SectionId[] = ["coin_prices", "market_news", "ai_insight", "crypto_meme"];

// Maps an onboarding content-type preference to the dashboard section it
// should bring forward. Two intentional non-mappings:
// - "social" has no dedicated section in this MVP.
// - "fun" is deliberately NOT mapped to crypto_meme -- the meme is a light
//   closing note at the end of the dashboard by design, not a section that
//   should ever jump to the top regardless of preference.
const CONTENT_TYPE_TO_SECTION: Partial<Record<string, SectionId>> = {
  charts: "coin_prices",
  market_news: "market_news",
};

/**
 * Moves sections the user prefers earlier in the layout, without ever
 * removing a mandatory section. `contentTypes` is expected in the user's
 * own priority order (as saved during onboarding) -- earlier entries win.
 *
 * Call this once from saved preferences, not from per-render state, so
 * the layout doesn't reshuffle on every re-render.
 */
export function orderDashboardSections(contentTypes: string[]): SectionId[] {
  const order = [...DEFAULT_ORDER];

  for (const contentType of [...contentTypes].reverse()) {
    const section = CONTENT_TYPE_TO_SECTION[contentType];
    if (!section) continue;
    const index = order.indexOf(section);
    if (index > 0) {
      order.splice(index, 1);
      order.unshift(section);
    }
  }

  return order;
}
