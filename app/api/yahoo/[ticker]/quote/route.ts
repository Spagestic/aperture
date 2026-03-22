import { NextRequest, NextResponse } from "next/server";
import { getYahooQuoteLite } from "@/lib/providers/yahoo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).trim();

  try {
    const quote = await getYahooQuoteLite(ticker);
    return NextResponse.json({ quote });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Yahoo quote error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote", message },
      { status: 500 },
    );
  }
}
