import Image from "next/image";

import { FeedbackButtons } from "@/components/FeedbackButtons";
import { badgeClassName, cardClassName } from "@/components/ui/styles";
import type { NewsResponse } from "@/lib/market-api";

interface MarketNewsCardProps {
  data: NewsResponse | null;
  isLoading: boolean;
  error: string | null;
  /** Looks up the current user's vote for one article's content key. */
  getVote: (contentKey: string) => 1 | -1 | null;
}

/**
 * "Market News" dashboard section -- one of the four mandatory sections.
 * Fallback content is always labeled explicitly, never presented as live.
 * Each article gets its own feedback controls (a per-article, not
 * per-section, vote -- see Skills/manage-content-feedback/SKILLS.md).
 */
export function MarketNewsCard({ data, isLoading, error, getVote }: MarketNewsCardProps) {
  return (
    <section className={cardClassName}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Market News</h2>
        {data?.status === "fallback" && <span className={badgeClassName}>Offline content</span>}
      </div>

      {isLoading && <p className="text-sm text-muted">Loading news...</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <Image
            src="/illustrations/empty-state.webp"
            alt="A cartoon bull mascot shrugging at an empty clipboard"
            width={360}
            height={360}
            className="w-24"
          />
          <p className="text-sm text-muted">No news available right now.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col divide-y divide-surface-border">
          {data.items.map((article) => (
            <li key={article.id} className="flex flex-col gap-1 py-3 text-sm first:pt-0 last:pb-0">
              {article.url ? (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  {article.title}
                </a>
              ) : (
                <p className="font-medium">{article.title}</p>
              )}
              {article.summary && <p className="text-muted">{article.summary}</p>}
              {article.source_name && <p className="text-xs text-muted">{article.source_name}</p>}
              <FeedbackButtons
                sectionType="market_news"
                contentKey={article.content_key}
                initialVote={getVote(article.content_key)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
