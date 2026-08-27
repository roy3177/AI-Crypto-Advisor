"use client";

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: The personalized dashboard page -- all four mandatory sections.
 *
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
import { AppHeader } from "@/components/AppHeader";
import { CoinPricesCard } from "@/components/CoinPricesCard";
import { MarketNewsCard } from "@/components/MarketNewsCard";
import { MemeCard } from "@/components/MemeCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RadialBackground } from "@/components/RadialBackground";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { orderDashboardSections, type SectionId } from "@/lib/dashboard-ordering";
import { fetchMyFeedback, type FeedbackItem } from "@/lib/feedback-api";
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
  const { user } = useAuth();
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

  // Loaded once for the whole page (not per card) -- see
  // Skills/manage-content-feedback/SKILLS.md's "avoid one request per card".
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    if (user && !user.onboarding_completed) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.onboarding_completed) return;

    fetchMyPreferences().then(setPreferences).catch(() => setPreferences(null));
    fetchMyFeedback().then(setFeedback).catch(() => setFeedback([]));

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

  const voteByContentKey = useMemo(() => {
    const map = new Map<string, 1 | -1>();
    for (const item of feedback) map.set(item.content_key, item.vote);
    return map;
  }, [feedback]);
  const getVote = (contentKey: string): 1 | -1 | null => voteByContentKey.get(contentKey) ?? null;

  const sections: Record<SectionId, React.ReactNode> = {
    market_news: <MarketNewsCard key="market_news" data={news} isLoading={newsLoading} error={newsError} getVote={getVote} />,
    coin_prices: (
      <CoinPricesCard
        key="coin_prices"
        data={prices}
        isLoading={pricesLoading}
        error={pricesError}
        currentVote={prices ? getVote(prices.content_key) : null}
      />
    ),
    ai_insight: (
      <AiInsightCard
        key="ai_insight"
        data={insight}
        isLoading={insightLoading}
        error={insightError}
        currentVote={insight?.content_key ? getVote(insight.content_key) : null}
      />
    ),
    crypto_meme: (
      <MemeCard
        key="crypto_meme"
        data={meme}
        isLoading={memeLoading}
        error={memeError}
        currentVote={meme ? getVote(meme.content_key) : null}
      />
    ),
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <RadialBackground />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
        <AppHeader />

        <main className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {user?.name}</h1>
            {preferences && (
              <p className="mt-2 text-lg text-muted">
                Showing content for a <span className="font-semibold text-foreground">{preferences.investor_type}</span>{" "}
                interested in {preferences.interested_assets.join(", ")}.
              </p>
            )}
          </div>

          {sectionOrder.map((sectionId, index) => (
            <div key={sectionId} className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}>
              {sections[sectionId]}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
