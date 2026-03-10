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
  const to = Math.floor(Date.now() / 1000);
  const from = to - 24 * 60 * 60;
  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${ticker}&resolution=5&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 60 } }
  );
  return res.json();
  
}
