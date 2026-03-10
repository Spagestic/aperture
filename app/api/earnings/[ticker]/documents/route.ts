import { NextResponse } from 'next/server'

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/filings?symbol=${ticker}&token=${FINNHUB_KEY}`,
      { next: { revalidate: 3600 } }
    )

    const text = await res.text()

    if (text.startsWith('<!')) {
      return NextResponse.json({ filings: [] })
    }

    const data = JSON.parse(text)
    return NextResponse.json({ filings: (data ?? []).slice(0, 10) })
  } catch (e) {
    console.error('Documents error:', e)
    return NextResponse.json({ filings: [] }, { status: 500 })
  }
}