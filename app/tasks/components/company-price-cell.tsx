"use client";

import useSWR from "swr";

import { cn } from "@/lib/utils";

type QuotePayload = {
  quote: {
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
  };
};

async function fetchQuote(ticker: string): Promise<QuotePayload> {
  const res = await fetch(
    `/api/yahoo/${encodeURIComponent(ticker)}/quote`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err?.message === "string" ? err.message : res.statusText,
    );
  }
  return res.json() as Promise<QuotePayload>;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(n);
}

function formatPct(n: number): string {
  return new Intl.NumberFormat("en-US", {
    signDisplay: "exceptZero",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function CompanyPriceCell({ ticker }: { ticker: string }) {
  const { data, error, isLoading } = useSWR(
    ticker ? ["yahoo-quote", ticker] : null,
    () => fetchQuote(ticker),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  if (isLoading) {
    return <span className="text-muted-foreground tabular-nums">…</span>;
  }

  if (error || !data?.quote) {
    return <span className="text-muted-foreground">—</span>;
  }

  const { regularMarketPrice, regularMarketChangePercent } = data.quote;
  const up = regularMarketChangePercent > 0;
  const down = regularMarketChangePercent < 0;
  const flat =
    Math.abs(regularMarketChangePercent) < 0.0001 ||
    !Number.isFinite(regularMarketChangePercent);

  return (
    <div className="flex flex-col gap-0.5 tabular-nums">
      <span className="font-medium">{formatPrice(regularMarketPrice)}</span>
      <span
        className={cn(
          "text-xs",
          flat && "text-muted-foreground",
          !flat && up && "text-emerald-600 dark:text-emerald-500",
          !flat && down && "text-red-600 dark:text-red-500",
        )}
      >
        {flat ? "0.00%" : `${formatPct(regularMarketChangePercent)}%`}
      </span>
    </div>
  );
}
