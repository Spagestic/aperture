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

type FinnhubCandleResponse = {
  c: number[];
  t: number[];
  s: string;
};

async function fetchStockPrice(
  ticker: string,
  type: "stocks" | "etfs",
): Promise<StockPriceResponse | null> {
  const url = `${STOCK_PRICES_BASE}/api/${type}/${ticker}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as StockPriceResponse;
  return data?.Ticker ? data : null;
}

async function fetchFinnhub<T>(path: string, token: string): Promise<T | null> {
  const url = `${FINNHUB_BASE}${path}${path.includes("?") ? "&" : "?"}token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

const WATCHLIST_TICKERS = ["MSFT", "AAPL", "NVDA", "AMZN"];
const MARKET_PULSE_ETFS: {
  dataTicker: string;
  routeTicker: string;
  title: string;
}[] = [
  // Use SPY for data but route to the ESUSD futures page.
  { dataTicker: "SPY", routeTicker: "ESUSD", title: "S&P Futures" },
  { dataTicker: "QQQ", routeTicker: "QQQ", title: "NASDAQ Fut." },
  { dataTicker: "DIA", routeTicker: "DIA", title: "Dow Futures" },
  { dataTicker: "VXX", routeTicker: "VXX", title: "VIX" },
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
 * Fetch market pulse (SPY, QQQ, DIA, VXX) from stockprices.dev
 * and augment with recent daily candles from Finnhub when available.
 */
export const getMarketPulse = action({
  args: {},
  handler: async (): Promise<MarketPulseItem[]> => {
    const results: MarketPulseItem[] = [];
    const token = process.env.FINNHUB_API_KEY;
    const nowSec = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - 60 * 60 * 24 * 30; // ~30 days of daily candles

    for (const { dataTicker, routeTicker, title } of MARKET_PULSE_ETFS) {
      const [quote, candles] = await Promise.all([
        fetchStockPrice(dataTicker, "etfs"),
        token
          ? fetchFinnhub<FinnhubCandleResponse>(
              `/stock/candle?symbol=${dataTicker}&resolution=D&from=${fromSec}&to=${nowSec}`,
              token,
            )
          : Promise.resolve(null),
      ]);
      if (!quote) continue;

      let sparkline: number[] | undefined;
      if (candles && candles.s === "ok" && Array.isArray(candles.c)) {
        const closes = candles.c;
        const slice =
          closes.length > 10 ? closes.slice(closes.length - 10) : closes;
        // Use closes directly for sparkline; FinanceChartCard handles scaling.
        sparkline = slice;
      }

      results.push(toMarketPulseItem(quote, title, routeTicker, sparkline));
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
      token,
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
    const data = await fetchFinnhub<{
      earningsCalendar?: FinnhubEarningsItem[];
    }>(`/calendar/earnings?from=${fromStr}&to=${toStr}`, token);
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
        token,
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
    const [
      watchlist,
      marketPulse,
      marketSummary,
      upcomingEvents,
      latestFilings,
    ] = await Promise.all([
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
        const token = process.env.FINNHUB_API_KEY;
        const nowSec = Math.floor(Date.now() / 1000);
        const fromSec = nowSec - 60 * 60 * 24 * 30;

        for (const { dataTicker, routeTicker, title } of MARKET_PULSE_ETFS) {
          const [quote, candles] = await Promise.all([
            fetchStockPrice(dataTicker, "etfs"),
            token
              ? fetchFinnhub<FinnhubCandleResponse>(
                  `/stock/candle?symbol=${dataTicker}&resolution=D&from=${fromSec}&to=${nowSec}`,
                  token,
                )
              : Promise.resolve(null),
          ]);
          if (!quote) continue;

          let sparkline: number[] | undefined;
          if (candles && candles.s === "ok" && Array.isArray(candles.c)) {
            const closes = candles.c;
            const slice =
              closes.length > 10 ? closes.slice(closes.length - 10) : closes;
            sparkline = slice;
          }

          results.push(toMarketPulseItem(quote, title, routeTicker, sparkline));
        }
        return results;
      })(),
      (async () => {
        const token = process.env.FINNHUB_API_KEY;
        if (!token) return [];
        const data = await fetchFinnhub<FinnhubNewsItem[]>(
          "/news?category=general",
          token,
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
        }>(`/calendar/earnings?from=${fromStr}&to=${toStr}`, token);
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
            token,
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
