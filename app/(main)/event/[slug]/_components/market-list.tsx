import { MarketCard } from "./market-card";
import type { Market } from "@/lib/polymarket-events";

export function MarketList({ markets }: { markets: Market[] }) {
  if (markets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No markets available.</p>
    );
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {markets.map((market, index) => (
        <MarketCard key={market.id} market={market} index={index} />
      ))}
    </div>
  );
}
