import { NextResponse } from "next/server";
import { getDashboardMarketStrip } from "@/lib/providers/yahoo";

export async function GET() {
  const marketStrip = await getDashboardMarketStrip();
  return NextResponse.json(marketStrip);
}
