import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function getQuote(ticker: string) {
  const res = await fetch(
    `${BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 30 } }
  );
  return res.json();
}

export async function getCompanyProfile(ticker: string) {
  const res = await fetch(
    `${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  return res.json();
}

export async function getCandles(ticker: string) {
  try {
    const data = await yahooFinance.historical(ticker, {
      period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      period2: new Date(),
      interval: "1d",
    });

    return {
      s: "ok",
      t: data.map((q) => q.date.getTime() / 1000),
      c: data.map((q) => q.close),
      o: data.map((q) => q.open),
      h: data.map((q) => q.high),
      l: data.map((q) => q.low),
      v: data.map((q) => q.volume),
    };
  } catch (error) {
    console.error("Yahoo Finance error:", error);
    return { s: "no_data" };
  }
}