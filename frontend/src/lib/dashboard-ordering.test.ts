import { describe, expect, it } from "vitest";

import { orderDashboardSections } from "./dashboard-ordering";

describe("orderDashboardSections", () => {
  it("uses the default order when there are no content preferences", () => {
    expect(orderDashboardSections([])).toEqual(["coin_prices", "market_news", "ai_insight", "crypto_meme"]);
  });

  it("always keeps all four mandatory sections", () => {
    const order = orderDashboardSections(["fun"]);
    expect(new Set(order)).toEqual(new Set(["coin_prices", "market_news", "ai_insight", "crypto_meme"]));
  });

  it("brings a single preferred section to the front", () => {
    expect(orderDashboardSections(["fun"])[0]).toBe("crypto_meme");
  });

  it("respects priority order among multiple preferences", () => {
    const order = orderDashboardSections(["market_news", "charts", "fun"]);
    expect(order).toEqual(["market_news", "coin_prices", "crypto_meme", "ai_insight"]);
  });

  it("ignores a preference with no mapped section (social)", () => {
    expect(orderDashboardSections(["social"])).toEqual(["coin_prices", "market_news", "ai_insight", "crypto_meme"]);
  });
});
