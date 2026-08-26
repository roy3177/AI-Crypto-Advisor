/**
 * Market-data API calls, built on the centralized `apiFetch`.
 */
import { apiFetch } from "./api-client";

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price_usd: number | null;
  change_24h_percent: number | null;
  last_updated: string | null;
  source: string;
  is_stale: boolean;
}

export interface PricesResponse {
  items: CoinPrice[];
  status: "live" | "cached" | "unavailable";
  generated_at: string;
  /** Feedback target for the whole section (not per-coin). */
  content_key: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  published_at: string | null;
  source_name: string | null;
  related_assets: string[];
  data_source: string;
  is_fallback: boolean;
  content_key: string;
}

export interface NewsResponse {
  items: NewsArticle[];
  status: "live" | "cached" | "fallback" | "unavailable";
  generated_at: string;
}

export function fetchPrices(): Promise<PricesResponse> {
  return apiFetch<PricesResponse>("/api/market/prices");
}

export function fetchNews(): Promise<NewsResponse> {
  return apiFetch<NewsResponse>("/api/market/news");
}
