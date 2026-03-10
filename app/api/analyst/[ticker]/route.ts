import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  const [recRes, targetRes] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`),
    fetch(`https://finnhub.io/api/v1/stock/price-target?symbol=${ticker}&token=${apiKey}`),
  ]);

  const recommendations = await recRes.json();
  const priceTarget = await targetRes.json();
  console.log("priceTarget:", priceTarget);
  console.log("recommendations:", recommendations); 

  return NextResponse.json({ recommendations, priceTarget });
}