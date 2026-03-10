'use client'

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────
type SubTab = 'keyStats' | 'income' | 'balance' | 'cashflow'
type Freq   = 'annual' | 'quarterly'

interface Props { ticker: string }

// ─── Row Definitions ─────────────────────────────────────
const INCOME_ROWS = [
  { label: 'Revenue',            concepts: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet'] },
  { label: 'Cost of Revenue',    concepts: ['CostOfRevenue', 'CostOfGoodsAndServicesSold'] },
  { label: 'Gross Profit',       concepts: ['GrossProfit'] },
  { label: 'Operating Expenses', concepts: ['OperatingExpenses'] },
  { label: 'Operating Income',   concepts: ['OperatingIncomeLoss'] },
  { label: 'Net Income',         concepts: ['NetIncomeLoss', 'ProfitLoss'] },
  { label: 'EPS Basic',          concepts: ['EarningsPerShareBasic'],    format: 'eps' },
  { label: 'EPS Diluted',        concepts: ['EarningsPerShareDiluted'],  format: 'eps' },
]

const BALANCE_ROWS = [
  { label: 'Total Assets',       concepts: ['Assets'] },
  { label: 'Current Assets',     concepts: ['AssetsCurrent'] },
  { label: 'Cash & Equivalents', concepts: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsAndShortTermInvestments'] },
  { label: 'Total Liabilities',  concepts: ['Liabilities'] },
  { label: 'Current Liabilities',concepts: ['LiabilitiesCurrent'] },
  { label: 'Long-term Debt',     concepts: ['LongTermDebt', 'LongTermDebtNoncurrent'] },
  { label: 'Total Equity',       concepts: ['StockholdersEquity'] },
]

const CASHFLOW_ROWS = [
  { label: 'Operating Cash Flow', concepts: ['NetCashProvidedByUsedInOperatingActivities'] },
  { label: 'Capital Expenditures',concepts: ['PaymentsToAcquirePropertyPlantAndEquipment'] },
  { label: 'Investing Cash Flow', concepts: ['NetCashProvidedByUsedInInvestingActivities'] },
  { label: 'Financing Cash Flow', concepts: ['NetCashProvidedByUsedInFinancingActivities'] },
  { label: 'Net Change in Cash',  concepts: ['CashCashEquivalentsAndShortTermInvestmentsPeriodIncreaseDecrease'] },
]

const KEY_STATS = [
  { label: 'Market Cap',       key: 'marketCapitalization',       fmt: 'cap'  },
  { label: 'P/E Ratio',        key: 'peNormalizedAnnual',         fmt: 'num'  },
  { label: 'P/B Ratio',        key: 'pbAnnual',                   fmt: 'num'  },
  { label: 'EPS (TTM)',        key: 'epsNormalizedAnnual',        fmt: 'usd'  },
  { label: 'Gross Margin',     key: 'grossMarginTTM',             fmt: 'pct'  },
  { label: 'Net Margin',       key: 'netProfitMarginTTM',         fmt: 'pct'  },
  { label: 'ROE',              key: 'roeTTM',                     fmt: 'pct'  },
  { label: 'ROA',              key: 'roaTTM',                     fmt: 'pct'  },
  { label: 'Revenue/Share',    key: 'revenuePerShareTTM',         fmt: 'usd'  },
  { label: '52W High',         key: '52WeekHigh',                 fmt: 'usd'  },
  { label: '52W Low',          key: '52WeekLow',                  fmt: 'usd'  },
  { label: 'Beta',             key: 'beta',                       fmt: 'num'  },
  { label: 'Dividend Yield',   key: 'dividendYieldIndicatedAnnual', fmt: 'pct'},
  { label: 'Shares Outstanding', key: 'shareOutstanding',         fmt: 'shares'},
]

// ─── Formatters ───────────────────────────────────────────
function fmt(value: number | null | undefined, format = 'large'): string {
  if (value == null) return '—'
  switch (format) {
    case 'cap':    // marketCap is in millions from Finnhub
      return value >= 1000
        ? `$${(value / 1000).toFixed(2)}B`
        : `$${value.toFixed(0)}M`
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
function findConcept(
  report: any,
  section: 'ic' | 'bs' | 'cf',
  concepts: string[]
): number | null {
  const items: any[] = report?.report?.[section] ?? []
  for (const c of concepts) {
    const found = items.find((i: any) => i.concept === c)
    if (found != null) return found.value
  }
  return null
}

// ─── Component ────────────────────────────────────────────
export default function Financials({ ticker }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('keyStats')
  const [freq,   setFreq]   = useState<Freq>('annual')
  const [data,   setData]   = useState<any>(null)
  const [loading,setLoading]= useState(true)
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/financials/${ticker}?freq=${freq}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load financials'))
      .finally(() => setLoading(false))
  }, [ticker, freq])

  // Sorted reports — latest 5, oldest → newest (left = old, right = new)
  const reports: any[] = (data?.financials?.data ?? [])
    .sort((a: any, b: any) => new Date(b.period).getTime() - new Date(a.period).getTime())
    .slice(0, 5)
    .reverse()

  // ── Renderers ──────────────────────────────────────────
  function renderKeyStats() {
    const m = data?.metrics?.metric ?? {}
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        {KEY_STATS.map(s => (
          <div key={s.key} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className="text-white font-semibold text-sm">{fmt(m[s.key], s.fmt)}</p>
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
      return <p className="text-gray-400 text-sm p-4">No data available.</p>

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium min-w-[180px]">
                Metric
              </th>
              {reports.map((r: any) => (
                <th key={r.period} className="text-right py-3 px-4 text-gray-400 font-medium whitespace-nowrap">
                  {r.period?.substring(0, 10)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const values = reports.map(r => findConcept(r, section, row.concepts))
              return (
                <tr
                  key={row.label}
                  className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-300">{row.label}</td>
                  {values.map((val, i) => (
                    <td key={i} className="py-3 px-4 text-right text-white tabular-nums">
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

  // ── Tab Config ─────────────────────────────────────────
  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'keyStats', label: 'Key Stats'        },
    { id: 'income',   label: 'Income Statement' },
    { id: 'balance',  label: 'Balance Sheet'    },
    { id: 'cashflow', label: 'Cash Flow'        },
  ]

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b border-gray-800 px-2 flex-wrap gap-2">
        {/* Sub tabs */}
        <div className="flex">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                subTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Annual / Quarterly toggle — hidden on Key Stats */}
        {subTab !== 'keyStats' && (
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mr-2">
            {(['annual', 'quarterly'] as Freq[]).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  freq === f
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
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
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm p-4">{error}</p>
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