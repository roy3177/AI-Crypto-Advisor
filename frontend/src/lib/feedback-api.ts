import { apiFetch } from "./api-client";

export type SectionType = "market_news" | "coin_prices" | "ai_insight" | "crypto_meme";

export interface FeedbackItem {
  section_type: SectionType;
  content_key: string;
  vote: 1 | -1;
  updated_at: string;
}

export function fetchMyFeedback(): Promise<FeedbackItem[]> {
  return apiFetch<FeedbackItem[]>("/api/feedback/me");
}

export function upsertFeedback(data: { section_type: SectionType; content_key: string; vote: 1 | -1 }): Promise<FeedbackItem> {
  return apiFetch<FeedbackItem>("/api/feedback", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
