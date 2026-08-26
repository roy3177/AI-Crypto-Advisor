import type { NewsResponse } from "@/lib/market-api";

interface MarketNewsCardProps {
  data: NewsResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * "Market News" dashboard section -- one of the four mandatory sections.
 * Fallback content is always labeled explicitly, never presented as live.
 */
export function MarketNewsCard({ data, isLoading, error }: MarketNewsCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Market News</h2>
        {data?.status === "fallback" && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Offline content
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading news...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No news available right now.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.items.map((article) => (
            <li key={article.id} className="text-sm">
              {article.url ? (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                  {article.title}
                </a>
              ) : (
                <p className="font-medium">{article.title}</p>
              )}
              {article.summary && <p className="text-zinc-500 dark:text-zinc-400">{article.summary}</p>}
              {article.source_name && <p className="text-xs text-zinc-400">{article.source_name}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
