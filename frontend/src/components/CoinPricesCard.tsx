import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { FeedbackButtons } from "@/components/FeedbackButtons";
import { Illustration } from "@/components/Illustration";
import { cardClassName } from "@/components/ui/styles";
import type { PricesResponse } from "@/lib/market-api";

interface CoinPricesCardProps {
  data: PricesResponse | null;
  isLoading: boolean;
  error: string | null;
  currentVote: 1 | -1 | null;
}

const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/**
 * "Coin Prices" dashboard section -- one of the four mandatory sections.
 * Change direction is shown with both color AND an arrow icon / sign,
 * never color alone, per the project's accessibility rules.
 */
export function CoinPricesCard({ data, isLoading, error, currentVote }: CoinPricesCardProps) {
  return (
    <section className={cardClassName}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Coin Prices</h2>
        {data && (
          <FeedbackButtons sectionType="coin_prices" contentKey={data.content_key} initialVote={currentVote} />
        )}
      </div>

      {isLoading && <p className="text-sm text-muted">Loading prices...</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {data && data.status === "unavailable" && (
        <p className="text-sm text-muted">Prices are temporarily unavailable.</p>
      )}

      {data && data.items.length === 0 && data.status !== "unavailable" && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <Illustration
            src="/illustrations/empty-state.webp"
            alt="A cartoon bull mascot shrugging at an empty clipboard"
            width={360}
            height={360}
            glow={false}
            wrapperClassName="w-24"
          />
          <p className="text-sm text-muted">No assets selected.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col divide-y divide-surface-border">
          {data.items.map((coin) => {
            const isUp = (coin.change_24h_percent ?? 0) >= 0;
            return (
              <li key={coin.id} className="flex items-center justify-between py-4 text-base first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                    {coin.symbol.slice(0, 3)}
                  </span>
                  <span>
                    <span className="block font-semibold leading-tight">{coin.name}</span>
                    <span className="block text-sm text-muted">{coin.symbol}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold leading-tight">
                    {coin.price_usd !== null ? usdFormatter.format(coin.price_usd) : "N/A"}
                  </span>
                  {coin.change_24h_percent !== null && (
                    <span
                      className={`flex items-center justify-end gap-0.5 text-sm font-semibold ${isUp ? "text-success" : "text-danger"}`}
                    >
                      {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {isUp ? "+" : ""}
                      {coin.change_24h_percent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.status === "cached" && <p className="text-xs text-muted">Showing recently cached prices.</p>}
    </section>
  );
}
