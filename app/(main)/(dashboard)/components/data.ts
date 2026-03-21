export type Tone = "up" | "down" | "neutral";

export type MarketAsset = {
  name: string;
  value: string;
  change: string;
  tone: Tone;
  note: string;
};

export type SummaryItem = {
  id: string;
  title: string;
  summary: string;
};

export type WatchlistItem = {
  company: string;
  ticker: string;
  price: string;
  change: string;
  tone: Tone;
};

export type UpcomingEvent = {
  day: string;
  title: string;
  meta: string;
};

export type FilingItem = {
  company: string;
  ticker: string;
  type: string;
  time: string;
};

export const topAssets: MarketAsset[] = [
  {
    name: "S&P Futures",
    value: "5,743.75",
    change: "-1.34%",
    tone: "down",
    note: "US equities",
  },
  {
    name: "Nasdaq Futures",
    value: "24,670.25",
    change: "-1.51%",
    tone: "down",
    note: "Growth stocks",
  },
  {
    name: "Dow Futures",
    value: "47,517.00",
    change: "-0.97%",
    tone: "down",
    note: "Large caps",
  },
  {
    name: "VIX",
    value: "29.49",
    change: "+24.17%",
    tone: "up",
    note: "Volatility",
  },
];

export const marketSummary: SummaryItem[] = [
  {
    id: "oil",
    title: "Crude oil surges to highest level since 2023 on Iran conflict",
    summary:
      "WTI crude jumped sharply as shipping risk through the Strait of Hormuz returned to the center of market pricing. Energy producers outperformed while broader equity indices sold off.",
  },
  {
    id: "bitcoin",
    title: "Bitcoin retreats below $68,000 amid risk-off sentiment",
    summary:
      "Crypto traded lower alongside growth equities as traders moved toward cash, oil, and defensive sectors after the latest geopolitical escalation.",
  },
  {
    id: "jobs",
    title: "U.S. payrolls unexpectedly decline 92,000 in February",
    summary:
      "The weaker labor print increased recession concerns, but bond yields stayed elevated as inflation risk from energy remained the bigger market focus.",
  },
  {
    id: "equities",
    title: "Equity markets face correction risk as oil shock intensifies",
    summary:
      "Higher input costs and tighter financial conditions pushed analysts to trim margin expectations across transport, industrial, and consumer names.",
  },
  {
    id: "treasuries",
    title:
      "Treasury yields climb as inflation concerns override weak jobs data",
    summary:
      "The market focused more on commodity-driven inflation pressure than on softer employment data, keeping longer-duration assets under pressure.",
  },
];

export const watchlist: WatchlistItem[] = [
  {
    company: "Tencent Holdings",
    ticker: "0700.HK",
    price: "HK$412.80",
    change: "+1.22%",
    tone: "up",
  },
  {
    company: "Alibaba Group",
    ticker: "9988.HK",
    price: "HK$88.50",
    change: "-0.45%",
    tone: "down",
  },
  {
    company: "Meituan",
    ticker: "3690.HK",
    price: "HK$116.20",
    change: "+2.10%",
    tone: "up",
  },
  {
    company: "China Mobile",
    ticker: "0941.HK",
    price: "HK$76.30",
    change: "+0.30%",
    tone: "up",
  },
  {
    company: "HSBC Holdings",
    ticker: "0005.HK",
    price: "HK$68.90",
    change: "-1.10%",
    tone: "down",
  },
];

export const upcomingEvents: UpcomingEvent[] = [
  {
    day: "Tue",
    title: "1299.HK earnings call",
    meta: "After market close",
  },
  {
    day: "Wed",
    title: "0700.HK annual meeting",
    meta: "10:00 AM HKT",
  },
  {
    day: "Fri",
    title: "0005.HK ex-dividend date",
    meta: "Cash dividend",
  },
];

export const latestFilings: FilingItem[] = [
  {
    company: "Tencent Holdings",
    ticker: "0700.HK",
    type: "FY2025 Annual Report",
    time: "14 minutes ago",
  },
  {
    company: "Alibaba Group",
    ticker: "9988.HK",
    type: "Interim Report",
    time: "37 minutes ago",
  },
  {
    company: "Meituan",
    ticker: "3690.HK",
    type: "Announcement",
    time: "2 hours ago",
  },
];
