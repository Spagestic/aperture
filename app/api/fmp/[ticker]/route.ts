// /app/api/fmp/[ticker]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://financialmodelingprep.com/stable";
const API_KEY = process.env.FMP_API_KEY;

type FmpErrorPayload = {
  Error?: string;
  "Error Message"?: string;
  message?: string;
};

// Simple types (expand as needed)
export type FMPQuote = {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  marketCap?: number;
};

export type FMPKeyMetrics = {
  marketCap: number;
  peRatio: number;
  dividendYield?: number;
  eps: number;
  // ... add more as you use them
};

export type FMPIncomeStatement = {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  // ... add fields you display
};

export type FMPBalanceSheet = {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
};

export type FMPCashFlow = {
  date: string;
  operatingCashFlow: number;
  freeCashFlow: number;
};

export type CompanyData = {
  quote: FMPQuote;
  metrics: FMPKeyMetrics[];
  income: FMPIncomeStatement[];
  balance: FMPBalanceSheet[];
  cashflow: FMPCashFlow[];
};

function buildFmpUrl(
  endpoint: string,
  params: Record<string, string | number>,
): string {
  const url = new URL(`${BASE_URL}/${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  url.searchParams.set("apikey", API_KEY ?? "");
  return url.toString();
}

async function fetchFmp<T>(
  endpoint: string,
  params: Record<string, string | number>,
  revalidate: number,
): Promise<T> {
  const response = await fetch(buildFmpUrl(endpoint, params), {
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `FMP ${endpoint} failed: ${response.status} ${response.statusText} ${errorBody}`,
    );
  }

  const data = (await response.json()) as T | FmpErrorPayload;

  const errorPayload =
    !Array.isArray(data) && typeof data === "object" && data !== null
      ? (data as FmpErrorPayload)
      : null;

  if (
    errorPayload &&
    (errorPayload.Error ||
      errorPayload["Error Message"] ||
      errorPayload.message)
  ) {
    throw new Error(
      errorPayload.Error ??
        errorPayload["Error Message"] ??
        errorPayload.message ??
        "Unknown FMP error",
    );
  }

  return data as T;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  if (!API_KEY) {
    return NextResponse.json(
      {
        error: "FMP_API_KEY is not set in .env or .env.local",
        message:
          "Set FMP_API_KEY in your .env or .env.local, then restart the dev server.",
      },
      { status: 500 },
    );
  }

  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase(); // works with 0700.HK

  try {
    const commonParams = { symbol: ticker, limit: 5 };

    // Parallel fetches → faster
    const [quote, metrics, income, balance, cashflow] = await Promise.all([
      fetchFmp<FMPQuote[]>("quote", { symbol: ticker }, 60),
      fetchFmp<FMPKeyMetrics[]>("key-metrics", commonParams, 300),
      fetchFmp<FMPIncomeStatement[]>("income-statement", commonParams, 300),
      fetchFmp<FMPBalanceSheet[]>("balance-sheet-statement", commonParams, 300),
      fetchFmp<FMPCashFlow[]>("cash-flow-statement", commonParams, 300),
    ]);

    if (!quote.length) {
      return NextResponse.json(
        { error: `No quote data returned for ticker '${ticker}'` },
        { status: 404 },
      );
    }

    const data: CompanyData = {
      quote: quote[0],
      metrics: metrics,
      income: income,
      balance: balance,
      cashflow: cashflow,
    };

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("FMP API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from FMP", message },
      { status: 500 },
    );
  }
}
