import { NextResponse } from "next/server";
import { getYahooCompanyData } from "@/lib/providers/yahoo";
import type { MarketStripItem } from "@/types/dashboard";

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

type MarketStripConfig = (typeof MARKET_STRIP)[number];

function normalizeMarketStripItem(
  item: MarketStripConfig,
  data: Awaited<ReturnType<typeof getYahooCompanyData>>,
): MarketStripItem {
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

export async function GET() {
  const results = await Promise.allSettled(
    MARKET_STRIP.map(async (item) => {
      const data = await getYahooCompanyData(item.symbol);
      return normalizeMarketStripItem(item, data);
    }),
  );

  const marketStrip = results
    .filter((result): result is PromiseFulfilledResult<MarketStripItem> => {
      if (result.status === "rejected") {
        console.error("Yahoo market strip error:", result.reason);
        return false;
      }

      return true;
    })
    .map((result) => result.value);

  return NextResponse.json(marketStrip);
}
