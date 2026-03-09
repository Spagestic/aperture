import type {
  CurrencyCode,
  DisplayUnit,
  FinancialDataset,
  NumberFormat,
  PeriodView,
  SheetType,
  StatementRow,
} from "@/lib/financial-dashboard";

export type RatioTile = {
  label: string;
  value: string;
  tone?: "default" | "secondary" | "outline";
};

export const VIEW_LABELS: Record<PeriodView, string> = {
  annual: "Annual",
  semiannual: "Semi-Annual",
  quarterly: "Quarterly",
};

export const SHEET_LABELS: Record<SheetType, string> = {
  keyStats: "Key Statistics",
  income: "Income Statement",
  balance: "Balance Sheet",
  cashflow: "Cash Flow",
  segments: "Segments & KPIs",
  adjusted: "Adjusted",
};

const FX_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  HKD: 7.8,
  RMB: 7.2,
  JPY: 149,
  VND: 24500,
  EUR: 0.92,
  AUD: 1.53,
  KRW: 1330,
};

export function getRow(rows: StatementRow[], label: string) {
  return rows.find((row) => row.label === label);
}

export function valueOrZero(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function convertFromUsd(amount: number, currency: CurrencyCode) {
  return currency === "USD" ? amount : amount * FX_RATES_TO_USD[currency];
}

function scaleAmount(amount: number, unit: DisplayUnit) {
  if (unit === "thousands") return amount;
  if (unit === "millions") return amount / 1000;
  return amount / 1000000;
}

function getUnitSuffix(unit: DisplayUnit) {
  if (unit === "thousands") return "K";
  if (unit === "millions") return "M";
  return "B";
}

export function formatValue(
  value: number | null,
  options: { unit: DisplayUnit; currency: CurrencyCode; format?: NumberFormat }
) {
  if (value === null || value === undefined) return "—";
  if (options.format === "percent") return `${value.toFixed(1)}%`;
  if (options.format === "ratio") return value.toFixed(2);

  const converted = convertFromUsd(value, options.currency);
  const scaled = scaleAmount(converted, options.unit);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Math.abs(scaled) < 10 ? 2 : 0,
    maximumFractionDigits: Math.abs(scaled) < 10 ? 2 : 1,
  }).format(scaled);
}

export function formatCompactCurrency(value: number, unit: DisplayUnit, currency: CurrencyCode) {
  return `${currency} ${formatValue(value, { unit, currency })} ${getUnitSuffix(unit)}`;
}

export function buildKeyStats(data: FinancialDataset): StatementRow[] {
  const revenue = getRow(data.income, "Total Revenue");
  const grossProfit = getRow(data.income, "Gross Profit");
  const operatingProfit = getRow(data.income, "Operating Profit");
  const netIncome = getRow(data.income, "Net Income");
  const dilutedEps = getRow(data.income, "Diluted EPS");
  const cash = getRow(data.balance, "Total Cash & Cash Equivalents");
  const debt = getRow(data.balance, "Long-Term Debt") ?? getRow(data.balance, "Short-Term Debt");
  const equity = getRow(data.balance, "Total Shareholders' Equity");
  const cfo = getRow(data.cashflow, "Cash from Operating Activities");
  const capex = getRow(data.cashflow, "Capital Expenditure");

  return [
    {
      label: "Market Cap",
      values: Object.fromEntries(
        data.periods.map((period) => [
          period,
          valueOrZero(data.marketPrice[period]) * valueOrZero(data.sharesOutstanding[period]) * 1000,
        ])
      ),
    },
    {
      label: "Enterprise Value",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const marketCap = valueOrZero(data.marketPrice[period]) * valueOrZero(data.sharesOutstanding[period]) * 1000;
          return [period, marketCap + valueOrZero(debt?.values[period]) - valueOrZero(cash?.values[period])];
        })
      ),
    },
    { label: "Revenue", values: revenue?.values ?? {} },
    {
      label: "Revenue Growth",
      values: Object.fromEntries(
        data.periods.map((period, index) => {
          if (index === 0) return [period, null];
          const previous = valueOrZero(revenue?.values[data.periods[index - 1]]);
          const current = valueOrZero(revenue?.values[period]);
          return [period, previous ? ((current - previous) / previous) * 100 : null];
        })
      ),
      format: "percent",
    },
    {
      label: "Gross Margin",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const currentRevenue = valueOrZero(revenue?.values[period]);
          const currentGrossProfit = valueOrZero(grossProfit?.values[period]);
          return [period, currentRevenue ? (currentGrossProfit / currentRevenue) * 100 : null];
        })
      ),
      format: "percent",
    },
    {
      label: "EBIT Margin",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const currentRevenue = valueOrZero(revenue?.values[period]);
          const currentOperatingProfit = valueOrZero(operatingProfit?.values[period]);
          return [period, currentRevenue ? (currentOperatingProfit / currentRevenue) * 100 : null];
        })
      ),
      format: "percent",
    },
    {
      label: "Net Margin",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const currentRevenue = valueOrZero(revenue?.values[period]);
          const currentNetIncome = valueOrZero(netIncome?.values[period]);
          return [period, currentRevenue ? (currentNetIncome / currentRevenue) * 100 : null];
        })
      ),
      format: "percent",
    },
    {
      label: "ROE",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const currentEquity = valueOrZero(equity?.values[period]);
          const currentNetIncome = valueOrZero(netIncome?.values[period]);
          return [period, currentEquity ? (currentNetIncome / currentEquity) * 100 : null];
        })
      ),
      format: "percent",
    },
    {
      label: "Free Cash Flow",
      values: Object.fromEntries(
        data.periods.map((period) => [period, valueOrZero(cfo?.values[period]) + valueOrZero(capex?.values[period])])
      ),
    },
    {
      label: "P/E",
      values: Object.fromEntries(
        data.periods.map((period) => {
          const eps = valueOrZero(dilutedEps?.values[period]);
          return [period, eps ? valueOrZero(data.marketPrice[period]) / eps : null];
        })
      ),
      format: "ratio",
    },
  ];
}

export function buildRatioTiles(data: FinancialDataset): RatioTile[] {
  const last = data.periods[data.periods.length - 1];
  const revenue = getRow(data.income, "Total Revenue");
  const grossProfit = getRow(data.income, "Gross Profit");
  const operatingProfit = getRow(data.income, "Operating Profit");
  const netIncome = getRow(data.income, "Net Income");
  const dilutedEps = getRow(data.income, "Diluted EPS");
  const debt = getRow(data.balance, "Long-Term Debt") ?? getRow(data.balance, "Short-Term Debt");
  const equity = getRow(data.balance, "Total Shareholders' Equity");
  const cash = getRow(data.balance, "Total Cash & Cash Equivalents");
  const cfo = getRow(data.cashflow, "Cash from Operating Activities");
  const capex = getRow(data.cashflow, "Capital Expenditure");

  const marketCap = valueOrZero(data.marketPrice[last]) * valueOrZero(data.sharesOutstanding[last]) * 1000;
  const enterpriseValue = marketCap + valueOrZero(debt?.values[last]) - valueOrZero(cash?.values[last]);
  const currentRevenue = valueOrZero(revenue?.values[last]);
  const currentGrossProfit = valueOrZero(grossProfit?.values[last]);
  const currentOperatingProfit = valueOrZero(operatingProfit?.values[last]);
  const currentNetIncome = valueOrZero(netIncome?.values[last]);
  const currentEquity = valueOrZero(equity?.values[last]);
  const currentCfo = valueOrZero(cfo?.values[last]);
  const currentCapex = valueOrZero(capex?.values[last]);
  const currentEps = valueOrZero(dilutedEps?.values[last]);

  return [
    {
      label: "Gross Margin",
      value: `${((currentGrossProfit / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`,
      tone: "secondary",
    },
    {
      label: "EBIT Margin",
      value: `${((currentOperatingProfit / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`,
      tone: "secondary",
    },
    {
      label: "Net Margin",
      value: `${((currentNetIncome / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`,
      tone: "secondary",
    },
    {
      label: "ROE",
      value: `${((currentNetIncome / Math.max(currentEquity, 1)) * 100).toFixed(1)}%`,
      tone: "secondary",
    },
    {
      label: "Debt / Equity",
      value: `${(valueOrZero(debt?.values[last]) / Math.max(currentEquity, 1)).toFixed(2)}x`,
      tone: "outline",
    },
    {
      label: "P/E",
      value: currentEps ? `${(valueOrZero(data.marketPrice[last]) / currentEps).toFixed(1)}x` : "—",
      tone: "outline",
    },
    {
      label: "EV / Sales",
      value: `${(enterpriseValue / Math.max(currentRevenue, 1)).toFixed(1)}x`,
      tone: "outline",
    },
    {
      label: "FCF Margin",
      value: `${(((currentCfo + currentCapex) / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`,
      tone: "outline",
    },
  ];
}

export function nextForecastLabels(view: PeriodView, data: FinancialDataset) {
  const last = data.periods[data.periods.length - 1];
  if (view === "annual") {
    const lastYear = Number(last);
    return [`${lastYear + 1}E`, `${lastYear + 2}E`];
  }
  if (view === "semiannual") {
    const [year] = last.split("-");
    const numericYear = Number(year);
    return [`${numericYear + 1}-H1E`, `${numericYear + 1}-H2E`];
  }
  const [year] = last.split("-");
  const numericYear = Number(year);
  return [`${numericYear + 1}-Q1E`, `${numericYear + 1}-Q2E`];
}

export function buildForecastRows(data: FinancialDataset, view: PeriodView): StatementRow[] {
  const periods = data.periods;
  const revenue = getRow(data.income, "Total Revenue");
  const grossProfit = getRow(data.income, "Gross Profit");
  const operatingProfit = getRow(data.income, "Operating Profit");
  const netIncome = getRow(data.income, "Net Income");
  const cfo = getRow(data.cashflow, "Cash from Operating Activities");
  const capex = getRow(data.cashflow, "Capital Expenditure");
  const equity = getRow(data.balance, "Total Shareholders' Equity");
  if (!revenue || !grossProfit || !operatingProfit || !netIncome || !equity) return [];

  const firstPeriod = periods[0];
  const lastPeriod = periods[periods.length - 1];
  const firstRevenue = valueOrZero(revenue.values[firstPeriod]);
  const lastRevenue = valueOrZero(revenue.values[lastPeriod]);
  const stepCount = Math.max(periods.length - 1, 1);
  const rawGrowth = firstRevenue > 0 ? Math.pow(lastRevenue / firstRevenue, 1 / stepCount) - 1 : 0.14;
  const growthOne = Math.min(Math.max(rawGrowth * 0.72, 0.06), 0.34);
  const growthTwo = Math.min(Math.max(rawGrowth * 0.54, 0.04), 0.24);

  const grossMargin = valueOrZero(grossProfit.values[lastPeriod]) / Math.max(lastRevenue, 1);
  const operatingMargin = valueOrZero(operatingProfit.values[lastPeriod]) / Math.max(lastRevenue, 1);
  const netMargin = valueOrZero(netIncome.values[lastPeriod]) / Math.max(lastRevenue, 1);
  const cfoMargin = valueOrZero(cfo?.values[lastPeriod]) / Math.max(lastRevenue, 1);
  const capexMargin = Math.abs(valueOrZero(capex?.values[lastPeriod])) / Math.max(lastRevenue, 1);
  const startingEquity = valueOrZero(equity.values[lastPeriod]);

  const labels = nextForecastLabels(view, data);
  const revenueOne = lastRevenue * (1 + growthOne);
  const revenueTwo = revenueOne * (1 + growthTwo);
  const netIncomeOne = revenueOne * netMargin;
  const netIncomeTwo = revenueTwo * netMargin;
  const equityOne = startingEquity + netIncomeOne * 0.72;
  const equityTwo = equityOne + netIncomeTwo * 0.72;

  const row = (label: string, first: number, second: number, format?: NumberFormat): StatementRow => ({
    label,
    values: { [labels[0]]: first, [labels[1]]: second },
    format,
  });

  return [
    row("Revenue", revenueOne, revenueTwo),
    row("Gross Profit", revenueOne * grossMargin, revenueTwo * grossMargin),
    row("Operating Profit", revenueOne * operatingMargin, revenueTwo * operatingMargin),
    row("Net Income", netIncomeOne, netIncomeTwo),
    row("Operating Cash Flow", revenueOne * cfoMargin, revenueTwo * cfoMargin),
    row("Capital Expenditure", -(revenueOne * capexMargin), -(revenueTwo * capexMargin)),
    row("Free Cash Flow", revenueOne * cfoMargin - revenueOne * capexMargin, revenueTwo * cfoMargin - revenueTwo * capexMargin),
    row("Revenue Growth", growthOne * 100, growthTwo * 100, "percent"),
    row("Net Margin", netMargin * 100, netMargin * 100, "percent"),
    row("ROE", (netIncomeOne / Math.max(equityOne, 1)) * 100, (netIncomeTwo / Math.max(equityTwo, 1)) * 100, "percent"),
  ];
}

export function buildInsights(data: FinancialDataset) {
  const last = data.periods[data.periods.length - 1];
  const previous = data.periods[data.periods.length - 2];
  const revenue = getRow(data.income, "Total Revenue");
  const grossProfit = getRow(data.income, "Gross Profit");
  const operatingProfit = getRow(data.income, "Operating Profit");
  const netIncome = getRow(data.income, "Net Income");
  const cfo = getRow(data.cashflow, "Cash from Operating Activities");
  const capex = getRow(data.cashflow, "Capital Expenditure");
  const dataCenter = getRow(data.segments, "Data Center Revenue");

  const currentRevenue = valueOrZero(revenue?.values[last]);
  const previousRevenue = valueOrZero(revenue?.values[previous]);
  const growth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const grossMargin = (valueOrZero(grossProfit?.values[last]) / Math.max(currentRevenue, 1)) * 100;
  const ebitMargin = (valueOrZero(operatingProfit?.values[last]) / Math.max(currentRevenue, 1)) * 100;
  const netMargin = (valueOrZero(netIncome?.values[last]) / Math.max(currentRevenue, 1)) * 100;
  const fcfMargin = ((valueOrZero(cfo?.values[last]) + valueOrZero(capex?.values[last])) / Math.max(currentRevenue, 1)) * 100;
  const dataCenterMix = (valueOrZero(dataCenter?.values[last]) / Math.max(currentRevenue, 1)) * 100;

  return [
    `${last} revenue is growing ${growth.toFixed(1)}% versus the previous reported period.`,
    `Gross margin is ${grossMargin.toFixed(1)}% while EBIT margin is ${ebitMargin.toFixed(1)}%, indicating the current operating leverage profile.`,
    `Net margin is ${netMargin.toFixed(1)}% and free cash flow margin is ${fcfMargin.toFixed(1)}%, so cash conversion remains visible in one page.`,
    `Data Center contributes ${dataCenterMix.toFixed(1)}% of revenue in the latest period, which becomes more important in the Segments & KPIs view.`,
  ];
}