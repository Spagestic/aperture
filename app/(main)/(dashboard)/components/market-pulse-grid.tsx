"use client";

import { FinanceChartCard } from "./finance-chart-card";

export function MarketPulseGrid() {
  return (
    <section className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceChartCard
          title="S&P Futures"
          price="$6,743.75"
          percentChange="-1.34%"
          absoluteChange="-$91.50"
          tone="down"
          data={[100, 99.7, 99.2, 98.8, 98.5, 98.2, 98.0, 97.8, 97.7, 97.6]}
        />
        <FinanceChartCard
          title="NASDAQ Fut."
          price="$24,670.25"
          percentChange="-1.51%"
          absoluteChange="-$379.25"
          tone="down"
          data={[100, 99.6, 99.1, 98.7, 98.3, 98.0, 97.7, 97.5, 97.3, 97.1]}
        />
        <FinanceChartCard
          title="Dow Futures"
          price="$47,517.00"
          percentChange="-0.97%"
          absoluteChange="-$466.00"
          tone="down"
          data={[100, 99.9, 99.7, 99.5, 99.2, 99.0, 98.8, 98.7, 98.6, 98.5]}
        />
        <FinanceChartCard
          title="VIX"
          price="29.49"
          percentChange="+24.17%"
          absoluteChange="+5.74"
          tone="up"
          data={[
            100, 99.8, 99.7, 99.7, 99.9, 100.2, 100.8, 101.5, 102.7, 124.2,
          ]}
        />
      </div>
    </section>
  );
}



