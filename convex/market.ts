import { action } from "./_generated/server";
import type {
  WatchlistItem,
  MarketPulseItem,
  SummaryItem,
  UpcomingEvent,
  FilingItem,
  StockPriceResponse,
  FinnhubNewsItem,
  FinnhubEarningsItem,
  FinnhubFilingItem,
} from "./marketTransform";
import {
  toWatchlistItem,
  toMarketPulseItem,
  toSummaryItem,
  toUpcomingEvent,
  toFilingItem,
} from "./marketTransform";

const STOCK_PRICES_BASE = "https://stockprices.dev";
const FINNHUB_BASE = "https://finnhub.io/api/v1";

async function fetchStockPrice(
  ticker: string,
  type: "stocks" | "etfs"
): Promise<StockPriceResponse | null> {
  const url = `${STOCK_PRICES_BASE}/api/${type}/${ticker}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as StockPriceResponse;
  return data?.Ticker ? data : null;
}

async function fetchFinnhub<T>(
  path: string,
  token: string
): Promise<T | null> {
  const url = `${FINNHUB_BASE}${path}${path.includes("?") ? "&" : "?"}token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

const WATCHLIST_TICKERS = ["MSFT", "AAPL", "NVDA", "AMZN"];
const MARKET_PULSE_ETFS: { ticker: string; title: string }[] = [
  { ticker: "SPY", title: "S&P Futures" },
  { ticker: "QQQ", title: "NASDAQ Fut." },
  { ticker: "DIA", title: "Dow Futures" },
  { ticker: "VXX", title: "VIX" },
];

/**
 * Batch fetch watchlist quotes from stockprices.dev (no auth).
 */
export const getWatchlistQuotes = action({
  args: {},
  handler: async (): Promise<WatchlistItem[]> => {
    const results: WatchlistItem[] = [];
    for (const ticker of WATCHLIST_TICKERS) {
      const data = await fetchStockPrice(ticker, "stocks");
      if (data) results.push(toWatchlistItem(data));
    }
    return results;
  },
});

/**
 * Fetch market pulse (SPY, QQQ, DIA, VXX) from stockprices.dev.
 */
export const getMarketPulse = action({
  args: {},
  handler: async (): Promise<MarketPulseItem[]> => {
    const results: MarketPulseItem[] = [];
    for (const { ticker, title } of MARKET_PULSE_ETFS) {
      const data = await fetchStockPrice(ticker, "etfs");
      if (data) results.push(toMarketPulseItem(data, title));
    }
    return results;
  },
});

/**
 * Fetch market news from Finnhub. Requires FINNHUB_API_KEY in Convex env.
 */
export const getMarketNews = action({
  args: {},
  handler: async (): Promise<SummaryItem[]> => {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) return [];
    const data = await fetchFinnhub<FinnhubNewsItem[]>(
      "/news?category=general",
      token
    );
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.slice(0, 8).map((item, i) => toSummaryItem(item, i));
  },
});

/**
 * Fetch upcoming earnings from Finnhub.
 */
export const getUpcomingEarnings = action({
  args: {},
  handler: async (): Promise<UpcomingEvent[]> => {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) return [];
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    const data = await fetchFinnhub<{ earningsCalendar?: FinnhubEarningsItem[] }>(
      `/calendar/earnings?from=${fromStr}&to=${toStr}`,
      token
    );
    const calendar = data?.earningsCalendar;
    if (!Array.isArray(calendar) || calendar.length === 0) return [];
    return calendar.slice(0, 10).map(toUpcomingEvent);
  },
});

/**
 * Fetch latest filings for watchlist symbols from Finnhub.
 */
export const getLatestFilings = action({
  args: {},
  handler: async (): Promise<FilingItem[]> => {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) return [];
    const all: FilingItem[] = [];
    for (const ticker of WATCHLIST_TICKERS) {
      const data = await fetchFinnhub<FinnhubFilingItem[]>(
        `/stock/filings?symbol=${ticker}`,
        token
      );
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        if (item) all.push(toFilingItem(item, ticker));
      }
    }
    return all.slice(0, 8);
  },
});

export type DashboardData = {
  watchlist: WatchlistItem[];
  marketPulse: MarketPulseItem[];
  marketSummary: SummaryItem[];
  upcomingEvents: UpcomingEvent[];
  latestFilings: FilingItem[];
};

/**
 * Fetch all dashboard market data in one call (parallel).
 */
export const getDashboardData = action({
  args: {},
  handler: async (): Promise<DashboardData> => {
    const [watchlist, marketPulse, marketSummary, upcomingEvents, latestFilings] =
      await Promise.all([
        (async () => {
          const results: WatchlistItem[] = [];
          for (const ticker of WATCHLIST_TICKERS) {
            const data = await fetchStockPrice(ticker, "stocks");
            if (data) results.push(toWatchlistItem(data));
          }
          return results;
        })(),
        (async () => {
          const results: MarketPulseItem[] = [];
          for (const { ticker, title } of MARKET_PULSE_ETFS) {
            const data = await fetchStockPrice(ticker, "etfs");
            if (data) results.push(toMarketPulseItem(data, title));
          }
          return results;
        })(),
        (async () => {
          const token = process.env.FINNHUB_API_KEY;
          if (!token) return [];
          const data = await fetchFinnhub<FinnhubNewsItem[]>(
            "/news?category=general",
            token
          );
          if (!Array.isArray(data) || data.length === 0) return [];
          return data.slice(0, 8).map((item, i) => toSummaryItem(item, i));
        })(),
        (async () => {
          const token = process.env.FINNHUB_API_KEY;
          if (!token) return [];
          const from = new Date();
          const to = new Date();
          to.setDate(to.getDate() + 14);
          const fromStr = from.toISOString().slice(0, 10);
          const toStr = to.toISOString().slice(0, 10);
          const data = await fetchFinnhub<{
            earningsCalendar?: FinnhubEarningsItem[];
          }>(
            `/calendar/earnings?from=${fromStr}&to=${toStr}`,
            token
          );
          const calendar = data?.earningsCalendar;
          if (!Array.isArray(calendar) || calendar.length === 0) return [];
          return calendar.slice(0, 10).map(toUpcomingEvent);
        })(),
        (async () => {
          const token = process.env.FINNHUB_API_KEY;
          if (!token) return [];
          const all: FilingItem[] = [];
          for (const ticker of WATCHLIST_TICKERS) {
            const data = await fetchFinnhub<FinnhubFilingItem[]>(
              `/stock/filings?symbol=${ticker}`,
              token
            );
            if (Array.isArray(data) && data.length > 0) {
              const item = data[0];
              if (item) all.push(toFilingItem(item, ticker));
            }
          }
          return all.slice(0, 8);
        })(),
      ]);
    return {
      watchlist,
      marketPulse,
      marketSummary,
      upcomingEvents,
      latestFilings,
    };
  },
});
