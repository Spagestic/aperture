"use server";

const BASE_URL = "https://financialmodelingprep.com/stable";
const API_KEY = process.env.FMP_API_KEY;

type FmpErrorPayload = {
  Error?: string;
  "Error Message"?: string;
  message?: string;
};

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
};

export type FMPIncomeStatement = {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
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

/**
 * Fetch structured company fundamentals from Financial Modeling Prep.
 */
export async function getFmpCompanyData(ticker: string): Promise<CompanyData> {
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  if (!API_KEY) {
    throw new Error("FMP_API_KEY is not set in .env or .env.local");
  }

  const commonParams = { symbol: normalizedTicker, limit: 5 };

  const [quote, metrics, income, balance, cashflow] = await Promise.all([
    fetchFmp<FMPQuote[]>("quote", { symbol: normalizedTicker }, 60),
    fetchFmp<FMPKeyMetrics[]>("key-metrics", commonParams, 300),
    fetchFmp<FMPIncomeStatement[]>("income-statement", commonParams, 300),
    fetchFmp<FMPBalanceSheet[]>("balance-sheet-statement", commonParams, 300),
    fetchFmp<FMPCashFlow[]>("cash-flow-statement", commonParams, 300),
  ]);

  if (!quote.length) {
    throw new Error(`No quote data returned for ticker '${normalizedTicker}'`);
  }

  return {
    quote: quote[0],
    metrics,
    income,
    balance,
    cashflow,
  };
}
