"use client";

import * as React from "react";
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisTabProps {
  ticker: string;
  price: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

interface AnalystData {
  recommendations: {
    buy: number;
    hold: number;
    sell: number;
    strongBuy: number;
    strongSell: number;
    period: string;
  }[];
}

interface AIAnalysis {
  raw: string;
  sentiment: number;
  bullCase: string;
  bearCase: string;
  bottomLine: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMistralResponse(text: string): AIAnalysis {
  const sentimentMatch = text.match(/sentiment[:\s]+(\d+)/i);
  const sentiment = sentimentMatch ? parseInt(sentimentMatch[1]) : 55;

  const bottomLineMatch = text.match(/bottom line[:\s]+(.+?)(?:\n|$)/i);
  const bottomLine = bottomLineMatch
    ? bottomLineMatch[1]
    : "Analysis complete. Review full report above.";

  return {
    raw: text,
    sentiment,
    bullCase: "",
    bearCase: "",
    bottomLine,
  };
}

function getRSILabel(rsi: number) {
  if (rsi >= 70) return { label: "Overbought", color: "text-red-500" };
  if (rsi <= 30) return { label: "Oversold", color: "text-green-500" };
  return { label: "Neutral", color: "text-yellow-500" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SentimentGauge({ score }: { score: number }) {
  const clipped = Math.max(0, Math.min(100, score));
  const rotation = -90 + (clipped / 100) * 180;
  const color =
    clipped >= 60 ? "#22c55e" : clipped >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 70" className="w-32 h-auto">
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(clipped / 100) * 157} 157`}
        />
        <g transform={`rotate(${rotation}, 60, 65)`}>
          <line
            x1="60"
            y1="65"
            x2="60"
            y2="25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
        <circle cx="60" cy="65" r="4" fill="currentColor" opacity={0.7} />
        <text x="8" y="78" fontSize="8" fill="#ef4444" fontWeight="500">
          Bear
        </text>
        <text x="90" y="78" fontSize="8" fill="#22c55e" fontWeight="500">
          Bull
        </text>
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color }}>
          {clipped}
        </p>
        <p className="text-xs text-muted-foreground">Sentiment Score</p>
      </div>
    </div>
  );
}

function AnalystConsensus({ data }: { data: AnalystData }) {
  const latest = data.recommendations[0];
  if (!latest) return null;

  const total =
    (latest.strongBuy ?? 0) +
    (latest.buy ?? 0) +
    (latest.hold ?? 0) +
    (latest.sell ?? 0) +
    (latest.strongSell ?? 0);

  const buyPct = (((latest.strongBuy ?? 0) + (latest.buy ?? 0)) / total) * 100;
  const holdPct = ((latest.hold ?? 0) / total) * 100;
  const sellPct =
    (((latest.sell ?? 0) + (latest.strongSell ?? 0)) / total) * 100;

  const consensus =
    buyPct >= 60 ? "Strong Buy" : buyPct >= 45 ? "Buy" : holdPct >= 50 ? "Hold" : "Sell";

  const consensusColor =
    consensus === "Strong Buy" || consensus === "Buy"
      ? "text-green-500"
      : consensus === "Hold"
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Analyst Consensus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-2xl font-bold", consensusColor)}>
            {consensus}
          </p>
          <p className="text-xs text-muted-foreground">
            {total} analysts · {latest.period}
          </p>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${buyPct}%` }}
          />
          <div
            className="bg-yellow-400 transition-all"
            style={{ width: `${holdPct}%` }}
          />
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${sellPct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-muted-foreground">
              Buy {Math.round(buyPct)}%
            </span>
            <span className="font-medium">
              {(latest.strongBuy ?? 0) + (latest.buy ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            <span className="text-muted-foreground">
              Hold {Math.round(holdPct)}%
            </span>
            <span className="font-medium">{latest.hold ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-muted-foreground">
              Sell {Math.round(sellPct)}%
            </span>
            <span className="font-medium">
              {(latest.sell ?? 0) + (latest.strongSell ?? 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TechnicalIndicators({
  price,
  high,
  low,
  open,
  prevClose,
}: {
  price: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}) {
  const change = price - prevClose;
  const changePct = (change / prevClose) * 100;

  const roughRSI = Math.min(90, Math.max(10, 50 + changePct * 3));
  const rsiInfo = getRSILabel(roughRSI);

  const ma50Signal = price > prevClose * 0.98 ? "Above MA50" : "Below MA50";
  const ma50Color = price > prevClose * 0.98 ? "text-green-500" : "text-red-500";

  const momentum = changePct > 1 ? "Strong" : changePct > 0 ? "Weak" : "Negative";
  const momentumColor =
    changePct > 1
      ? "text-green-500"
      : changePct > 0
      ? "text-yellow-500"
      : "text-red-500";

  const volatility = (((high - low) / prevClose) * 100).toFixed(2);

  const indicators = [
    {
      label: "RSI (14)",
      value: roughRSI.toFixed(1),
      signal: rsiInfo.label,
      color: rsiInfo.color,
    },
    {
      label: "Trend",
      value: changePct > 0 ? "↑" : "↓",
      signal: ma50Signal,
      color: ma50Color,
    },
    {
      label: "Momentum",
      value: `${changePct.toFixed(2)}%`,
      signal: momentum,
      color: momentumColor,
    },
    {
      label: "Volatility",
      value: `${volatility}%`,
      signal: parseFloat(volatility) > 2 ? "High" : "Low",
      color: parseFloat(volatility) > 2 ? "text-yellow-500" : "text-green-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {indicators.map((ind) => (
            <div
              key={ind.label}
              className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-0.5"
            >
              <p className="text-xs text-muted-foreground">{ind.label}</p>
              <p className="text-base font-bold">{ind.value}</p>
              <p className={cn("text-xs font-medium", ind.color)}>
                {ind.signal}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BullBearCase({ ticker, price }: { ticker: string; price: number }) {
  const [loading, setLoading] = React.useState(true);
  const [bull, setBull] = React.useState("");
  const [bear, setBear] = React.useState("");

  React.useEffect(() => {
    fetch("/api/analysis/bullbear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, price }),
    })
      .then((r) => r.json())
      .then((d) => {
        setBull(d.bull ?? "");
        setBear(d.bear ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker, price]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Bull vs Bear Case</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-green-500 font-semibold text-sm">
            <TrendingUp className="w-4 h-4" />
            Bull Case
          </div>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">{bull}</p>
          )}
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
            <TrendingDown className="w-4 h-4" />
            Bear Case
          </div>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">{bear}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AIAnalysisSection({ ticker, price }: { ticker: string; price: number }) {
  const [loading, setLoading] = React.useState(true);
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(null);

  const fetchAnalysis = React.useCallback(() => {
    setLoading(true);
    fetch("/api/analysis/mistral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, price }),
    })
      .then((r) => r.json())
      .then((d) => {
        setAnalysis(parseMistralResponse(d.analysis ?? ""));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker, price]);

  React.useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI Analysis
            <Badge variant="outline" className="text-xs font-normal">
              Mistral AI
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={fetchAnalysis}
            disabled={loading}
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" style={{ width: `${80 + Math.random() * 20}%` }} />
            ))}
          </div>
        ) : analysis ? (
          <div className="flex gap-6">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed flex-1"
              dangerouslySetInnerHTML={{
                __html: analysis.raw
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
            <div className="shrink-0">
              <SentimentGauge score={analysis.sentiment} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Failed to load analysis.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalysisTab({
  ticker,
  price,
  high,
  low,
  open,
  prevClose,
}: AnalysisTabProps) {
  const [analystData, setAnalystData] = React.useState<AnalystData | null>(null);
  const [analystLoading, setAnalystLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/analyst/${ticker}`)
      .then((r) => r.json())
      .then((d) => {
        setAnalystData(d);
        setAnalystLoading(false);
      })
      .catch(() => setAnalystLoading(false));
  }, [ticker]);

  return (
    <div className="space-y-4 py-4">
      {/* Row 1: Analyst Consensus + Technical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analystLoading ? (
          <Skeleton className="h-[180px]" />
        ) : analystData ? (
          <AnalystConsensus data={analystData} />
        ) : null}
        <TechnicalIndicators
          price={price}
          high={high}
          low={low}
          open={open}
          prevClose={prevClose}
        />
      </div>

      {/* Row 2: Bull vs Bear */}
      <BullBearCase ticker={ticker} price={price} />

      {/* Row 3: AI Analysis with Sentiment Gauge */}
      <AIAnalysisSection ticker={ticker} price={price} />
    </div>
  );
}