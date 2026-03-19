export type MarketStripItem = {
  id: string;
  label: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  source: "yahoo" | "finnhub" | "fmp";
  updatedAt: number;
};

export type WatchlistItem = {
  symbol: string;
  name: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  currency?: string;
  source: "yahoo" | "finnhub";
};

export type UpcomingItem = {
  id: string;
  symbol: string;
  title: string;
  datetime: string;
  type: "earnings" | "meeting" | "dividend" | "macro";
};

export type FilingItem = {
  id: string;
  symbol: string;
  companyName: string;
  formType: string;
  title?: string;
  filedAt: string;
  sourceUrl?: string;
  status?: "queued" | "ocr" | "parsed" | "summarized";
};

export type MarketSummaryItem = {
  id: string;
  headline: string;
  summary: string;
  impactedSymbols?: string[];
  sourceCount?: number;
};
