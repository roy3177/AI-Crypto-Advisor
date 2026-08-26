import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@/test/navigation-mock";
import { routerMock } from "@/test/navigation-mock";
import "@/test/auth-context-mock";
import { useAuthMock } from "@/test/auth-context-mock";
import "@/test/market-api-mock";
import { marketApiMock } from "@/test/market-api-mock";
import "@/test/insights-api-mock";
import { insightsApiMock } from "@/test/insights-api-mock";
import "@/test/memes-api-mock";
import { memesApiMock } from "@/test/memes-api-mock";
import "@/test/preferences-api-mock";
import { preferencesApiMock } from "@/test/preferences-api-mock";
import "@/test/feedback-api-mock";
import { feedbackApiMock } from "@/test/feedback-api-mock";
import { ApiError } from "@/lib/api-client";

import DashboardPage from "./page";

const onboardedUser = {
  id: "1",
  name: "Roy",
  email: "roy@example.com",
  onboarding_completed: true,
  created_at: "",
};

describe("DashboardPage", () => {
  const defaultInsight = {
    id: "insight-1",
    date: "2026-01-01",
    title: "Your daily crypto insight",
    content: "Default stubbed insight.",
    disclaimer: "This content is for informational purposes only and is not financial advice.",
    source: "ai" as const,
    model_provider: "openrouter",
    generated_at: "",
    content_key: "insight:insight-1",
  };

  const defaultMeme = {
    id: "diamond-hands-01",
    title: "Diamond hands",
    image_url: "/memes/diamond-hands-01.svg",
    alt_text: "A cartoon diamond with the caption HODL",
    content_key: "meme:diamond-hands-01",
  };

  beforeEach(() => {
    routerMock.replace.mockClear();
    marketApiMock.fetchPrices.mockReset();
    marketApiMock.fetchNews.mockReset();
    insightsApiMock.fetchDailyInsight.mockReset().mockResolvedValue(defaultInsight);
    memesApiMock.fetchRandomMeme.mockReset().mockResolvedValue(defaultMeme);
    feedbackApiMock.fetchMyFeedback.mockReset().mockResolvedValue([]);
    preferencesApiMock.fetchMyPreferences.mockReset().mockResolvedValue({
      interested_assets: ["bitcoin"],
      investor_type: "hodler",
      content_types: [],
      onboarding_completed: true,
      updated_at: "",
    });
    useAuthMock.mockReturnValue({ user: onboardedUser, isLoading: false, logout: vi.fn() });
  });

  it("redirects to onboarding when the user has not completed it", () => {
    useAuthMock.mockReturnValue({
      user: { ...onboardedUser, onboarding_completed: false },
      isLoading: false,
      logout: vi.fn(),
    });
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });

    render(<DashboardPage />);
    expect(routerMock.replace).toHaveBeenCalledWith("/onboarding");
  });

  it("shows prices and news once both load", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({
      items: [
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price_usd: 100000, change_24h_percent: 2.5, last_updated: null, source: "coingecko", is_stale: false },
      ],
      status: "live",
      generated_at: "",
      content_key: "prices:bitcoin:2026-01-01",
    });
    marketApiMock.fetchNews.mockResolvedValue({
      items: [
        { id: "a1", title: "Bitcoin rallies", summary: null, url: null, published_at: null, source_name: "Example", related_assets: [], data_source: "cryptopanic", is_fallback: false, content_key: "news:cryptopanic:a1" },
      ],
      status: "live",
      generated_at: "",
    });

    render(<DashboardPage />);

    expect(await screen.findByText("Bitcoin rallies")).toBeInTheDocument();
    expect(screen.getByText("$100,000.00")).toBeInTheDocument();
  });

  it("shows an error for a section that fails without blocking the other", async () => {
    marketApiMock.fetchPrices.mockRejectedValue(new ApiError("Could not load prices.", 500));
    marketApiMock.fetchNews.mockResolvedValue({
      items: [
        { id: "a1", title: "Still works", summary: null, url: null, published_at: null, source_name: null, related_assets: [], data_source: "cryptopanic", is_fallback: false, content_key: "news:cryptopanic:a1" },
      ],
      status: "live",
      generated_at: "",
    });

    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/could not load prices/i));
    expect(await screen.findByText("Still works")).toBeInTheDocument();
  });

  it("shows the AI insight content and disclaimer", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });

    render(<DashboardPage />);

    expect(await screen.findByText("Default stubbed insight.")).toBeInTheDocument();
    expect(screen.getByText(/informational purposes only/i)).toBeInTheDocument();
  });

  it("labels a fallback AI insight as temporarily unavailable and hides feedback controls", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });
    insightsApiMock.fetchDailyInsight.mockResolvedValue({
      id: null,
      date: "2026-01-01",
      title: "Your daily crypto insight",
      content: "Live AI insight generation is temporarily unavailable.",
      disclaimer: "This content is for informational purposes only and is not financial advice.",
      source: "fallback",
      model_provider: null,
      generated_at: "",
      content_key: null,
    });

    render(<DashboardPage />);

    expect(await screen.findByText("Temporarily unavailable")).toBeInTheDocument();
    // No saved insight to vote on -- feedback controls must not appear
    // inside the insight section specifically (other sections still have
    // their own thumbs-up buttons).
    const insightSection = screen.getByText("Your daily crypto insight").closest("section")!;
    expect(within(insightSection).queryByRole("button", { name: "Thumbs up" })).not.toBeInTheDocument();
  });

  it("shows the meme with its alt text", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });

    render(<DashboardPage />);

    const image = await screen.findByAltText("A cartoon diamond with the caption HODL");
    expect(image).toHaveAttribute("src", "/memes/diamond-hands-01.svg");
  });

  it("moves a preferred section earlier based on saved content preferences", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });
    preferencesApiMock.fetchMyPreferences.mockResolvedValue({
      interested_assets: ["bitcoin"],
      investor_type: "hodler",
      content_types: ["fun"],
      onboarding_completed: true,
      updated_at: "",
    });

    render(<DashboardPage />);

    await screen.findByText("Fun Crypto Meme");
    const headings = screen.getAllByRole("heading", { level: 2 }).map((el) => el.textContent);
    expect(headings[0]).toBe("Fun Crypto Meme");
  });

  it("shows a personalization summary once preferences load", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });

    render(<DashboardPage />);

    expect(await screen.findByText(/hodler/i)).toBeInTheDocument();
  });

  it("labels fallback news as offline content", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({
      items: [
        { id: "fallback-1", title: "Educational content", summary: null, url: null, published_at: null, source_name: "Crypto Advisor", related_assets: [], data_source: "static_fallback", is_fallback: true, content_key: "news:static_fallback:fallback-1" },
      ],
      status: "fallback",
      generated_at: "",
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/offline content/i)).toBeInTheDocument();
  });

  it("shows feedback controls in every one of the four sections", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({
      items: [{ id: "bitcoin", symbol: "BTC", name: "Bitcoin", price_usd: 100000, change_24h_percent: 1, last_updated: null, source: "coingecko", is_stale: false }],
      status: "live",
      generated_at: "",
      content_key: "prices:bitcoin:2026-01-01",
    });
    marketApiMock.fetchNews.mockResolvedValue({
      items: [{ id: "a1", title: "Headline", summary: null, url: null, published_at: null, source_name: null, related_assets: [], data_source: "cryptopanic", is_fallback: false, content_key: "news:cryptopanic:a1" }],
      status: "live",
      generated_at: "",
    });

    render(<DashboardPage />);
    await screen.findByText("Headline");

    // 1 news article + prices + insight + meme = 4 feedback groups.
    const thumbsUpButtons = await screen.findAllByRole("button", { name: "Thumbs up" });
    expect(thumbsUpButtons).toHaveLength(4);
  });

  it("restores a previously saved vote for the meme section", async () => {
    marketApiMock.fetchPrices.mockResolvedValue({ items: [], status: "live", generated_at: "", content_key: "prices::2026-01-01" });
    marketApiMock.fetchNews.mockResolvedValue({ items: [], status: "fallback", generated_at: "" });
    feedbackApiMock.fetchMyFeedback.mockResolvedValue([
      { section_type: "crypto_meme", content_key: "meme:diamond-hands-01", vote: 1, updated_at: "" },
    ]);

    render(<DashboardPage />);
    await screen.findByText("Diamond hands");

    const memeSection = screen.getByText("Fun Crypto Meme").closest("section")!;
    const { getByRole } = within(memeSection);
    expect(getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "true");
  });
});
