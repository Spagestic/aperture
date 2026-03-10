'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Calendar, Loader2, FileText, ExternalLink } from 'lucide-react'

interface EarningsEntry {
  date: string
  quarter: number
  year: number
  epsActual: number | null
  epsEstimate: number | null
  revenueActual: number | null
  revenueEstimate: number | null
}

interface Highlight { title: string; body: string }
interface Filing {
  form: string
  filedDate: string
  reportUrl: string
}

interface Props { ticker: string }

function surprise(actual: number | null, estimate: number | null) {
  if (actual == null || estimate == null || estimate === 0) return null
  return ((actual - estimate) / Math.abs(estimate)) * 100
}

function fmtRevenue(n: number | null) {
  if (n == null) return '—'
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toLocaleString()}`
}

function fmtEps(n: number | null) {
  return n != null ? `$${n.toFixed(2)}` : '—'
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function SurpriseBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-muted-foreground text-xs">—</span>
  const beat = pct >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      beat ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {beat ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {beat ? 'Beat' : 'Missed'} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-4/5" />
        </div>
      ))}
    </div>
  )
}

export default function Earnings({ ticker }: Props) {
  const [earnings,    setEarnings]    = useState<EarningsEntry[]>([])
  const [selected,    setSelected]    = useState<EarningsEntry | null>(null)
  const [highlights,  setHighlights]  = useState<Highlight[]>([])
  const [filings,     setFilings]     = useState<Filing[]>([])
  const [activeTab,   setActiveTab]   = useState<'highlights' | 'documents'>('highlights')
  const [loading,     setLoading]     = useState(true)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [docsLoading, setDocsLoading] = useState(false)

  // Fetch earnings list
  useEffect(() => {
    setLoading(true)
    fetch(`/api/earnings/${ticker}`)
      .then(r => r.json())
      .then(d => {
        const list: EarningsEntry[] = d.earnings ?? []
        setEarnings(list)
        const past = list.find(e => e.epsActual != null)
        setSelected(past ?? list[0] ?? null)
      })
      .finally(() => setLoading(false))
  }, [ticker])

  // Fetch AI highlights
  const fetchHighlights = useCallback(async (entry: EarningsEntry) => {
    if (!entry.epsActual) return
    setAiLoading(true)
    setHighlights([])
    try {
      const res  = await fetch(`/api/earnings/${ticker}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      const data = await res.json()
      setHighlights(data.highlights ?? [])
    } finally {
      setAiLoading(false)
    }
  }, [ticker])

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setDocsLoading(true)
    try {
      const res  = await fetch(`/api/earnings/${ticker}/documents`)
      const data = await res.json()
      setFilings(data.filings ?? [])
    } finally {
      setDocsLoading(false)
    }
  }, [ticker])

  useEffect(() => {
    if (selected) fetchHighlights(selected)
  }, [selected]) // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'documents' && filings.length === 0) fetchDocuments()
  }, [activeTab]) // eslint-disable-line

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )

  if (!selected) return (
    <p className="text-muted-foreground text-sm p-4">No earnings data available.</p>
  )

  const epsPct     = surprise(selected.epsActual,     selected.epsEstimate)
  const revPct     = surprise(selected.revenueActual, selected.revenueEstimate)
  const isUpcoming = selected.epsActual == null
  const days       = daysUntil(selected.date)

  return (
    <div className="space-y-4 p-4">

      {/* Quarter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {earnings.map(e => {
          const pct    = surprise(e.epsActual, e.epsEstimate)
          const future = e.epsActual == null
          const active = selected.date === e.date
          const d      = daysUntil(e.date)

          return (
            <button
              key={e.date}
              onClick={() => setSelected(e)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border hover:border-primary/50 text-foreground'
              }`}
            >
              Q{e.quarter} {e.year}
              {future ? (
                <span className="ml-1.5 text-muted-foreground">
                  {d > 0 ? `in ${d}d` : 'today'}
                </span>
              ) : pct != null ? (
                <span className={`ml-1.5 ${pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Earnings call header */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold text-base">
          {ticker} {selected.year} Q{selected.quarter} Earnings Call
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(selected.date).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          })}
          {isUpcoming && days > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              in {days} days
            </span>
          )}
        </p>

        {!isUpcoming && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {fmtRevenue(selected.revenueEstimate)}
                  <span className="text-xs ml-1">(est.)</span>
                </span>
                <span className="font-semibold">{fmtRevenue(selected.revenueActual)}</span>
              </div>
              <SurpriseBadge pct={revPct} />
            </div>
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">EPS (Adj.)</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {fmtEps(selected.epsEstimate)}
                  <span className="text-xs ml-1">(est.)</span>
                </span>
                <span className="font-semibold">{fmtEps(selected.epsActual)}</span>
              </div>
              <SurpriseBadge pct={epsPct} />
            </div>
          </div>
        )}
      </div>

      {/* Highlights + Documents tabs */}
      {!isUpcoming && (
        <div className="rounded-lg border bg-card">
          <div className="flex border-b px-2">
            {(['highlights', 'documents'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-sm font-medium border-b-2 capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* Highlights */}
            {activeTab === 'highlights' && (
              aiLoading ? <Skeleton /> : highlights.length > 0 ? (
                <ul className="space-y-4">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                      <div>
                        <span className="font-semibold text-sm">{h.title}: </span>
                        <span className="text-sm text-muted-foreground">{h.body}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No highlights available.</p>
              )
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              docsLoading ? <Skeleton /> : filings.length > 0 ? (
                <div className="space-y-2">
                  {filings.map((f, i) => (
                    <a
                      key={i}
                      href={f.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{f.form}</p>
                          <p className="text-xs text-muted-foreground">
                            Filed {new Date(f.filedDate).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents available.</p>
              )
            )}

          </div>
        </div>
      )}
    </div>
  )
}