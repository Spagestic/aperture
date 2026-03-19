import { NextRequest, NextResponse } from "next/server";
import { getYahooCompanyData } from "@/lib/providers/yahoo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();

  try {
    const data = await getYahooCompanyData(ticker);
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
