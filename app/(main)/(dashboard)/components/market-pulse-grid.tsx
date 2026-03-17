"use client";

import { useEffect, useState } from "react";
import { FinanceChartCard } from "./finance-chart-card";

const KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// ETF proxies — fully supported by Finnhub free tier
const MARKETS = [
  { title: "S&P 500", symbol: "SPY", prefix: "$", decimals: 2 },
  { title: "NASDAQ", symbol: "QQQ", prefix: "$", decimals: 2 },
  { title: "Dow Jones", symbol: "DIA", prefix: "$", decimals: 2 },
  { title: "Hang Seng", symbol: "EWH", prefix: "$", decimals: 2 },
];

interface CardData {
  title: string;
  price: string;
  percentChange: string;
  absoluteChange: string;
  tone: "up" | "down";
  data: number[];
}

function fmt(
  value: number,
  prefix: string,
  decimals: number,
  sign = false,
): string {
  if (!value || isNaN(value)) return `${prefix}—`;
  const s = sign ? (value >= 0 ? "+" : "") : "";
  return `${s}${prefix}${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

async function fetchQuote(symbol: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${KEY}`,
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (!d.c || d.c === 0) return null;
  return { price: d.c, change: d.d, changePct: d.dp };
}

async function fetchCandles(symbol: string): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24;
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=60&from=${from}&to=${now}&token=${KEY}`,
  );
  if (!res.ok) return [];
  const d = await res.json();
  if (d.s !== "ok" || !d.c?.length) return [];
  const closes: number[] = d.c.slice(-10);
  const base = closes[0] || 1;
  return closes.map((v) => (v / base) * 100);
}

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
