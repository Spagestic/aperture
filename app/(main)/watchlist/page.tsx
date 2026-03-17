"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Star, SlidersHorizontal, Loader2, X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
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
  type: string;
}

const STORAGE_KEY = "watchlist_stocks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Clean up exchange display: remove long names, show short codes only
function formatExchange(exchange: string, ticker: string): string {
  if (ticker.endsWith(".HK")) return "HKEX";
  if (ticker.endsWith(".L"))  return "LSE";
  if (ticker.endsWith(".T"))  return "TSE";
  // Strip verbose names like "NEW YORK STOCK EXCHANGE, INC." → "NYSE"
  if (exchange.toLowerCase().includes("new york")) return "NYSE";
  if (exchange.toLowerCase().includes("nasdaq"))   return "NASDAQ";
  if (exchange.toLowerCase().includes("london"))   return "LSE";
  if (exchange.toLowerCase().includes("tokyo"))    return "TSE";
  if (exchange.toLowerCase().includes("hong kong")) return "HKEX";
  // For Finnhub type field values like "Common Stock" — show exchange from ticker
  if (["Common Stock", "ETP", "DR", "Crypto"].includes(exchange)) return "";
  return exchange.toUpperCase().slice(0, 6);
}

function formatCurrency(ticker: string): string {
  if (ticker.endsWith(".HK")) return "HK$";
  if (ticker.endsWith(".L"))  return "£";
  if (ticker.endsWith(".PA") || ticker.endsWith(".DE") || ticker.endsWith(".MI")) return "€";
  return "$";
}

function tickerToPath(ticker: string) {
  return encodeURIComponent(ticker);
}

// ─── Finnhub quote fetch ──────────────────────────────────────────────────────

async function fetchQuote(ticker: string): Promise<{ price: number; prevClose: number; changePct: number } | null> {
  try {
    const key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.c || d.c === 0) return null;
    return {
      price:     d.c,
      prevClose: d.pc,
      changePct: d.pc > 0 ? ((d.c - d.pc) / d.pc) * 100 : 0,
    };
  } catch { return null; }
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500",
  "bg-red-500",  "bg-cyan-600",   "bg-pink-500",    "bg-amber-500",
  "bg-teal-500", "bg-indigo-500",
];

const logoCache: Record<string, string | null> = {};

async function resolveLogo(ticker: string, name: string): Promise<string | null> {
  const key = ticker.replace(/\.[A-Z]+$/, "").toUpperCase();
  if (key in logoCache) return logoCache[key];
  const domainGuess = name.toLowerCase()
    .replace(/[,.]/g, "")
    .replace(/\b(inc|corp|ltd|llc|co|the|plc|incorporated|corporation|technologies|technology|systems|group|holdings|international)\b/g, "")
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

function CompanyLogo({ ticker, name, size = "md" }: { ticker: string; name: string; size?: "sm" | "md" }) {
  const clean    = ticker.replace(/\.[A-Z]+$/, "").toUpperCase();
  const colorIdx = clean.charCodeAt(0) % AVATAR_COLORS.length;
  const dim      = size === "sm" ? "w-9 h-9 text-[10px]" : "w-11 h-11 text-xs";

  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    clean in logoCache ? (logoCache[clean] ? "loaded" : "failed") : "loading"
  );
  const [url, setUrl] = useState<string | null>(logoCache[clean] ?? null);

  useEffect(() => {
    if (clean in logoCache) { setUrl(logoCache[clean]); setStatus(logoCache[clean] ? "loaded" : "failed"); return; }
    let cancelled = false;
    resolveLogo(ticker, name).then((r) => { if (cancelled) return; setUrl(r); setStatus(r ? "loaded" : "failed"); });
    return () => { cancelled = true; };
  }, [clean, ticker, name]);

  if (status === "loading")
    return <div className={`${dim.split(" ")[0]} ${dim.split(" ")[1] ?? ""} rounded-2xl bg-gray-100 animate-pulse shrink-0`} style={{ width: size === "sm" ? 36 : 44, height: size === "sm" ? 36 : 44, borderRadius: 14 }} />;
  if (status === "loaded" && url)
    return (
      <div style={{ width: size === "sm" ? 36 : 44, height: size === "sm" ? 36 : 44, borderRadius: 14 }}
        className="overflow-hidden bg-white border border-gray-100 shadow-sm shrink-0 flex items-center justify-center">
        <img src={url} alt={name} className="w-full h-full object-contain" onError={() => setStatus("failed")} />
      </div>
    );
  return (
    <div style={{ width: size === "sm" ? 36 : 44, height: size === "sm" ? 36 : 44, borderRadius: 14 }}
      className={`${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className={`text-white font-bold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>{clean.slice(0, 2)}</span>
    </div>
  );
}

// ─── Stock Row ────────────────────────────────────────────────────────────────

function StockRow({ stock, onRemove }: { stock: WatchlistStock; onRemove: (id: string) => void }) {
  const [starred, setStarred] = useState(false);
  const isPositive = stock.changePct >= 0;
  const hasPrice   = stock.price > 0;
  const exchange   = formatExchange(stock.exchange, stock.ticker);

  return (
    <Link href={`/companies/${tickerToPath(stock.ticker)}`}>
      <div className="group flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer">
        <CompanyLogo ticker={stock.ticker} name={stock.name} />

        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] font-semibold text-gray-900 truncate leading-snug">{stock.name}</p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {stock.ticker}{exchange ? ` · ${exchange}` : ""}
          </p>
        </div>

        <div className="text-right shrink-0 min-w-[80px]">
          {hasPrice ? (
            <>
              <p className="text-[14.5px] font-semibold text-gray-900 tabular-nums">
                {stock.currency}{stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center justify-end gap-0.5 mt-0.5 text-[11px] font-semibold tabular-nums ${
                isPositive ? "text-emerald-600" : "text-red-500"
              }`}>
                {isPositive ? <TrendingUp size={10} strokeWidth={2.5} /> : <TrendingDown size={10} strokeWidth={2.5} />}
                {isPositive ? "+" : ""}{stock.changePct.toFixed(2)}%
              </div>
            </>
          ) : (
            <>
              <div className="h-4 w-16 bg-gray-100 rounded-md animate-pulse mb-1.5 ml-auto" />
              <div className="h-3 w-10 bg-gray-100 rounded-md animate-pulse ml-auto" />
            </>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); setStarred((s) => !s); }}
          onContextMenu={(e) => { e.preventDefault(); onRemove(stock.id); }}
          title="Star · right-click to remove"
          className="shrink-0 p-0.5 text-gray-200 hover:text-amber-400 transition-colors"
        >
          <Star size={17} strokeWidth={1.5} className={starred ? "fill-amber-400 text-amber-400" : ""} />
        </button>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Star size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-800">Your watchlist is empty</p>
      <p className="text-xs text-gray-400 mt-1.5 mb-6 max-w-[200px] leading-relaxed">
        Search any stock, ETF, or index worldwide to start tracking it.
      </p>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
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
    setLoading(true); setError("");
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
            type:     i.type ?? "",
          }));
        setResults(mapped);
      } catch {
        setError("Search failed — please try again.");
        setResults([]);
      } finally { setLoading(false); }
    }, 300);
  }, []);

  useEffect(() => {
    doSearch(query);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const handleAdd = async (r: SearchResult) => {
    setAdding(r.ticker);
    const quote    = await fetchQuote(r.ticker);
    const currency = formatCurrency(r.ticker);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
        <div className="p-4 pb-3">
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

        <div className="max-h-[340px] overflow-y-auto border-t border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
              <Loader2 size={15} className="animate-spin" />
              <span className="text-xs font-medium">Searching...</span>
            </div>
          ) : error ? (
            <p className="text-center text-xs text-red-400 py-12">{error}</p>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-50 py-1">
              {results.map((r) => {
                const added    = existingTickers.includes(r.ticker);
                const isAdding = adding === r.ticker;
                const exch     = formatExchange(r.exchange, r.ticker);
                return (
                  <button key={r.ticker} onClick={() => !added && !isAdding && handleAdd(r)}
                    disabled={added || !!isAdding}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      added ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}>
                    <CompanyLogo ticker={r.ticker} name={r.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {r.ticker}{exch ? ` · ${exch}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {added ? (
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Added</span>
                      ) : isAdding ? (
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <Plus size={13} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Search size={20} className="text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">
                {query.length > 0 ? `No results for "${query}"` : "Start typing to search any stock, ETF, or index..."}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-50 last:border-0">
          <div className="w-11 h-11 rounded-2xl bg-gray-100 animate-pulse shrink-0" style={{ borderRadius: 14 }} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded-lg animate-pulse w-32" />
            <div className="h-2.5 bg-gray-100 rounded-lg animate-pulse w-20" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-3.5 bg-gray-100 rounded-lg animate-pulse w-16 ml-auto" />
            <div className="h-2.5 bg-gray-100 rounded-lg animate-pulse w-10 ml-auto" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WatchlistPage() {
  const [stocks, setStocks]         = useState<WatchlistStock[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hydrated, setHydrated]     = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStocks(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks)); } catch {}
  }, [stocks, hydrated]);

  const refreshPrices = async () => {
    if (stocks.length === 0 || refreshing) return;
    setRefreshing(true);
    const updated = await Promise.all(
      stocks.map(async (s) => {
        const q = await fetchQuote(s.ticker);
        return q ? { ...s, price: q.price, prevClose: q.prevClose, changePct: q.changePct } : s;
      })
    );
    setStocks(updated);
    setRefreshing(false);
  };

  const remove = (id: string) => setStocks((p) => p.filter((s) => s.id !== id));
  const add    = (s: WatchlistStock) => setStocks((p) => p.find((x) => x.ticker === s.ticker) ? p : [...p, s]);

  const gainers = stocks.filter((s) => s.changePct > 0).length;
  const losers  = stocks.filter((s) => s.changePct < 0).length;

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-xl mx-auto py-10 px-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Watchlist</h1>
            <p className="text-sm text-gray-400 mt-1">
              Track your highest-priority companies in one place.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {stocks.length > 0 && (
              <button onClick={refreshPrices} title="Refresh prices"
                className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors shadow-sm hover:shadow">
                <RefreshCw size={15} strokeWidth={2} className={refreshing ? "animate-spin" : ""} />
              </button>
            )}
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors ml-1 shadow-sm">
              <Plus size={13} strokeWidth={2.5} /> Add
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {hydrated && stocks.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600 font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {gainers} gaining
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600 font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {losers} falling
            </div>
            <div className="bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600 font-medium shadow-sm">
              {stocks.length} total
            </div>
          </div>
        )}

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!hydrated ? (
            <SkeletonRows />
          ) : stocks.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <>
              <div className="divide-y divide-gray-100/80">
                {stocks.map((s) => (
                  <StockRow key={s.id} stock={s} onRemove={remove} />
                ))}
              </div>
              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3.5 border-t border-dashed border-gray-200 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50/80 transition-colors font-medium">
                <Plus size={12} strokeWidth={2.5} /> Add company
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-5 font-medium">
          Prices delayed up to 15 minutes · Right-click ☆ to remove
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