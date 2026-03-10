import { NextResponse } from 'next/server'

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const { searchParams } = new URL(request.url)
  const freq = searchParams.get('freq') || 'annual'

  try {
    const [metricsRes, financialsRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_KEY}`,
        { next: { revalidate: 3600 } } // ✅ cache 1 hour
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/financials-reported?symbol=${ticker}&freq=${freq}&token=${FINNHUB_KEY}`,
        { next: { revalidate: 86400 } } // ✅ cache 24 hours (filings don't change often)
      ),
    ])

    const [metrics, financials] = await Promise.all([
      metricsRes.json(),
      financialsRes.json(),
    ])

    return NextResponse.json({ metrics, financials })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch financials' },
      { status: 500 }
    )
  }
}