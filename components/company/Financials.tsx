'use client'

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────
type SubTab = 'keyStats' | 'income' | 'balance' | 'cashflow'
type Freq   = 'annual' | 'quarterly'

interface Props { ticker: string }

// ─── Row Definitions ─────────────────────────────────────
const INCOME_ROWS = [
  { label: 'Revenue',            concepts: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'] },
  { label: 'Cost of Revenue',    concepts: ['CostOfGoodsAndServicesSold', 'CostOfRevenue'] },
  { label: 'Gross Profit',       concepts: ['GrossProfit'] },
  { label: 'Operating Expenses', concepts: ['OperatingExpenses'] },
  { label: 'Operating Income',   concepts: ['OperatingIncomeLoss'] },
  { label: 'Net Income',         concepts: ['NetIncomeLoss', 'NetIncome', 'ProfitLoss'] },
  { label: 'EPS Basic',          concepts: ['EarningsPerShareBasic'],   format: 'eps' },
  { label: 'EPS Diluted',        concepts: ['EarningsPerShareDiluted'], format: 'eps' },
]

const BALANCE_ROWS = [
  { label: 'Total Assets',        concepts: ['Assets'] },
  { label: 'Current Assets',      concepts: ['AssetsCurrent'] },
  { label: 'Cash & Equivalents',  concepts: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsAndShortTermInvestments'] },
  { label: 'Total Liabilities',   concepts: ['Liabilities'] },
  { label: 'Current Liabilities', concepts: ['LiabilitiesCurrent'] },
  { label: 'Long-term Debt',      concepts: ['LongTermDebt', 'LongTermDebtNoncurrent'] },
  { label: 'Total Equity',        concepts: ['StockholdersEquity'] },
]

const CASHFLOW_ROWS = [
  { label: 'Operating Cash Flow', concepts: ['NetCashProvidedByUsedInOperatingActivities'] },
  { label: 'Capital Expenditures',concepts: ['PaymentsToAcquirePropertyPlantAndEquipment'] },
  { label: 'Investing Cash Flow', concepts: ['NetCashProvidedByUsedInInvestingActivities'] },
  { label: 'Financing Cash Flow', concepts: ['NetCashProvidedByUsedInFinancingActivities'] },
  { label: 'Net Change in Cash',  concepts: ['CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect', 'IncreaseDecreaseInCashAndCashEquivalents'] },
]

const KEY_STATS = [
  { label: 'Market Cap',          key: 'marketCapitalization',         fmt: 'cap'    },
  { label: 'P/E Ratio',           key: 'peNormalizedAnnual',           fmt: 'num'    },
  { label: 'P/B Ratio',           key: 'pbAnnual',                     fmt: 'num'    },
  { label: 'EPS (TTM)',           key: 'epsNormalizedAnnual',          fmt: 'usd'    },
  { label: 'Gross Margin',        key: 'grossMarginTTM',               fmt: 'pct'    },
  { label: 'Net Margin',          key: 'netProfitMarginTTM',           fmt: 'pct'    },
  { label: 'ROE',                 key: 'roeTTM',                       fmt: 'pct'    },
  { label: 'ROA',                 key: 'roaTTM',                       fmt: 'pct'    },
  { label: 'Revenue/Share',       key: 'revenuePerShareTTM',           fmt: 'usd'    },
  { label: '52W High',            key: '52WeekHigh',                   fmt: 'usd'    },
  { label: '52W Low',             key: '52WeekLow',                    fmt: 'usd'    },
  { label: 'Beta',                key: 'beta',                         fmt: 'num'    },
  { label: 'Dividend Yield',      key: 'dividendYieldIndicatedAnnual', fmt: 'pct'    },
  { label: 'Shares Outstanding',  key: 'shareOutstanding',             fmt: 'shares' },
]

// ─── Formatters ───────────────────────────────────────────
function fmt(value: number | null | undefined, format = 'large'): string {
  if (value == null) return '—'
  switch (format) {
    case 'cap':
      return value >= 1000 ? `$${(value / 1000).toFixed(2)}B` : `$${value.toFixed(0)}M`
    case 'large':
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
      return `$${value.toFixed(0)}`
    case 'usd':    return `$${value.toFixed(2)}`
    case 'eps':    return `$${value.toFixed(2)}`
    case 'pct':    return `${value.toFixed(1)}%`
    case 'num':    return value.toFixed(2)
    case 'shares': return `${(value / 1000).toFixed(0)}M`
    default:       return value.toString()
  }
}

// ─── Helpers ──────────────────────────────────────────────
function findConcept(report: any, section: 'ic' | 'bs' | 'cf', concepts: string[]): number | null {
  const items: any[] = report?.report?.[section] ?? []
  for (const c of concepts) {
    const found = items.find((i: any) => i.concept?.replace(/^us-gaap_/, '') === c)
    if (found != null) return found.value
  }
  return null
}

// ─── Component ────────────────────────────────────────────
export default function Financials({ ticker }: Props) {
  const [subTab,  setSubTab]  = useState<SubTab>('keyStats')
  const [freq,    setFreq]    = useState<Freq>('annual')
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/financials/${ticker}?freq=${freq}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Failed to load financials'))
      .finally(() => setLoading(false))
  }, [ticker, freq])

  const reports: any[] = (data?.financials?.data ?? [])
    .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .slice(0, 5)
    .reverse()

  // ── Renderers ─────────────────────────────────────────
  function renderKeyStats() {
    const m = data?.metrics?.metric ?? {}
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        {KEY_STATS.map(s => (
          <div key={s.key} className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-semibold">{fmt(m[s.key], s.fmt)}</p>
          </div>
        ))}
      </div>
    )
  }

  function renderTable(
    rows: { label: string; concepts: string[]; format?: string }[],
    section: 'ic' | 'bs' | 'cf'
  ) {
    if (!reports.length)
      return <p className="text-muted-foreground text-sm p-4">No data available.</p>

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium min-w-[180px]">
                Metric
              </th>
              {reports.map((r: any) => (
                <th key={r.endDate} className="text-right py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                  {r.endDate?.substring(0, 10)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const values = reports.map(r => findConcept(r, section, row.concepts))
              return (
                <tr key={row.label} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                  {values.map((val, i) => (
                    <td key={i} className="py-3 px-4 text-right font-medium tabular-nums">
                      {fmt(val, row.format ?? 'large')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // ── Tab Config ────────────────────────────────────────
  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'keyStats', label: 'Key Stats'        },
    { id: 'income',   label: 'Income Statement' },
    { id: 'balance',  label: 'Balance Sheet'    },
    { id: 'cashflow', label: 'Cash Flow'        },
  ]

  return (
    <div className="rounded-lg border bg-card">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b px-2 flex-wrap gap-2">
        {/* Sub tabs */}
        <div className="flex">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                subTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Annual / Quarterly toggle */}
        {subTab !== 'keyStats' && (
          <div className="flex gap-1 bg-muted rounded-lg p-1 mr-2">
            {(['annual', 'quarterly'] as Freq[]).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  freq === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm p-4">{error}</p>
        ) : (
          <>
            {subTab === 'keyStats' && renderKeyStats()}
            {subTab === 'income'   && renderTable(INCOME_ROWS,   'ic')}
            {subTab === 'balance'  && renderTable(BALANCE_ROWS,  'bs')}
            {subTab === 'cashflow' && renderTable(CASHFLOW_ROWS, 'cf')}
          </>
        )}
      </div>
    </div>
  )
}