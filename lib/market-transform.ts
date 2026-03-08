/**
 * Transform external API responses into dashboard types.
 * Used by Convex market actions and shared types.
 */

export type Tone = "up" | "down" | "neutral";

/** stockprices.dev response (stocks and ETFs) */
export type StockPriceResponse = {
  Ticker: string;
  Name: string;
  Price: number;
  ChangeAmount: number;
  ChangePercentage: number;
};

export type WatchlistItem = {
  company: string;
  ticker: string;
  price: string;
  change: string;
  tone: Tone;
};

export type MarketPulseItem = {
  title: string;
  price: string;
  percentChange: string;
  absoluteChange: string;
  tone: Tone;
  /** Normalized 0-100 sparkline; length 10 for chart */
  data: number[];
};

export type SummaryItem = {
  id: string;
  title: string;
  summary: string;
};

export type UpcomingEvent = {
  day: string;
  title: string;
  meta: string;
};

export type FilingItem = {
  company: string;
  ticker: string;
  type: string;
  time: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toneFromChange(changePct: number): Tone {
  if (changePct > 0) return "up";
  if (changePct < 0) return "down";
  return "neutral";
}

function formatChange(changePct: number): string {
  const sign = changePct >= 0 ? "+" : "";
  return `${sign}${changePct.toFixed(2)}%`;
}

/** Map stockprices.dev response to WatchlistItem */
export function toWatchlistItem(r: StockPriceResponse): WatchlistItem {
  return {
    company: r.Name,
    ticker: r.Ticker,
    price: `$${r.Price.toFixed(2)}`,
    change: formatChange(r.ChangePercentage),
    tone: toneFromChange(r.ChangePercentage),
  };
}

/** Build sparkline from price and change (MVP: simple trend) */
function sparklineFromChange(changePct: number): number[] {
  const points = 10;
  const trend = changePct >= 0 ? 1 : -1;
  const base = 100;
  const step = (Math.min(Math.abs(changePct), 5) * trend) / (points - 1);
  return Array.from({ length: points }, (_, i) =>
    Number((base + step * i).toFixed(1))
  );
}

/** Map stockprices.dev ETF response to MarketPulseItem */
export function toMarketPulseItem(
  response: StockPriceResponse,
  title: string
): MarketPulseItem {
  const priceStr =
    response.Price >= 1000
      ? response.Price.toLocaleString("en-US", { minimumFractionDigits: 2 })
      : response.Price.toFixed(2);
  const absChange =
    response.ChangeAmount >= 0
      ? `+${response.ChangeAmount.toFixed(2)}`
      : `-$${Math.abs(response.ChangeAmount).toFixed(2)}`;
  return {
    title,
    price: `$${priceStr}`,
    percentChange: formatChange(response.ChangePercentage),
    absoluteChange: absChange,
    tone: toneFromChange(response.ChangePercentage),
    data: sparklineFromChange(response.ChangePercentage),
  };
}

/** Finnhub news item */
export type FinnhubNewsItem = {
  category?: string;
  datetime: number;
  headline: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
};

export function toSummaryItem(item: FinnhubNewsItem, index: number): SummaryItem {
  return {
    id: String(item.id ?? index),
    title: item.headline ?? "",
    summary: item.summary ?? item.headline ?? "",
  };
}

/** Finnhub earnings calendar item */
export type FinnhubEarningsItem = {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour?: string;
  quarter?: number;
  revenueActual?: number | null;
  revenueEstimate?: number | null;
  symbol: string;
  year?: number;
};

export function toUpcomingEvent(item: FinnhubEarningsItem): UpcomingEvent {
  const d = new Date(item.date);
  const day = WEEKDAYS[d.getUTCDay()];
  const meta =
    item.hour === "bmo"
      ? "Before market open"
      : item.hour === "amc"
        ? "After market close"
        : "Earnings";
  return {
    day,
    title: `${item.symbol} earnings`,
    meta,
  };
}

/** Finnhub filing item */
export type FinnhubFilingItem = {
  acceptanceDateTime?: string;
  accessionNumber?: string[];
  filingDate?: string;
  form?: string;
  reportDate?: number;
  symbol?: string;
};

const SYMBOL_TO_NAME: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
  GOOGL: "Alphabet",
  META: "Meta",
  TSLA: "Tesla",
};

function relativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function toFilingItem(
  item: FinnhubFilingItem,
  ticker: string
): FilingItem {
  const company = SYMBOL_TO_NAME[ticker] ?? ticker;
  const time = item.acceptanceDateTime
    ? relativeTime(item.acceptanceDateTime)
    : item.filingDate
      ? new Date(item.filingDate).toLocaleDateString()
      : "—";
  return {
    company,
    ticker,
    type: item.form ?? "Filing",
    time,
  };
}
