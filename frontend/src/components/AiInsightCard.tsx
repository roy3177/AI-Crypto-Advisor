import { Sparkles } from "lucide-react";

import { FeedbackButtons } from "@/components/FeedbackButtons";
import { badgeClassName, cardClassName } from "@/components/ui/styles";
import type { DailyInsight } from "@/lib/insights-api";

interface AiInsightCardProps {
  data: DailyInsight | null;
  isLoading: boolean;
  error: string | null;
  currentVote: 1 | -1 | null;
}

/**
 * "AI Insight of the Day" dashboard section -- one of the four mandatory
 * sections. The disclaimer is always rendered, for both AI-generated and
 * fallback content, and the output is always plain text (never rendered
 * as HTML). Feedback controls only appear for a saved insight
 * (`content_key` is `null` for a non-persisted fallback -- there is
 * nothing to vote on).
 */
export function AiInsightCard({ data, isLoading, error, currentVote }: AiInsightCardProps) {
  return (
    <section className={cardClassName}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
            <Sparkles className="h-4 w-4 text-accent" />
          </span>
          <h2 className="text-lg font-semibold">{data?.title ?? "AI Insight of the Day"}</h2>
          {data?.source === "fallback" && <span className={badgeClassName}>Temporarily unavailable</span>}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted">Generating your insight...</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {data && <p className="whitespace-pre-line text-sm">{data.content}</p>}

      {data && <p className="border-t border-surface-border pt-3 text-xs text-muted">{data.disclaimer}</p>}

      {data?.content_key && (
        <FeedbackButtons sectionType="ai_insight" contentKey={data.content_key} initialVote={currentVote} />
      )}
    </section>
  );
}
