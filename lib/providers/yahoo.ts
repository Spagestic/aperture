"use server";
import YahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import type { QuoteSummaryModules } from "yahoo-finance2/modules/quoteSummary";
import type { QuoteSummaryResult } from "yahoo-finance2/modules/quoteSummary-iface";
import type { MarketStripItem as DashboardMarketStripItem } from "@/types/dashboard";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const MARKET_STRIP = [
  { id: "sp500", label: "S&P 500", symbol: "^GSPC" },
  { id: "nasdaq", label: "Nasdaq", symbol: "^IXIC" },
  { id: "russell2000", label: "Russell 2000", symbol: "^RUT" },
  { id: "us10y", label: "US 10Y", symbol: "^TNX" },
  { id: "dxy", label: "DXY", symbol: "DX-Y.NYB" },
  { id: "wti", label: "WTI", symbol: "CL=F" },
  { id: "brent", label: "Brent", symbol: "BZ=F" },
  { id: "gold", label: "Gold", symbol: "GC=F" },
  { id: "btc", label: "BTC", symbol: "BTC-USD" },
  { id: "vix", label: "VIX", symbol: "^VIX" },
] as const;

export type MarketStripConfig = (typeof MARKET_STRIP)[number];

export type MarketStripItem = MarketStripConfig & {
  price: string;
  change: string;
  up: boolean;
  flat: boolean;
};

const SUMMARY_MODULES = [
  "price",
  "summaryProfile",
  "incomeStatementHistory",
  "balanceSheetHistory",
  "cashflowStatementHistory",
] as const satisfies QuoteSummaryModules[];

export type YahooQuote = {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap?: number;
  trailingPE?: number;
  dividendYield?: number;
};

export type YahooFinancials = {
  incomeStatementHistory?: QuoteSummaryResult["incomeStatementHistory"];
  balanceSheetHistory?: QuoteSummaryResult["balanceSheetHistory"];
  cashflowStatementHistory?: QuoteSummaryResult["cashflowStatementHistory"];
};

export type CompanyData = {
  quote: YahooQuote;
  financials: YahooFinancials;
  profile: { longName: string; shortName: string };
};

type DashboardMarketStripConfig = {
  id: string;
  label: string;
  symbol: string;
};

const DASHBOARD_MARKET_STRIP = [
  { id: "sp500", label: "S&P 500", symbol: "^GSPC" },
  { id: "nasdaq", label: "Nasdaq", symbol: "^IXIC" },
  { id: "russell2000", label: "Russell 2000", symbol: "^RUT" },
  { id: "us10y", label: "US 10Y", symbol: "^TNX" },
  { id: "dxy", label: "DXY", symbol: "DX-Y.NYB" },
  { id: "wti", label: "WTI", symbol: "CL=F" },
  { id: "brent", label: "Brent", symbol: "BZ=F" },
  { id: "gold", label: "Gold", symbol: "GC=F" },
  { id: "btc", label: "BTC", symbol: "BTC-USD" },
  { id: "vix", label: "VIX", symbol: "^VIX" },
] as const satisfies readonly DashboardMarketStripConfig[];

function normalizeQuote(quote: Quote): YahooQuote {
  return {
    symbol: quote.symbol,
    regularMarketPrice: quote.regularMarketPrice ?? 0,
    regularMarketChange: quote.regularMarketChange ?? 0,
    regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
    regularMarketVolume: quote.regularMarketVolume ?? 0,
    marketCap: quote.marketCap,
    trailingPE: quote.trailingPE,
    dividendYield: quote.dividendYield,
  };
}

function formatMarketValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMarketChange(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    signDisplay: "exceptZero",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

function normalizeDashboardMarketStripItem(
  item: DashboardMarketStripConfig,
  data: Awaited<ReturnType<typeof getYahooCompanyData>>,
): DashboardMarketStripItem {
  return {
    id: item.id,
    label: item.label,
    symbol: item.symbol,
    price: data.quote.regularMarketPrice,
    change: data.quote.regularMarketChange,
    changePercent: data.quote.regularMarketChangePercent,
    source: "yahoo",
    updatedAt: Date.now(),
  };
}

async function fetchMarketStripItem(
  item: MarketStripConfig,
): Promise<MarketStripItem> {
  try {
    const quote = (await yahooFinance.quote(item.symbol)) as Quote;
    const price = quote.regularMarketPrice ?? 0;
    const changePercent = quote.regularMarketChangePercent ?? 0;
    const changeAmount = quote.regularMarketChange ?? 0;
    const flat =
      Math.abs(changeAmount) < 0.0001 && Math.abs(changePercent) < 0.0001;

    return {
      ...item,
      price: formatMarketValue(price),
      change: formatMarketChange(changePercent),
      up: flat ? true : changeAmount >= 0,
      flat,
    };
  } catch (error) {
    console.error("Yahoo market strip error:", item.symbol, error);

    return {
      ...item,
      price: "—",
      change: "—",
      up: true,
      flat: true,
    };
  }
}

/**
 * Fetch company-level Yahoo Finance data for a ticker.
 *
 * This returns quote details, profile names, and the raw financial statement
 * history needed by downstream dashboard pages.
 */
export async function getYahooCompanyData(
  ticker: string,
): Promise<CompanyData> {
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const [quote, summary] = await Promise.all([
    yahooFinance.quote(normalizedTicker) as Promise<Quote>,
    yahooFinance.quoteSummary(normalizedTicker, {
      modules: [...SUMMARY_MODULES],
    }) as Promise<QuoteSummaryResult>,
  ]);

  const profileSource = summary.price ?? quote;

  return {
    quote: normalizeQuote(quote),
    financials: {
      incomeStatementHistory: summary.incomeStatementHistory,
      balanceSheetHistory: summary.balanceSheetHistory,
      cashflowStatementHistory: summary.cashflowStatementHistory,
    },
    profile: {
      longName: profileSource.longName ?? normalizedTicker,
      shortName: profileSource.shortName ?? normalizedTicker,
    },
  };
}

/**
 * Fetch the live dashboard market strip without going through Convex.
 */
export async function getMarketStrip(): Promise<MarketStripItem[]> {
  return Promise.all(MARKET_STRIP.map(fetchMarketStripItem));
}

/**
 * Fetch the dashboard market strip data used by the API route and SWR refresh.
 */
export async function getDashboardMarketStrip(): Promise<DashboardMarketStripItem[]> {
  const results = await Promise.allSettled(
    DASHBOARD_MARKET_STRIP.map(async (item) => {
      const data = await getYahooCompanyData(item.symbol);
      return normalizeDashboardMarketStripItem(item, data);
    }),
  );

  return results
    .filter((result): result is PromiseFulfilledResult<DashboardMarketStripItem> => {
      if (result.status === "rejected") {
        console.error("Yahoo market strip error:", result.reason);
        return false;
      }

      return true;
    })
    .map((result) => result.value);
}
