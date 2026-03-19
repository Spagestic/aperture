import { NextRequest, NextResponse } from "next/server";
import { getFmpCompanyData } from "@/lib/providers/fmp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();

  try {
    const data = await getFmpCompanyData(ticker);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("FMP API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from FMP", message },
      { status: 500 },
    );
  }
}
