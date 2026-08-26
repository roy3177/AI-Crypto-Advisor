"use client";

/**
 * The dashboard: all four mandatory sections (Market News, Coin Prices,
 * AI Insight, Fun Crypto Meme) are real, each backed by its own endpoint.
 *
 * Personalization: section order is derived from the user's saved
 * `content_types` preference (see lib/dashboard-ordering.ts) -- a
 * preferred section moves earlier, but no section is ever removed.
 *
 * Each section fetches independently so that one failing does not take
 * down the others (a partial-failure requirement from CLAUDE.md).
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AiInsightCard } from "@/components/AiInsightCard";
import { CoinPricesCard } from "@/components/CoinPricesCard";
import { MarketNewsCard } from "@/components/MarketNewsCard";
import { MemeCard } from "@/components/MemeCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { orderDashboardSections, type SectionId } from "@/lib/dashboard-ordering";
import { fetchDailyInsight, type DailyInsight } from "@/lib/insights-api";
import { fetchNews, fetchPrices, type NewsResponse, type PricesResponse } from "@/lib/market-api";
import { fetchRandomMeme, type Meme } from "@/lib/memes-api";
import { fetchMyPreferences, type PreferenceResponse } from "@/lib/preferences-api";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [preferences, setPreferences] = useState<PreferenceResponse | null>(null);

  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState<string | null>(null);

  const [news, setNews] = useState<NewsResponse | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightError, setInsightError] = useState<string | null>(null);

  const [meme, setMeme] = useState<Meme | null>(null);
  const [memeLoading, setMemeLoading] = useState(true);
  const [memeError, setMemeError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.onboarding_completed) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.onboarding_completed) return;

    fetchMyPreferences().then(setPreferences).catch(() => setPreferences(null));

    fetchPrices()
      .then(setPrices)
      .catch((err) => setPricesError(err instanceof ApiError ? err.message : "Could not load prices."))
      .finally(() => setPricesLoading(false));

    fetchNews()
      .then(setNews)
      .catch((err) => setNewsError(err instanceof ApiError ? err.message : "Could not load news."))
      .finally(() => setNewsLoading(false));

    fetchDailyInsight()
      .then(setInsight)
      .catch((err) => setInsightError(err instanceof ApiError ? err.message : "Could not load your insight."))
      .finally(() => setInsightLoading(false));

    // Chosen once per dashboard load -- re-renders never pick a new meme.
    fetchRandomMeme()
      .then(setMeme)
      .catch((err) => setMemeError(err instanceof ApiError ? err.message : "Could not load today's meme."))
      .finally(() => setMemeLoading(false));
  }, [user?.onboarding_completed]);

  const sectionOrder = useMemo(
    () => orderDashboardSections(preferences?.content_types ?? []),
    [preferences?.content_types],
  );

  const sections: Record<SectionId, React.ReactNode> = {
    market_news: <MarketNewsCard key="market_news" data={news} isLoading={newsLoading} error={newsError} />,
    coin_prices: <CoinPricesCard key="coin_prices" data={prices} isLoading={pricesLoading} error={pricesError} />,
    ai_insight: <AiInsightCard key="ai_insight" data={insight} isLoading={insightLoading} error={insightError} />,
    crypto_meme: <MemeCard key="crypto_meme" data={meme} isLoading={memeLoading} error={memeError} />,
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button type="button" onClick={logout} className="text-sm underline">
          Log out
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Welcome back, {user?.name}
        {preferences && (
          <>
            {" "}
            -- showing content for a <strong>{preferences.investor_type}</strong> interested in{" "}
            {preferences.interested_assets.join(", ")}.
          </>
        )}
      </p>

      {sectionOrder.map((sectionId) => sections[sectionId])}
    </main>
  );
}
