"use client";

import { useEffect, useState } from "react";
import { FinanceChartCard } from "./finance-chart-card";

const KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// ETF proxies — fully supported by Finnhub free tier
const MARKETS = [
  { title: "S&P 500",   symbol: "SPY", prefix: "$", decimals: 2 },
  { title: "NASDAQ",    symbol: "QQQ", prefix: "$", decimals: 2 },
  { title: "Dow Jones", symbol: "DIA", prefix: "$", decimals: 2 },
  { title: "Hang Seng", symbol: "EWH", prefix: "$", decimals: 2 },
];

interface CardData {
  title:          string;
  price:          string;
  percentChange:  string;
  absoluteChange: string;
  tone:           "up" | "down";
  data:           number[];
}

function fmt(value: number, prefix: string, decimals: number, sign = false): string {
  if (!value || isNaN(value)) return `${prefix}—`;
  const s = sign ? (value >= 0 ? "+" : "") : "";
  return `${s}${prefix}${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

async function fetchQuote(symbol: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${KEY}`
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (!d.c || d.c === 0) return null;
  return { price: d.c, change: d.d, changePct: d.dp };
}

async function fetchCandles(symbol: string): Promise<number[]> {
  const now  = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24;
  const res  = await fetch(
    `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=60&from=${from}&to=${now}&token=${KEY}`
  );
  if (!res.ok) return [];
  const d = await res.json();
  if (d.s !== "ok" || !d.c?.length) return [];
  const closes: number[] = d.c.slice(-10);
  const base = closes[0] || 1;
  return closes.map((v) => (v / base) * 100);
}

export function MarketPulseGrid() {
  const [cards, setCards]     = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results = await Promise.all(
        MARKETS.map(async ({ title, symbol, prefix, decimals }) => {
          const [quote, candles] = await Promise.all([
            fetchQuote(symbol),
            fetchCandles(symbol),
          ]);

          if (!quote) {
            return {
              title,
              price:          `${prefix}—`,
              percentChange:  "—",
              absoluteChange: "—",
              tone:           "down" as const,
              data:           Array(10).fill(100),
            };
          }

          return {
            title,
            price:          fmt(quote.price,    prefix, decimals),
            percentChange:  `${quote.changePct >= 0 ? "+" : ""}${Number(quote.changePct).toFixed(2)}%`,
            absoluteChange: fmt(quote.change,   prefix, decimals, true),
            tone:           quote.changePct >= 0 ? "up" : "down",
            data:           candles.length > 0 ? candles : Array(10).fill(100),
          } satisfies CardData;
        })
      );

      if (!cancelled) {
        setCards(results);
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MARKETS.map(({ title }) => (
            <div key={title} className="rounded-2xl border bg-white p-4 space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-100 rounded-lg" />
                <div className="h-4 w-16 bg-gray-100 rounded-lg" />
              </div>
              <div className="flex justify-between">
                <div className="h-5 w-20 bg-gray-100 rounded-lg" />
                <div className="h-4 w-12 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-12 w-full bg-gray-50 rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <FinanceChartCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}



