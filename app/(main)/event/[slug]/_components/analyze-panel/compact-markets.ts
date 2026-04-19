import type { Market } from "@/lib/polymarket-events";

export type CompactMarket = {
  id: string;
  question?: string;
  outcomes?: Market["outcomes"];
  outcomePrices?: Market["outcomePrices"];
  endDate?: string;
  liquidity?: Market["liquidity"];
  volume24hr?: Market["volume24hr"];
  lastTradePrice?: Market["lastTradePrice"];
  bestBid?: Market["bestBid"];
  bestAsk?: Market["bestAsk"];
};

export function compactMarkets(markets: Market[]): CompactMarket[] {
  return markets.slice(0, 24).map((m) => ({
    id: String(m.id),
    question: m.question,
    outcomes: m.outcomes,
    outcomePrices: m.outcomePrices,
    endDate: m.endDate,
    liquidity: m.liquidity,
    volume24hr: m.volume24hr,
    lastTradePrice: m.lastTradePrice,
    bestBid: m.bestBid,
    bestAsk: m.bestAsk,
  }));
}
