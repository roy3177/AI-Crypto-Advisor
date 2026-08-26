import type { PricesResponse } from "@/lib/market-api";

interface CoinPricesCardProps {
  data: PricesResponse | null;
  isLoading: boolean;
  error: string | null;
}

const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/**
 * "Coin Prices" dashboard section -- one of the four mandatory sections.
 * Change direction is shown with both color AND a +/- sign / arrow, never
 * color alone, per the project's accessibility rules.
 */
export function CoinPricesCard({ data, isLoading, error }: CoinPricesCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Coin Prices</h2>

      {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading prices...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {data && data.status === "unavailable" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Prices are temporarily unavailable.</p>
      )}

      {data && data.items.length === 0 && data.status !== "unavailable" && !isLoading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No assets selected.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.items.map((coin) => {
            const isUp = (coin.change_24h_percent ?? 0) >= 0;
            return (
              <li key={coin.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {coin.name} <span className="text-zinc-400">({coin.symbol})</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>{coin.price_usd !== null ? usdFormatter.format(coin.price_usd) : "N/A"}</span>
                  {coin.change_24h_percent !== null && (
                    <span className={isUp ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                      {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
                      {coin.change_24h_percent.toFixed(2)}%
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.status === "cached" && (
        <p className="text-xs text-zinc-400">Showing recently cached prices.</p>
      )}
    </section>
  );
}
