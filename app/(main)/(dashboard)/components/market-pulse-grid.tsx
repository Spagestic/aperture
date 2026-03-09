import { FinanceChartCard } from "./finance-chart-card";

export type MarketPulseItem = {
  title: string;
  price: string;
  percentChange: string;
  absoluteChange: string;
  tone: "up" | "down" | "neutral";
  data: number[];
  /** Ticker/code used for routing to the [company] page. */
  ticker: string;
};

type MarketPulseGridProps = {
  items: MarketPulseItem[];
};

export function MarketPulseGrid({ items }: MarketPulseGridProps) {
  return (
    <section className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <FinanceChartCard
            key={item.ticker || item.title}
            title={item.title}
            price={item.price}
            percentChange={item.percentChange}
            absoluteChange={item.absoluteChange}
            tone={item.tone}
            data={item.data}
            ticker={item.ticker}
          />
        ))}
      </div>
    </section>
  );
}
