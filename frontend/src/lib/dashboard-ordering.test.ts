import { describe, expect, it } from "vitest";

import { orderDashboardSections } from "./dashboard-ordering";

describe("orderDashboardSections", () => {
  it("uses the default order when there are no content preferences", () => {
    expect(orderDashboardSections([])).toEqual(["coin_prices", "market_news", "ai_insight", "crypto_meme"]);
  });

  it("always keeps all four mandatory sections", () => {
    const order = orderDashboardSections(["charts"]);
    expect(new Set(order)).toEqual(new Set(["coin_prices", "market_news", "ai_insight", "crypto_meme"]));
  });

  it("brings a single preferred section to the front", () => {
    expect(orderDashboardSections(["market_news"])[0]).toBe("market_news");
  });

  it("respects priority order among multiple preferences", () => {
    const order = orderDashboardSections(["market_news", "charts"]);
    expect(order).toEqual(["market_news", "coin_prices", "ai_insight", "crypto_meme"]);
  });

  it("ignores a preference with no mapped section (social)", () => {
    expect(orderDashboardSections(["social"])).toEqual(["coin_prices", "market_news", "ai_insight", "crypto_meme"]);
  });

  it("never brings the meme forward, even when 'fun' is the top preference", () => {
    // Deliberate design choice: the meme is a lighthearted closing note,
    // not a section that should ever jump to the top of the dashboard.
    const order = orderDashboardSections(["fun", "market_news"]);
    expect(order[order.length - 1]).toBe("crypto_meme");
    expect(order[0]).toBe("market_news");
  });
});
