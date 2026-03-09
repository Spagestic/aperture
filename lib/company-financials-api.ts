/**
 * Fetch company financials from Alpha Vantage and transform to CompanyFinancialPayload.
 * Requires ALPHA_VANTAGE_API_KEY in env.
 */

import type {
  CompanyFinancialPayload,
  CompanyProfile,
  FinancialDataset,
  PeriodView,
  StatementRow,
} from "@/lib/financial-dashboard";

const AV_BASE = "https://www.alphavantage.co/query";

type AVReport = Record<string, string | undefined>;

function parseNum(
  value: string | undefined,
  scaleToMillions = false,
): number | null {
  if (value === undefined || value === "" || value === "None") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return scaleToMillions ? n / 1e6 : n;
}

function periodFromFiscalDate(
  fiscalDateEnding: string,
  granularity: "annual" | "quarterly",
): string {
  const [y, m] = fiscalDateEnding.split("-");
  if (granularity === "annual") return y ?? fiscalDateEnding;
  const month = Number(m ?? 0);
  const q = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
  return `${y}-Q${q}`;
}

function buildStatementRows(
  reports: AVReport[],
  granularity: "annual" | "quarterly",
  fieldToLabel: Record<string, { label: string; format?: "percent" | "ratio" }>,
  scaleToMillions = true,
): StatementRow[] {
  const periods = reports.map((r) =>
    periodFromFiscalDate(r.fiscalDateEnding ?? "", granularity),
  );
  return Object.entries(fieldToLabel).map(([field, { label, format }]) => ({
    label,
    ...(format && { format }),
    values: Object.fromEntries(
      reports.map((r, i) => {
        const period = periods[i];
        const raw = r[field];
        const value = parseNum(
          typeof raw === "string" ? raw : undefined,
          scaleToMillions && format !== "ratio",
        );
        return [period, value];
      }),
    ) as Record<string, number | null>,
  }));
}

const INCOME_FIELDS: Record<
  string,
  { label: string; format?: "percent" | "ratio" }
> = {
  totalRevenue: { label: "Total Revenue" },
  costOfRevenue: { label: "Cost of Sales" },
  grossProfit: { label: "Gross Profit" },
  operatingExpenses: { label: "Operating Expenses" },
  operatingIncome: { label: "Operating Profit" },
  incomeBeforeTax: { label: "Income Before Taxes" },
  netIncome: { label: "Net Income" },
  reportedCurrency: { label: "_currency" }, // skip
};
const INCOME_FIELDS_FILTERED = Object.entries(INCOME_FIELDS)
  .filter(([, v]) => v.label !== "_currency")
  .reduce(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {} as Record<string, { label: string; format?: "percent" | "ratio" }>,
  );

const BALANCE_FIELDS: Record<string, { label: string }> = {
  cashAndCashEquivalentsAtCarryingValue: {
    label: "Total Cash & Cash Equivalents",
  },
  shortTermInvestments: { label: "Short-Term Investments" },
  currentNetReceivables: { label: "Accounts Receivable" },
  inventory: { label: "Inventories" },
  totalAssets: { label: "Total Assets" },
  shortTermDebt: { label: "Short-Term Debt" },
  longTermDebt: { label: "Long-Term Debt" },
  totalLiabilities: { label: "Total Liabilities" },
  totalShareholderEquity: { label: "Total Shareholders' Equity" },
};

const CASHFLOW_FIELDS: Record<string, { label: string }> = {
  netIncome: { label: "Net Income" },
  depreciationDepletionAndAmortization: {
    label: "Depreciation & Amortization",
  },
  cashflowFromInvestment: { label: "Cash from Investing Activities" },
  cashflowFromFinancing: { label: "Cash from Financing Activities" },
  operatingCashflow: { label: "Cash from Operating Activities" },
  capitalExpenditures: { label: "Capital Expenditure" },
};
// Alpha Vantage uses capitalExpenditures (positive number); we show as negative in CF
function cashflowRowFromReports(
  reports: AVReport[],
  granularity: "annual" | "quarterly",
  field: string,
  label: string,
  negate = false,
): StatementRow {
  const periods = reports.map((r) =>
    periodFromFiscalDate(r.fiscalDateEnding ?? "", granularity),
  );
  const values: Record<string, number | null> = {};
  reports.forEach((r, i) => {
    const period = periods[i];
    const v = parseNum(r[field] as string | undefined, true);
    values[period] = v !== null && negate ? -Math.abs(v) : v;
  });
  return { label, values };
}

async function fetchAlphaVantage<T>(
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(AV_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);
  const data = (await res.json()) as T & {
    Note?: string;
    "Error Message"?: string;
  };
  if (data.Note) throw new Error(data.Note);
  if (data["Error Message"]) throw new Error(data["Error Message"]);
  return data as T;
}

type AVIncomeResponse = {
  symbol?: string;
  annualReports?: AVReport[];
  quarterlyReports?: AVReport[];
};

type AVBalanceResponse = {
  symbol?: string;
  annualReports?: AVReport[];
  quarterlyReports?: AVReport[];
};

type AVCashFlowResponse = {
  symbol?: string;
  annualReports?: AVReport[];
  quarterlyReports?: AVReport[];
};

type AVOverviewResponse = {
  Symbol?: string;
  Name?: string;
  Exchange?: string;
  Country?: string;
  OfficialSite?: string;
  Sector?: string;
  MarketCapitalization?: string;
  SharesOutstanding?: string;
  Currency?: string;
};

function domainFromOfficialSite(
  site: string | undefined,
  fallback: string,
): string {
  if (!site) return fallback;

  try {
    const normalized =
      site.startsWith("http://") || site.startsWith("https://")
        ? site
        : `https://${site}`;
    const hostname = new URL(normalized).hostname.toLowerCase();
    return hostname.replace(/^www\./, "") || fallback;
  } catch {
    return fallback;
  }
}

function buildDataset(
  annualIncome: AVReport[],
  quarterlyIncome: AVReport[],
  annualBalance: AVReport[],
  quarterlyBalance: AVReport[],
  annualCashflow: AVReport[],
  quarterlyCashflow: AVReport[],
  overview: AVOverviewResponse,
  ticker: string,
): Record<PeriodView, FinancialDataset> {
  const annualPeriods = annualIncome.map((r) =>
    periodFromFiscalDate(r.fiscalDateEnding ?? "", "annual"),
  );
  const quarterlyPeriods = quarterlyIncome.map((r) =>
    periodFromFiscalDate(r.fiscalDateEnding ?? "", "quarterly"),
  );

  const marketCap = parseNum(overview.MarketCapitalization, false) ?? 0;
  const sharesRaw = parseNum(overview.SharesOutstanding, false) ?? 0;
  const pricePerShare = sharesRaw > 0 ? marketCap / sharesRaw : 0;
  const sharesOutstandingThousands = sharesRaw > 0 ? sharesRaw / 1000 : 0;

  const emptyRow = (periods: string[]): StatementRow[] => [];
  const toMarketPrice = (periods: string[], price: number) =>
    Object.fromEntries(periods.map((p) => [p, price]));
  const toShares = (periods: string[], sh: number) =>
    Object.fromEntries(periods.map((p) => [p, sh]));
  const priceAnnual = pricePerShare;
  const priceQuarterly = pricePerShare;
  const sharesForDataset = sharesOutstandingThousands;

  const incomeAnnual = buildStatementRows(
    annualIncome,
    "annual",
    INCOME_FIELDS_FILTERED,
  );
  const incomeQuarterly = buildStatementRows(
    quarterlyIncome,
    "quarterly",
    INCOME_FIELDS_FILTERED,
  );
  const balanceAnnual = buildStatementRows(
    annualBalance,
    "annual",
    BALANCE_FIELDS,
  );
  const balanceQuarterly = buildStatementRows(
    quarterlyBalance,
    "quarterly",
    BALANCE_FIELDS,
  );
  const cashflowAnnual = [
    cashflowRowFromReports(annualCashflow, "annual", "netIncome", "Net Income"),
    cashflowRowFromReports(
      annualCashflow,
      "annual",
      "depreciationDepletionAndAmortization",
      "Depreciation & Amortization",
    ),
    cashflowRowFromReports(
      annualCashflow,
      "annual",
      "operatingCashflow",
      "Cash from Operating Activities",
    ),
    cashflowRowFromReports(
      annualCashflow,
      "annual",
      "capitalExpenditures",
      "Capital Expenditure",
      true,
    ),
    cashflowRowFromReports(
      annualCashflow,
      "annual",
      "cashflowFromInvestment",
      "Cash from Investing Activities",
    ),
    cashflowRowFromReports(
      annualCashflow,
      "annual",
      "cashflowFromFinancing",
      "Cash from Financing Activities",
    ),
  ];
  const cashflowQuarterly = [
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "netIncome",
      "Net Income",
    ),
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "depreciationDepletionAndAmortization",
      "Depreciation & Amortization",
    ),
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "operatingCashflow",
      "Cash from Operating Activities",
    ),
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "capitalExpenditures",
      "Capital Expenditure",
      true,
    ),
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "cashflowFromInvestment",
      "Cash from Investing Activities",
    ),
    cashflowRowFromReports(
      quarterlyCashflow,
      "quarterly",
      "cashflowFromFinancing",
      "Cash from Financing Activities",
    ),
  ];

  const addDilutedEps = (
    income: StatementRow[],
    reports: AVReport[],
    gran: "annual" | "quarterly",
  ): StatementRow[] => {
    const periods = reports.map((r) =>
      periodFromFiscalDate(r.fiscalDateEnding ?? "", gran),
    );
    const epsRow: StatementRow = {
      label: "Diluted EPS",
      format: "ratio",
      values: Object.fromEntries(
        reports.map((r, i) => [
          periods[i],
          parseNum(r.reportedEPS as string) ?? null,
        ]),
      ),
    };
    return [...income, epsRow];
  };

  const incomeAnnualWithEps = addDilutedEps(
    incomeAnnual,
    annualIncome,
    "annual",
  );
  const incomeQuarterlyWithEps = addDilutedEps(
    incomeQuarterly,
    quarterlyIncome,
    "quarterly",
  );

  const annual: FinancialDataset = {
    periods: annualPeriods,
    marketPrice: toMarketPrice(annualPeriods, priceAnnual),
    sharesOutstanding: toShares(annualPeriods, sharesForDataset),
    income: incomeAnnualWithEps,
    balance: balanceAnnual,
    cashflow: cashflowAnnual,
    segments: emptyRow(annualPeriods),
    adjusted: emptyRow(annualPeriods),
  };

  const quarterly: FinancialDataset = {
    periods: quarterlyPeriods,
    marketPrice: toMarketPrice(quarterlyPeriods, priceQuarterly),
    sharesOutstanding: toShares(quarterlyPeriods, sharesForDataset),
    income: incomeQuarterlyWithEps,
    balance: balanceQuarterly,
    cashflow: cashflowQuarterly,
    segments: emptyRow(quarterlyPeriods),
    adjusted: emptyRow(quarterlyPeriods),
  };

  const semiannualPeriods: string[] = [];
  for (let idx = 0; idx <= quarterlyPeriods.length - 2; idx += 2) {
    const year = quarterlyPeriods[idx]?.split("-")[0] ?? "";
    semiannualPeriods.push(`${year}-H${idx % 2 === 0 ? "1" : "2"}`);
  }
  const semiannualPeriodsSlice = semiannualPeriods.slice(-4);
  const semiannual: FinancialDataset = {
    periods: semiannualPeriodsSlice,
    marketPrice: toMarketPrice(semiannualPeriodsSlice, priceQuarterly),
    sharesOutstanding: toShares(semiannualPeriodsSlice, sharesForDataset),
    income:
      incomeQuarterlyWithEps.length && semiannualPeriodsSlice.length
        ? incomeQuarterlyWithEps.map((row) => ({
            ...row,
            values: Object.fromEntries(
              semiannualPeriodsSlice.map((p, idx) => {
                const q1 = quarterlyPeriods[idx * 2];
                const q2 = quarterlyPeriods[idx * 2 + 1];
                const v1 = q1 != null ? row.values[q1] : null;
                const v2 = q2 != null ? row.values[q2] : null;
                const sum = (v1 ?? 0) + (v2 ?? 0);
                return [p, row.format === "ratio" ? (v2 ?? v1) : sum || null];
              }),
            ) as Record<string, number | null>,
          }))
        : [],
    balance:
      balanceQuarterly.length && semiannualPeriodsSlice.length
        ? balanceQuarterly.map((row) => ({
            ...row,
            values: Object.fromEntries(
              semiannualPeriodsSlice.map((p, idx) => {
                const q2 =
                  quarterlyPeriods[
                    Math.min(idx * 2 + 1, quarterlyPeriods.length - 1)
                  ];
                return [p, q2 != null ? (row.values[q2] ?? null) : null];
              }),
            ) as Record<string, number | null>,
          }))
        : [],
    cashflow: [],
    segments: [],
    adjusted: [],
  };

  return { annual, semiannual, quarterly };
}

export async function fetchCompanyFinancials(
  ticker: string,
  apiKey: string,
): Promise<CompanyFinancialPayload> {
  const symbol = ticker.toUpperCase();

  const [incomeRes, balanceRes, cashflowRes, overviewRes] = await Promise.all([
    fetchAlphaVantage<AVIncomeResponse>({
      function: "INCOME_STATEMENT",
      symbol,
      apikey: apiKey,
    }),
    fetchAlphaVantage<AVBalanceResponse>({
      function: "BALANCE_SHEET",
      symbol,
      apikey: apiKey,
    }),
    fetchAlphaVantage<AVCashFlowResponse>({
      function: "CASH_FLOW",
      symbol,
      apikey: apiKey,
    }),
    fetchAlphaVantage<AVOverviewResponse>({
      function: "OVERVIEW",
      symbol,
      apikey: apiKey,
    }),
  ]);

  const annualIncome = incomeRes.annualReports ?? [];
  const quarterlyIncome = incomeRes.quarterlyReports ?? [];
  const annualBalance = balanceRes.annualReports ?? [];
  const quarterlyBalance = balanceRes.quarterlyReports ?? [];
  const annualCashflow = cashflowRes.annualReports ?? [];
  const quarterlyCashflow = cashflowRes.quarterlyReports ?? [];

  if (annualIncome.length === 0 && quarterlyIncome.length === 0) {
    throw new Error(`No financial data returned for ${symbol}`);
  }

  const company: CompanyProfile = {
    slug: ticker.toLowerCase(),
    name: overviewRes.Name ?? symbol,
    ticker: symbol,
    exchange: overviewRes.Exchange ?? "—",
    country: overviewRes.Country ?? "—",
    logoDomain: domainFromOfficialSite(
      overviewRes.OfficialSite,
      ticker.toLowerCase(),
    ),
    sector: overviewRes.Sector ?? "—",
    sourceLabel: "Alpha Vantage",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  const datasets = buildDataset(
    annualIncome,
    quarterlyIncome,
    annualBalance,
    quarterlyBalance,
    annualCashflow,
    quarterlyCashflow,
    overviewRes,
    symbol,
  );

  return {
    sourceKind: "official-extract",
    company,
    datasets,
  };
}
