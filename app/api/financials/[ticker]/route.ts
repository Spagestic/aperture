import { NextResponse } from 'next/server'

const FINNHUB_KEY = process.env.FINNHUB_API_KEY

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params
  const { searchParams } = new URL(request.url)
  const freq = searchParams.get('freq') || 'annual'

  try {
    const [metricsRes, financialsRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/financials-reported?symbol=${ticker}&freq=${freq}&token=${FINNHUB_KEY}`
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
