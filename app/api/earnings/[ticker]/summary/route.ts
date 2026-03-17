
import { NextResponse } from 'next/server'

const MISTRAL_KEY = process.env.MISTRAL_API_KEY

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const { quarter, year, epsActual, epsEstimate, revenueActual, date } = await req.json()

  const epsSurprise = epsEstimate
    ? (((epsActual - epsEstimate) / Math.abs(epsEstimate)) * 100).toFixed(2)
    : null

  const prompt = `
You are a financial analyst. For ${ticker} Q${quarter} ${year} earnings (${date}):

Facts:
- EPS: Actual $${epsActual} vs Est $${epsEstimate ?? 'N/A'} ${epsSurprise ? `(${parseFloat(epsSurprise) > 0 ? 'Beat' : 'Missed'} by ${Math.abs(parseFloat(epsSurprise))}%)` : ''}
- Revenue: ${revenueActual ? `$${(revenueActual / 1e9).toFixed(1)}B actual` : 'Not available'}

Return ONLY a JSON array (no markdown, no backticks):
[
  { "title": "string", "body": "string" },
  { "title": "string", "body": "string" },
  { "title": "string", "body": "string" }
]
`.trim()

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
    })

    const json     = await res.json()
    const raw      = json.choices?.[0]?.message?.content ?? '[]'
    const cleaned  = raw.replace(/```json\n?|\n?```/g, '').trim()
    const highlights = JSON.parse(cleaned)

    return NextResponse.json({ highlights })
  } catch (e) {
    console.error('Mistral error:', e)
    return NextResponse.json({ highlights: [] }, { status: 500 })
  }
}