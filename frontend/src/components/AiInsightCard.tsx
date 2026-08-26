import type { DailyInsight } from "@/lib/insights-api";

interface AiInsightCardProps {
  data: DailyInsight | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * "AI Insight of the Day" dashboard section -- one of the four mandatory
 * sections. The disclaimer is always rendered, for both AI-generated and
 * fallback content, and the output is always plain text (never rendered
 * as HTML).
 */
export function AiInsightCard({ data, isLoading, error }: AiInsightCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{data?.title ?? "AI Insight of the Day"}</h2>
        {data?.source === "fallback" && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Temporarily unavailable
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating your insight...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {data && <p className="whitespace-pre-line text-sm">{data.content}</p>}

      {data && <p className="text-xs text-zinc-400">{data.disclaimer}</p>}
    </section>
  );
}
