/**
 * Daily AI insight API call, built on the centralized `apiFetch`.
 */
import { apiFetch } from "./api-client";

export interface DailyInsight {
  id: string | null;
  date: string;
  title: string;
  content: string;
  disclaimer: string;
  source: "ai" | "fallback";
  model_provider: string | null;
  generated_at: string;
}

export function fetchDailyInsight(): Promise<DailyInsight> {
  return apiFetch<DailyInsight>("/api/insights/daily");
}
