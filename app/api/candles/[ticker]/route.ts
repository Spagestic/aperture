import { getCandles } from "@/lib/finnhub";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const range = req.nextUrl.searchParams.get("range") ?? "1Y";
  const data = await getCandles(ticker, range);
  return Response.json(data);
}