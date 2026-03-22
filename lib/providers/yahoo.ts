"use server";
import { cacheLife, cacheTag } from "next/cache";
import YahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import type {
  FundamentalsTimeSeriesBalanceSheetResult,
  FundamentalsTimeSeriesCashFlowResult,
  FundamentalsTimeSeriesFinancialsResult,
  FundamentalsTimeSeriesResult,
} from "yahoo-finance2/modules/fundamentalsTimeSeries";
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

export type YahooQuote = {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketTime?: number;
  marketCap?: number;
  trailingPE?: number;
  dividendYield?: number;
};

export type YahooFinancialStatementSeries = {
  financials: FundamentalsTimeSeriesFinancialsResult[];
  balanceSheet: FundamentalsTimeSeriesBalanceSheetResult[];
  cashflow: FundamentalsTimeSeriesCashFlowResult[];
};

export type YahooFinancials = {
  quarterly: YahooFinancialStatementSeries;
  annual: YahooFinancialStatementSeries;
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
    regularMarketTime:
      quote.regularMarketTime instanceof Date
        ? quote.regularMarketTime.getTime()
        : undefined,
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

const FUNDAMENTALS_LOOKBACK_START = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10);
  return date;
})();

function emptyFinancialStatementSeries(): YahooFinancialStatementSeries {
  return {
    financials: [],
    balanceSheet: [],
    cashflow: [],
  };
}

function collectFinancialStatementSeries(
  results: FundamentalsTimeSeriesResult[],
): YahooFinancialStatementSeries {
  const series = emptyFinancialStatementSeries();

  for (const result of results) {
    if (result.TYPE === "FINANCIALS" || result.TYPE === "ALL") {
      series.financials.push(result as FundamentalsTimeSeriesFinancialsResult);
    }

    if (result.TYPE === "BALANCE_SHEET" || result.TYPE === "ALL") {
      series.balanceSheet.push(
        result as FundamentalsTimeSeriesBalanceSheetResult,
      );
    }

    if (result.TYPE === "CASH_FLOW" || result.TYPE === "ALL") {
      series.cashflow.push(result as FundamentalsTimeSeriesCashFlowResult);
    }
  }

  return series;
}

async function fetchFinancialStatementSeries(
  ticker: string,
  type: "quarterly" | "annual",
): Promise<YahooFinancialStatementSeries> {
  const results = await yahooFinance.fundamentalsTimeSeries(ticker, {
    period1: FUNDAMENTALS_LOOKBACK_START,
    type,
    module: "all",
    merge: false,
    padTimeSeries: true,
  });

  return collectFinancialStatementSeries(results);
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
    updatedAt: data.quote.regularMarketTime ?? 0,
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
/**
 * Lightweight quote only — use for tables and lists (no fundamentals fetch).
 */
export async function getYahooQuoteLite(ticker: string): Promise<YahooQuote> {
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const quote = (await yahooFinance.quote(normalizedTicker)) as Quote;
  return normalizeQuote(quote);
}

export async function getYahooCompanyData(
  ticker: string,
): Promise<CompanyData> {
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const [quoteResult, quarterlyResult, annualResult] = await Promise.allSettled(
    [
      yahooFinance.quote(normalizedTicker) as Promise<Quote>,
      fetchFinancialStatementSeries(normalizedTicker, "quarterly"),
      fetchFinancialStatementSeries(normalizedTicker, "annual"),
    ],
  );

  if (quoteResult.status === "rejected") {
    throw quoteResult.reason;
  }

  const quote = quoteResult.value;
  const quarterly =
    quarterlyResult.status === "fulfilled"
      ? quarterlyResult.value
      : emptyFinancialStatementSeries();
  const annual =
    annualResult.status === "fulfilled"
      ? annualResult.value
      : emptyFinancialStatementSeries();

  return {
    quote: normalizeQuote(quote),
    financials: {
      quarterly,
      annual,
    },
    profile: {
      longName: quote.longName ?? normalizedTicker,
      shortName: quote.shortName ?? normalizedTicker,
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
export async function getDashboardMarketStrip(): Promise<
  DashboardMarketStripItem[]
> {
  return getDashboardMarketStripCached();
}

async function getDashboardMarketStripCached(): Promise<DashboardMarketStripItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard-market-strip");

  const results = await Promise.allSettled(
    DASHBOARD_MARKET_STRIP.map(async (item) => {
      const data = await getYahooCompanyData(item.symbol);
      return normalizeDashboardMarketStripItem(item, data);
    }),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<DashboardMarketStripItem> => {
        if (result.status === "rejected") {
          console.error("Yahoo market strip error:", result.reason);
          return false;
        }

        return true;
      },
    )
    .map((result) => result.value);
}
