import { NextResponse } from 'next/server'

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params

  try {
    const today  = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [epsRes, upcomingRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${FINNHUB_KEY}`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${today}&to=${future}&symbol=${ticker}&token=${FINNHUB_KEY}`,
        { next: { revalidate: 3600 } }
      ),
    ])

    const epsData      = await epsRes.json()
    const upcomingData = await upcomingRes.json()

    const historical = (Array.isArray(epsData) ? epsData : []).map((e: any) => ({
      date:            e.period,
      quarter:         e.quarter,
      year:            e.year,
      epsActual:       e.actual,
      epsEstimate:     e.estimate,
      revenueActual:   null,
      revenueEstimate: null,
    }))

    const upcoming = (upcomingData.earningsCalendar ?? []).map((e: any) => ({
      date:            e.date,
      quarter:         e.quarter,
      year:            e.year,
      epsActual:       null,
      epsEstimate:     e.epsEstimate,
      revenueActual:   null,
      revenueEstimate: e.revenueEstimate,
    }))

    const seen = new Set<string>()
    const all = [...upcoming, ...historical]
      .filter(e => {
        if (seen.has(e.date)) return false
        seen.add(e.date)
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ earnings: all })
  } catch (e) {
    console.error('Earnings fetch error:', e)
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 })
  }
}