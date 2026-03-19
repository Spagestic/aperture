// /app/api/yahoo/[ticker]/route.ts
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import type { QuoteSummaryModules } from "yahoo-finance2/modules/quoteSummary";
import type { QuoteSummaryResult } from "yahoo-finance2/modules/quoteSummary-iface";

const yahooFinance = new YahooFinance();

const SUMMARY_MODULES = [
  "price",
  "summaryProfile",
  "incomeStatementHistory",
  "balanceSheetHistory",
  "cashflowStatementHistory",
] as const satisfies QuoteSummaryModules[];

export type YahooQuote = {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap?: number;
  trailingPE?: number;
  dividendYield?: number;
};

export type YahooFinancials = {
  incomeStatementHistory?: QuoteSummaryResult["incomeStatementHistory"];
  balanceSheetHistory?: QuoteSummaryResult["balanceSheetHistory"];
  cashflowStatementHistory?: QuoteSummaryResult["cashflowStatementHistory"];
};

export type CompanyData = {
  quote: YahooQuote;
  financials: YahooFinancials;
  profile: { longName: string; shortName: string };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();

  try {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(ticker) as Promise<Quote>,
      yahooFinance.quoteSummary(ticker, {
        modules: [...SUMMARY_MODULES],
      }) as Promise<QuoteSummaryResult>,
    ]);

    const profileSource = summary.price ?? quote;

    const data: CompanyData = {
      quote: {
        symbol: quote.symbol,
        regularMarketPrice: quote.regularMarketPrice ?? 0,
        regularMarketChange: quote.regularMarketChange ?? 0,
        regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
        regularMarketVolume: quote.regularMarketVolume ?? 0,
        marketCap: quote.marketCap,
        trailingPE: quote.trailingPE,
        dividendYield: quote.dividendYield,
      },
      financials: {
        incomeStatementHistory: summary.incomeStatementHistory,
        balanceSheetHistory: summary.balanceSheetHistory,
        cashflowStatementHistory: summary.cashflowStatementHistory,
      },
      profile: {
        longName: profileSource.longName ?? ticker,
        shortName: profileSource.shortName ?? ticker,
      },
    };

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Yahoo Finance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Yahoo", message },
      { status: 500 },
    );
  }
}
