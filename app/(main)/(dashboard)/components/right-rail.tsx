<<<<<<< HEAD
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";
=======
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText, Flame, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
>>>>>>> ed2551b9e76dbd93361a769310b020ee94562641

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
<<<<<<< HEAD
import type { FilingItem, UpcomingEvent, WatchlistItem } from "./data";
=======

import type { FilingItem, UpcomingEvent } from "./data";

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape saved by the watchlist page in localStorage
interface StoredStock {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  changePct: number;
  currency: string;
}

interface RailStock {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  currency: string;
}
>>>>>>> ed2551b9e76dbd93361a769310b020ee94562641

type DashboardRightRailProps = {
  watchlist?: unknown;       // kept for backwards compat with page.tsx — ignored
  upcomingEvents: UpcomingEvent[];
  latestFilings: FilingItem[];
};

<<<<<<< HEAD
function companySlugFromTicker(ticker: string) {
  return ticker.toLowerCase().replace(/\./g, "-");
}

=======
const STORAGE_KEY = "watchlist_stocks";

const TRENDING_TICKERS: { ticker: string; name: string }[] = [
  { ticker: "NVDA",  name: "NVIDIA Corporation" },
  { ticker: "AAPL",  name: "Apple Inc." },
  { ticker: "TSLA",  name: "Tesla, Inc." },
  { ticker: "MSFT",  name: "Microsoft Corporation" },
  { ticker: "META",  name: "Meta Platforms" },
];

// ─── Finnhub quote fetch ──────────────────────────────────────────────────────

async function fetchQuote(ticker: string): Promise<{ price: number; changePct: number } | null> {
  try {
    const key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.c || d.c === 0) return null;
    return {
      price:     d.c,
      changePct: d.pc > 0 ? ((d.c - d.pc) / d.pc) * 100 : 0,
    };
  } catch {
    return null;
  }
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500",
  "bg-red-500",  "bg-cyan-500",   "bg-pink-500",    "bg-amber-500",
];

const logoCache: Record<string, string | null> = {};

async function resolveLogo(ticker: string, name: string): Promise<string | null> {
  const key = ticker.replace(".HK", "").toUpperCase();
  if (key in logoCache) return logoCache[key];
  const domainGuess = name.toLowerCase()
    .replace(/[,.]/g, "")
    .replace(/\b(inc|corp|ltd|llc|co|the|plc|incorporated|corporation|technologies|systems|group|holdings)\b/g, "")
    .trim().split(/\s+/)[0] + ".com";
  const candidates = [
    `https://financialmodelingprep.com/image-stock/${key}.png`,
    `https://img.logo.dev/ticker/${key}?token=pk_public`,
    `https://logo.clearbit.com/${domainGuess}`,
  ];
  for (const url of candidates) {
    const ok = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload  = () => resolve(img.naturalWidth > 4 && img.naturalHeight > 4);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    if (ok) { logoCache[key] = url; return url; }
  }
  logoCache[key] = null;
  return null;
}

function MiniLogo({ ticker, name }: { ticker: string; name: string }) {
  const clean    = ticker.replace(".HK", "").toUpperCase();
  const colorIdx = clean.charCodeAt(0) % AVATAR_COLORS.length;
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    clean in logoCache ? (logoCache[clean] ? "loaded" : "failed") : "loading"
  );
  const [url, setUrl] = useState<string | null>(logoCache[clean] ?? null);

  useEffect(() => {
    if (clean in logoCache) {
      setUrl(logoCache[clean]);
      setStatus(logoCache[clean] ? "loaded" : "failed");
      return;
    }
    let cancelled = false;
    resolveLogo(ticker, name).then((r) => {
      if (cancelled) return;
      setUrl(r);
      setStatus(r ? "loaded" : "failed");
    });
    return () => { cancelled = true; };
  }, [clean, ticker, name]);

  if (status === "loading")
    return <div className="w-8 h-8 rounded-xl bg-muted animate-pulse shrink-0" />;

  if (status === "loaded" && url)
    return (
      <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-border shrink-0">
        <img src={url} alt={name} className="w-full h-full object-contain"
          onError={() => setStatus("failed")} />
      </div>
    );

  return (
    <div className={`w-8 h-8 rounded-xl ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0`}>
      <span className="text-white text-[10px] font-bold">{clean.slice(0, 2)}</span>
    </div>
  );
}

// ─── Stock row ────────────────────────────────────────────────────────────────

function StockRow({ stock }: { stock: RailStock }) {
  const isPositive = stock.changePct >= 0;
  const hasPrice   = stock.price > 0;

  return (
    <Link href={`/companies/${encodeURIComponent(stock.ticker)}`}>
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 -mx-2 hover:bg-muted/50 transition-colors cursor-pointer">
        <MiniLogo ticker={stock.ticker} name={stock.name} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{stock.name}</p>
          <p className="text-xs text-muted-foreground">{stock.ticker}</p>
        </div>
        <div className="text-right shrink-0">
          {hasPrice ? (
            <>
              <p className="text-sm font-medium tabular-nums">
                {stock.currency}{stock.price.toFixed(2)}
              </p>
              <p className={`text-xs font-semibold tabular-nums ${
                isPositive ? "text-emerald-600" : "text-red-500"
              }`}>
                {isPositive ? "+" : ""}{stock.changePct.toFixed(2)}%
              </p>
            </>
          ) : (
            <>
              <div className="h-3.5 w-12 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-8 bg-muted rounded animate-pulse ml-auto" />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <div className="w-8 h-8 rounded-xl bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-muted rounded animate-pulse w-28" />
        <div className="h-3 bg-muted rounded animate-pulse w-14" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 bg-muted rounded animate-pulse w-12" />
        <div className="h-3 bg-muted rounded animate-pulse w-8 ml-auto" />
      </div>
    </div>
  );
}

// ─── Watchlist Card ───────────────────────────────────────────────────────────

function WatchlistCard() {
  const [stocks, setStocks]         = useState<RailStock[]>([]);
  const [trending, setTrending]     = useState<RailStock[]>([]);
  const [loading, setLoading]       = useState(true);
  const [isTrending, setIsTrending] = useState(false);

  useEffect(() => {
    // 1. Read from localStorage
    let saved: StoredStock[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    if (saved.length > 0) {
      // User has a watchlist — use it directly (prices already stored)
      setStocks(
        saved.slice(0, 6).map((s) => ({
          ticker:    s.ticker,
          name:      s.name,
          price:     s.price,
          changePct: s.changePct,
          currency:  s.currency ?? "$",
        }))
      );
      setIsTrending(false);
      setLoading(false);
    } else {
      // No watchlist — fetch trending stocks
      setIsTrending(true);
      Promise.all(
        TRENDING_TICKERS.map(async ({ ticker, name }) => {
          const quote = await fetchQuote(ticker);
          return {
            ticker,
            name,
            price:     quote?.price     ?? 0,
            changePct: quote?.changePct ?? 0,
            currency:  "$",
          };
        })
      ).then((results) => {
        setTrending(results);
        setLoading(false);
      });
    }
  }, []);

  const displayStocks = isTrending ? trending : stocks;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-1.5">
              {isTrending && <Flame className="size-4 text-orange-500" />}
              {isTrending ? "Trending" : "Watchlist"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isTrending
                ? "Most watched stocks right now."
                : "Your highest-priority companies."}
            </CardDescription>
          </div>
          <Link
            href="/watchlist"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isTrending ? "Build watchlist" : "View all"}
            <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          displayStocks.map((stock, index) => (
            <div key={stock.ticker}>
              {index > 0 && <Separator className="my-1" />}
              <StockRow stock={stock} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

>>>>>>> ed2551b9e76dbd93361a769310b020ee94562641
export function DashboardRightRail({
  upcomingEvents,
  latestFilings,
}: DashboardRightRailProps) {
  return (
    <aside className="space-y-4">
<<<<<<< HEAD
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-medium">Watchlist</h2>
          <span className="">›</span>
        </div>
      </div>
      <Card className="rounded-lg border border-white/10 bg-[#171717] p-0 shadow-none overflow-hidden">
        <CardContent className="p-0">
          {watchlist.map((item) => (
            <div key={item.ticker}>
              <Link
                href={`/${companySlugFromTicker(item.ticker)}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a]">
                    {/* <img
                src={`https://logo.clearbit.com/${item.domain}`}
                alt={`${item.company} logo`}
                className="h-full w-full object-cover"
              /> */}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium leading-tight text-white">
                      {item.company}
                    </div>
                    <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
                      {item.ticker} · NASDAQ
                    </div>
                  </div>
                </div>

                <div className="ml-3 shrink-0 text-right">
                  <p className="text-sm font-medium leading-tight">
                    {item.price}
                  </p>
                  <p
                    className={`mt-0.5 text-xs   font-medium leading-tight ${
                      item.tone === "up" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {item.change}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
=======

      {/* Watchlist (real) or Trending (fallback) */}
      <WatchlistCard />
>>>>>>> ed2551b9e76dbd93361a769310b020ee94562641

      {/* Upcoming Events — unchanged */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <CardTitle>Upcoming</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((item, index) => (
            <div key={`${item.day}-${item.title}`}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {item.day}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Latest Filings — unchanged */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <CardTitle>Latest filings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestFilings.map((item, index) => (
            <div key={`${item.ticker}-${item.type}`}>
              {index > 0 && <Separator className="mb-4" />}
              <div>
                <p className="text-sm font-medium">
                  {item.company}{" "}
                  <span className="text-muted-foreground">· {item.ticker}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.type} · {item.time}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </aside>
  );
}