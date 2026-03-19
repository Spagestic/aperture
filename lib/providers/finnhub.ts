"use server";

const BASE_URL = "https://finnhub.io/api/v1";

export type FinnhubQuote = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
};

export type FinnhubProfile = {
  name: string;
  ticker: string;
  marketCap?: number;
  shareOutstanding?: number;
};

export type FinnhubMetric = {
  metric: {
    "10DayAverageTradingVolume"?: number;
    "52WeekHigh"?: number;
    "52WeekLow"?: number;
    marketCapitalization?: number;
    peNormalizedAnnual?: number;
    dividendYieldIndicatedAnnual?: number;
  };
};

export type FinnhubCompanyData = {
  quote: FinnhubQuote;
  profile: FinnhubProfile;
  metrics: FinnhubMetric;
  // Finnhub free tier has lighter statements → we return basic reported data
  income?: unknown[];
  balance?: unknown[];
  cashflow?: unknown[];
};

async function fetchFinnhubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Finnhub request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch company-level Finnhub data for a ticker.
 */
export async function getFinnhubCompanyData(
  ticker: string,
): Promise<FinnhubCompanyData> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY is missing");
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required");
  }

  const [quote, profile, metrics] = await Promise.all([
    fetchFinnhubJson<FinnhubQuote>(
      `${BASE_URL}/quote?symbol=${normalizedTicker}&token=${apiKey}`,
    ),
    fetchFinnhubJson<FinnhubProfile>(
      `${BASE_URL}/stock/profile2?symbol=${normalizedTicker}&token=${apiKey}`,
    ),
    fetchFinnhubJson<FinnhubMetric>(
      `${BASE_URL}/stock/metric?symbol=${normalizedTicker}&token=${apiKey}`,
    ),
  ]);

  return {
    quote,
    profile,
    metrics,
  };
}
