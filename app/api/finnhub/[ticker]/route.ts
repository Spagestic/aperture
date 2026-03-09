/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;

if (!API_KEY) throw new Error("FINNHUB_API_KEY is missing");

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

export type CompanyData = {
  quote: FinnhubQuote;
  profile: FinnhubProfile;
  metrics: FinnhubMetric;
  // Finnhub free tier has lighter statements → we return basic reported data
  income?: any[];
  balance?: any[];
  cashflow?: any[];
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker: rawTicker } = await params;

  if (!rawTicker) {
    return NextResponse.json(
      { error: "Ticker parameter is required" },
      { status: 400 },
    );
  }

  const ticker = rawTicker.toUpperCase();

  try {
    const [quoteRes, profileRes, metricRes] = await Promise.all([
      fetch(`${BASE_URL}/quote?symbol=${ticker}&token=${API_KEY}`, {
        next: { revalidate: 30 },
      }),
      fetch(`${BASE_URL}/stock/profile2?symbol=${ticker}&token=${API_KEY}`, {
        next: { revalidate: 300 },
      }),
      fetch(`${BASE_URL}/stock/metric?symbol=${ticker}&token=${API_KEY}`, {
        next: { revalidate: 300 },
      }),
    ]);

    const quote: FinnhubQuote = await quoteRes.json();
    const profile: FinnhubProfile = await profileRes.json();
    const metrics: FinnhubMetric = await metricRes.json();

    // Optional: Add financial statements if you want (Finnhub reported endpoint)
    // const financialsRes = await fetch(`${BASE_URL}/stock/financials-reported?symbol=${ticker}&token=${API_KEY}`);
    // const financials = await financialsRes.json();

    const data: CompanyData = { quote, profile, metrics };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Finnhub error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Finnhub" },
      { status: 500 },
    );
  }
}
