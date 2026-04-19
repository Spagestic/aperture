import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney, type Market } from "@/lib/polymarket-events";
import { topOutcome } from "@/lib/polymarket-events";
import { formatRate, marketCardTitle } from "./event-page-utils";
import { SummaryRow } from "./summary-row";

export function MarketCard({
  market,
  index,
}: {
  market: Market;
  index: number;
}) {
  const outcome = topOutcome(market);

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium leading-snug">
            {marketCardTitle(market, index)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{market.id}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="secondary" className="shrink-0">
            {outcome ? outcome.probability : "N/A"}
          </Badge>
          <Badge variant="outline" className="shrink-0">
            {outcome ? outcome.name : "N/A"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <SummaryRow
          label="Volume"
          value={formatMoney(market.volume ?? market.volume24hr)}
        />
        <SummaryRow label="Liquidity" value={formatMoney(market.liquidity)} />
        <SummaryRow label="Start date" value={formatDate(market.startDate)} />
        <SummaryRow label="End date" value={formatDate(market.endDate)} />
        <SummaryRow
          label="Last trade"
          value={formatRate(market.lastTradePrice)}
        />
        <SummaryRow
          label="Best bid / ask"
          value={`${formatRate(market.bestBid)} / ${formatRate(market.bestAsk)}`}
        />
        <SummaryRow label="Spread" value={formatRate(market.spread)} />
        <SummaryRow
          label="Status"
          value={
            market.active
              ? market.closed
                ? "Active · Closed"
                : "Active"
              : "Inactive"
          }
        />
      </div>
    </div>
  );
}
