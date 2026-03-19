import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function getQuote(ticker: string) {
  const res = await fetch(
    `${BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 30 } },
  );
  return res.json();
}

export async function getCompanyProfile(ticker: string) {
  const res = await fetch(
    `${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 3600 } },
  );
  return res.json();
}

export async function getCandles(ticker: string, range: string = "1Y") {
  try {
    const now = new Date();
    let period1: Date;
    let interval: "1d" | "1h" | "1wk" = "1d";

    switch (range) {
      case "1D":
        period1 = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        interval = "1h";
        break;
      case "5D":
        period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        interval = "1h";
        break;
      case "1W":
        period1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        interval = "1h";
        break;
      case "1M":
        period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        interval = "1d";
        break;
      case "3M":
        period1 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        interval = "1d";
        break;
      case "6M":
        period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        interval = "1d";
        break;
      case "5Y":
        period1 = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
        interval = "1wk";
        break;
      default: // 1Y
        period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        interval = "1d";
    }

    const data = (await yahooFinance.chart(
      ticker,
      {
        period1,
        period2: now,
        interval,
      },
      { validateResult: false },
    )) as {
      quotes: Array<{
        date: Date | string;
        close: number;
        open: number;
        high: number;
        low: number;
        volume: number;
      }>;
    };

    return {
      s: "ok",
      t: data.quotes.map((q) => new Date(q.date).getTime() / 1000),
      c: data.quotes.map((q) => q.close),
      o: data.quotes.map((q) => q.open),
      h: data.quotes.map((q) => q.high),
      l: data.quotes.map((q) => q.low),
      v: data.quotes.map((q) => q.volume),
    };
  } catch (error) {
    console.error("Yahoo Finance error:", error);
    return { s: "no_data" };
  }
}
