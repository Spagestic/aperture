"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Star, SlidersHorizontal, Loader2, X, RefreshCw } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WatchlistStock {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  prevClose: number;
  changePct: number;
  currency: string;
}

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

const STORAGE_KEY = "watchlist_stocks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Finnhub uses different formats for HK stocks: "1211.HK" → "1211.HK" (correct)
// But the company page route needs encoding for the dot
function tickerToPath(ticker: string) {
  return encodeURIComponent(ticker);
}

function currencyForExchange(exchange: string, ticker: string): string {
  if (ticker.endsWith(".HK")) return "HK$";
  if (exchange === "LSE")     return "£";
  if (["EPA", "ETR", "BIT", "BME"].includes(exchange)) return "€";
  return "$";
}

// ─── Fetch live quote from Finnhub ────────────────────────────────────────────

async function fetchQuote(ticker: string): Promise<{ price: number; prevClose: number; changePct: number } | null> {
  try {
    const key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Finnhub quote: c = current, pc = prev close
    if (!data.c || data.c === 0) return null;
    const changePct = data.pc > 0 ? ((data.c - data.pc) / data.pc) * 100 : 0;
    return { price: data.c, prevClose: data.pc, changePct };
  } catch {
    return null;
  }
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500",
  "bg-red-500",  "bg-cyan-500",   "bg-pink-500",    "bg-amber-500",
  "bg-teal-500", "bg-indigo-500",
];

const logoCache: Record<string, string | null> = {};

async function resolveLogo(ticker: string, name: string): Promise<string | null> {
  const key = ticker.replace(".HK", "").toUpperCase();
  if (key in logoCache) return logoCache[key];

  const domainGuess =
    name
      .toLowerCase()
      .replace(/[,.]/g, "")
      .replace(/\b(inc|corp|ltd|llc|co|the|plc|sa|ag|nv|incorporated|corporation|technologies|technology|systems|group|holdings|international)\b/g, "")
      .trim()
      .split(/\s+/)[0] + ".com";

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

function CompanyLogo({ ticker, name, size = "md" }: { ticker: string; name: string; size?: "sm" | "md" }) {
  const clean    = ticker.replace(".HK", "").toUpperCase();
  const colorIdx = clean.charCodeAt(0) % AVATAR_COLORS.length;
  const dim      = size === "sm" ? "w-9 h-9" : "w-12 h-12";

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
    resolveLogo(ticker, name).then((resolved) => {
      if (cancelled) return;
      setUrl(resolved);
      setStatus(resolved ? "loaded" : "failed");
    });
    return () => { cancelled = true; };
  }, [clean, ticker, name]);

  if (status === "loading")
    return <div className={`${dim} rounded-2xl bg-gray-200 animate-pulse shrink-0`} />;

  if (status === "loaded" && url)
    return (
      <div className={`${dim} rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm shrink-0`}>
        <img src={url} alt={name} className="w-full h-full object-contain"
          onError={() => setStatus("failed")} />
      </div>
    );

  return (
    <div className={`${dim} rounded-2xl ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white text-sm font-bold">{clean.slice(0, 2)}</span>
    </div>
  );
}

// ─── Stock Row ────────────────────────────────────────────────────────────────

function StockRow({ stock, onRemove }: { stock: WatchlistStock; onRemove: (id: string) => void }) {
  const [starred, setStarred] = useState(false);
  const isPositive = stock.changePct >= 0;
  const hasPrice   = stock.price > 0;

  return (
    <Link href={`/companies/${tickerToPath(stock.ticker)}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <CompanyLogo ticker={stock.ticker} name={stock.name} />

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 truncate">{stock.name}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {stock.ticker} · {stock.exchange}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[15px] font-semibold text-gray-900 tabular-nums">
            {hasPrice ? `${stock.currency}${stock.price.toFixed(2)}` : (
              <span className="inline-block w-16 h-4 bg-gray-100 rounded animate-pulse" />
            )}
          </p>
          <p className={`text-sm font-semibold mt-0.5 tabular-nums ${
            !hasPrice ? "text-gray-300" : isPositive ? "text-emerald-600" : "text-red-500"
          }`}>
            {hasPrice
              ? `${isPositive ? "+" : ""}${stock.changePct.toFixed(2)}%`
              : "—"}
          </p>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); setStarred((s) => !s); }}
          onContextMenu={(e) => { e.preventDefault(); onRemove(stock.id); }}
          title="Favourite · right-click to remove"
          className="shrink-0 text-gray-300 hover:text-amber-400 transition-colors"
        >
          <Star size={19} strokeWidth={1.5}
            className={starred ? "fill-amber-400 text-amber-400" : ""} />
        </button>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <Star size={20} className="text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">Your watchlist is empty</p>
      <p className="text-xs text-gray-400 mb-5 max-w-[200px]">
        Search any stock, ETF, or index to start tracking it.
      </p>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
        <Plus size={13} strokeWidth={2.5} /> Add your first stock
      </button>
    </div>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────

function SearchModal({ existingTickers, onAdd, onClose }: {
  existingTickers: string[];
  onAdd: (s: WatchlistStock) => void;
  onClose: () => void;
}) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding]   = useState<string | null>(null);
  const [error, setError]     = useState("");
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 1) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setError("");
    debounceRef.current = setTimeout(async () => {
      try {
        const key  = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
        const res  = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q.trim())}&token=${key}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const mapped: SearchResult[] = (data.result ?? [])
          .filter((i: { symbol: string; description: string }) => i.symbol && i.description)
          .map((i: { symbol: string; description: string; displaySymbol: string; type: string }) => ({
            ticker:   i.displaySymbol ?? i.symbol,
            name:     i.description,
            exchange: i.type ?? "",
          }));
        setResults(mapped);
      } catch {
        setError("Search failed — please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    doSearch(query);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const handleAdd = async (r: SearchResult) => {
    setAdding(r.ticker);
    // Fetch live quote immediately so price shows right away
    const quote = await fetchQuote(r.ticker);
    const currency = currencyForExchange(r.exchange, r.ticker);
    onAdd({
      id:        crypto.randomUUID(),
      ticker:    r.ticker,
      name:      r.name,
      exchange:  r.exchange,
      currency,
      price:     quote?.price     ?? 0,
      prevClose: quote?.prevClose ?? 0,
      changePct: quote?.changePct ?? 0,
    });
    setAdding(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="p-4">
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 focus-within:border-gray-400 rounded-xl px-3 py-2.5 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any stock, ETF, index..."
              className="bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none flex-1" />
            {query.length > 0 && (
              <button onClick={() => setQuery("")} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto border-t border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
              <Loader2 size={15} className="animate-spin" />
              <span className="text-xs">Searching...</span>
            </div>
          ) : error ? (
            <p className="text-center text-xs text-red-400 py-12">{error}</p>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {results.map((r) => {
                const added    = existingTickers.includes(r.ticker);
                const isAdding = adding === r.ticker;
                return (
                  <button key={r.ticker} onClick={() => !added && !isAdding && handleAdd(r)}
                    disabled={added || isAdding}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      added ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}>
                    <CompanyLogo ticker={r.ticker} name={r.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.ticker} · {r.exchange}</p>
                    </div>
                    {added ? (
                      <span className="text-xs text-gray-400 font-medium shrink-0">Added</span>
                    ) : isAdding ? (
                      <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" />
                    ) : (
                      <Plus size={15} className="text-gray-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 py-12">
              {query.length > 0 ? `No results for "${query}"` : "Start typing to search any stock, ETF, or index..."}
            </p>
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WatchlistPage() {
  const [stocks, setStocks]         = useState<WatchlistStock[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hydrated, setHydrated]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStocks(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Save to localStorage whenever stocks change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
    } catch {}
  }, [stocks, hydrated]);

  // Refresh all prices
  const refreshPrices = async () => {
    if (stocks.length === 0) return;
    setRefreshing(true);
    const updated = await Promise.all(
      stocks.map(async (s) => {
        const quote = await fetchQuote(s.ticker);
        if (!quote) return s;
        return { ...s, price: quote.price, prevClose: quote.prevClose, changePct: quote.changePct };
      })
    );
    setStocks(updated);
    setRefreshing(false);
  };

  const remove = (id: string) =>
    setStocks((prev) => prev.filter((s) => s.id !== id));

  const add = (s: WatchlistStock) =>
    setStocks((prev) => prev.find((x) => x.ticker === s.ticker) ? prev : [...prev, s]);

  const gainers = stocks.filter((s) => s.changePct > 0).length;
  const losers  = stocks.filter((s) => s.changePct < 0).length;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-lg mx-auto py-8 px-4">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Watchlist</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Track your highest-priority companies in one place.
            </p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {stocks.length > 0 && (
              <button onClick={refreshPrices}
                title="Refresh prices"
                className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
                <RefreshCw size={16} strokeWidth={1.8}
                  className={refreshing ? "animate-spin" : ""} />
              </button>
            )}
            <button className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
              <SlidersHorizontal size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Stats pills */}
        {stocks.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-600 font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {gainers} gaining
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-600 font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {losers} falling
            </span>
            <span className="bg-white border border-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-600 font-medium shadow-sm">
              {stocks.length} total
            </span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!hydrated ? (
            // Skeleton while loading from localStorage
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-16" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : stocks.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {stocks.map((s) => (
                  <StockRow key={s.id} stock={s} onRemove={remove} />
                ))}
              </div>
              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-2 px-5 py-4 border-t border-dashed border-gray-200 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={13} /> Add company
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-5">
          Prices delayed up to 15 minutes
        </p>
      </div>

      {showModal && (
        <SearchModal
          existingTickers={stocks.map((s) => s.ticker)}
          onAdd={add}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}