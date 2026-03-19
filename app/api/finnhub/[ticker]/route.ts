import { NextRequest, NextResponse } from "next/server";
import { getFinnhubCompanyData } from "@/lib/providers/finnhub";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  void request;

  const { ticker: rawTicker } = await params;

  if (!rawTicker?.trim()) {
    return NextResponse.json(
      { error: "Ticker parameter is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getFinnhubCompanyData(rawTicker);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Finnhub error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Finnhub", message },
      { status: 500 },
    );
  }
}
