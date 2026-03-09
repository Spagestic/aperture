"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Download,
  DollarSign,
  LineChart,
  MoreHorizontal,
  Sigma,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CompanyFinancialPayload,
  CurrencyCode,
  DisplayUnit,
  FinancialDataset,
  NumberFormat,
  PeriodView,
  SheetType,
  StatementRow,
} from "@/lib/financial-dashboard";

type RatioTile = {
  label: string;
  value: string;
  tone?: "default" | "secondary" | "outline";
};

type FinancialDashboardRouteProps = {
  companySlug: string;
};

const VIEW_LABELS: Record<PeriodView, string> = {
  annual: "Annual",
  semiannual: "Semi-Annual",
  quarterly: "Quarterly",
};

const SHEET_LABELS: Record<SheetType, string> = {
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

function getRow(rows: StatementRow[], label: string) {
  return rows.find((row) => row.label === label);
}

function valueOrZero(value: number | null | undefined) {
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

function formatValue(
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

function formatCompactCurrency(value: number, unit: DisplayUnit, currency: CurrencyCode) {
  return `${currency} ${formatValue(value, { unit, currency })} ${getUnitSuffix(unit)}`;
}

function buildKeyStats(data: FinancialDataset): StatementRow[] {
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

function buildRatioTiles(data: FinancialDataset): RatioTile[] {
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
    { label: "Gross Margin", value: `${((currentGrossProfit / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`, tone: "secondary" },
    { label: "EBIT Margin", value: `${((currentOperatingProfit / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`, tone: "secondary" },
    { label: "Net Margin", value: `${((currentNetIncome / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`, tone: "secondary" },
    { label: "ROE", value: `${((currentNetIncome / Math.max(currentEquity, 1)) * 100).toFixed(1)}%`, tone: "secondary" },
    { label: "Debt / Equity", value: `${(valueOrZero(debt?.values[last]) / Math.max(currentEquity, 1)).toFixed(2)}x`, tone: "outline" },
    { label: "P/E", value: currentEps ? `${(valueOrZero(data.marketPrice[last]) / currentEps).toFixed(1)}x` : "—", tone: "outline" },
    { label: "EV / Sales", value: `${(enterpriseValue / Math.max(currentRevenue, 1)).toFixed(1)}x`, tone: "outline" },
    { label: "FCF Margin", value: `${(((currentCfo + currentCapex) / Math.max(currentRevenue, 1)) * 100).toFixed(1)}%`, tone: "outline" },
  ];
}

function nextForecastLabels(view: PeriodView, data: FinancialDataset) {
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

function buildForecastRows(data: FinancialDataset, view: PeriodView): StatementRow[] {
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

function buildInsights(data: FinancialDataset) {
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

function FinancialTable({
  rows,
  periods,
  unit,
  currency,
}: {
  rows: StatementRow[];
  periods: string[];
  unit: DisplayUnit;
  currency: CurrencyCode;
}) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-2xl border bg-background/80">
      <div className="min-w-[1040px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-[300px] bg-background">Line Item</TableHead>
              {periods.map((period) => (
                <TableHead key={period} className="text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {period}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium">{row.label}</TableCell>
                {periods.map((period) => (
                  <TableCell key={period} className="text-right font-mono text-sm">
                    {formatValue(row.values[period] ?? null, { unit, currency, format: row.format })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function FinancialDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Skeleton className="h-[460px] rounded-3xl" />
        <Skeleton className="h-[460px] rounded-3xl" />
      </div>
    </div>
  );
}

function FinancialDashboardView({
  payload,
}: {
  payload: CompanyFinancialPayload;
}) {
  const [sheet, setSheet] = React.useState<SheetType>("keyStats");
  const [view, setView] = React.useState<PeriodView>("annual");
  const [unit, setUnit] = React.useState<DisplayUnit>("millions");
  const [currency, setCurrency] = React.useState<CurrencyCode>("USD");
  const [fromPeriod, setFromPeriod] = React.useState<string>("all");
  const [toPeriod, setToPeriod] = React.useState<string>("all");

  const data = payload.datasets[view];

  React.useEffect(() => {
    setFromPeriod("all");
    setToPeriod("all");
  }, [view]);

  const visiblePeriods = React.useMemo(() => {
    const startIndex = fromPeriod === "all" ? 0 : Math.max(data.periods.indexOf(fromPeriod), 0);
    const endIndex = toPeriod === "all" ? data.periods.length - 1 : Math.max(data.periods.indexOf(toPeriod), 0);
    return data.periods.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
  }, [data.periods, fromPeriod, toPeriod]);

  const keyStats = React.useMemo(() => buildKeyStats(data), [data]);
  const ratioTiles = React.useMemo(() => buildRatioTiles(data), [data]);
  const forecastRows = React.useMemo(() => buildForecastRows(data, view), [data, view]);
  const forecastPeriods = React.useMemo(() => nextForecastLabels(view, data), [data, view]);
  const insights = React.useMemo(() => buildInsights(data), [data]);

  const activeRows = React.useMemo(() => {
    switch (sheet) {
      case "income":
        return data.income;
      case "balance":
        return data.balance;
      case "cashflow":
        return data.cashflow;
      case "segments":
        return data.segments;
      case "adjusted":
        return data.adjusted;
      case "keyStats":
      default:
        return keyStats;
    }
  }, [data, keyStats, sheet]);

  const filteredRows = React.useMemo(
    () =>
      activeRows.map((row) => ({
        ...row,
        values: Object.fromEntries(visiblePeriods.map((period) => [period, row.values[period] ?? null])),
      })),
    [activeRows, visiblePeriods]
  );

  const latestPeriod = visiblePeriods[visiblePeriods.length - 1] ?? data.periods[data.periods.length - 1];
  const latestPrice = data.marketPrice[latestPeriod] ?? 0;
  const latestMarketCap = latestPrice * valueOrZero(data.sharesOutstanding[latestPeriod]) * 1000;

  return (
    <div className="space-y-6">
      {payload.sourceKind === "demo" && payload.message ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Official extract not connected yet</AlertTitle>
          <AlertDescription>{payload.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {payload.sourceKind === "demo" ? <Badge variant="secondary">Demo payload</Badge> : null}
                <Badge variant="secondary">{payload.company.ticker}</Badge>
                <Badge variant="outline">{payload.company.exchange}</Badge>
                <Badge variant="outline">{payload.company.sector}</Badge>
                <Badge variant="outline">{payload.company.sourceLabel}</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{payload.company.name}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Financial dashboard under the company route, using the same page for both the live extract contract and the current demo payload fallback.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={view} onValueChange={(value) => setView(value as PeriodView)}>
                <SelectTrigger className="w-[190px] bg-background/70">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="semiannual">Semi-Annual</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-background/70">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[340px] p-4">
                  <DropdownMenuLabel>Statement Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Display amount</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["thousands", "millions", "billions"] as DisplayUnit[]).map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={unit === value ? "default" : "outline"}
                            onClick={() => setUnit(value)}
                            className="capitalize"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Currency</p>
                      <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {(["USD", "HKD", "RMB", "JPY", "VND", "EUR", "AUD", "KRW"] as CurrencyCode[]).map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Date range</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={fromPeriod} onValueChange={setFromPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="From" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {data.periods.map((period) => (
                              <SelectItem key={period} value={period}>
                                {period}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={toPeriod} onValueChange={setToPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="To" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {data.periods.map((period) => (
                              <SelectItem key={period} value={period}>
                                {period}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="bg-background/70">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{VIEW_LABELS[view]} view</span>
            <span>•</span>
            <span>{currency}</span>
            <span>•</span>
            <Badge variant="secondary" className="capitalize">
              {unit}
            </Badge>
            <Badge variant="outline">Latest price {currency} {latestPrice.toFixed(2)}</Badge>
            <Badge variant="outline">Implied market cap {formatCompactCurrency(latestMarketCap, unit, currency)}</Badge>
            {payload.company.lastUpdated ? <Badge variant="outline">Updated {payload.company.lastUpdated}</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue",
            value: formatCompactCurrency(valueOrZero(getRow(data.income, "Total Revenue")?.values[latestPeriod]), unit, currency),
            detail: `Growth ${(() => {
              const prev = data.periods[data.periods.length - 2];
              const cur = valueOrZero(getRow(data.income, "Total Revenue")?.values[latestPeriod]);
              const previousValue = valueOrZero(getRow(data.income, "Total Revenue")?.values[prev]);
              return previousValue ? (((cur - previousValue) / previousValue) * 100).toFixed(1) : "0.0";
            })()}% vs previous period`,
            icon: DollarSign,
          },
          {
            label: "Net Income",
            value: formatCompactCurrency(valueOrZero(getRow(data.income, "Net Income")?.values[latestPeriod]), unit, currency),
            detail: "Bottom-line profit attributable to shareholders",
            icon: Wallet,
          },
          {
            label: "Free Cash Flow",
            value: formatCompactCurrency(
              valueOrZero(getRow(data.cashflow, "Cash from Operating Activities")?.values[latestPeriod]) +
                valueOrZero(getRow(data.cashflow, "Capital Expenditure")?.values[latestPeriod]),
              unit,
              currency
            ),
            detail: "Operating cash flow less capital expenditure",
            icon: BarChart3,
          },
          {
            label: "Enterprise Value",
            value: formatCompactCurrency(
              latestMarketCap +
                valueOrZero((getRow(data.balance, "Long-Term Debt") ?? getRow(data.balance, "Short-Term Debt"))?.values[latestPeriod]) -
                valueOrZero(getRow(data.balance, "Total Cash & Cash Equivalents")?.values[latestPeriod]),
              unit,
              currency
            ),
            detail: `Market cap ${formatCompactCurrency(latestMarketCap, unit, currency)}`,
            icon: TrendingUp,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-border/70 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Card className="border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader className="gap-4 pb-2">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-base">Statement Explorer</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  One-page switching between statement sheets while consuming normalized extracted statement data.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span>Visible periods</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{visiblePeriods.join(" / ")}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={sheet} onValueChange={(value) => setSheet(value as SheetType)}>
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="h-auto w-max min-w-full justify-start gap-2 rounded-2xl bg-muted/70 p-1">
                  {(Object.keys(SHEET_LABELS) as SheetType[]).map((value) => (
                    <TabsTrigger key={value} value={value} className="rounded-xl px-4 py-2">
                      {SHEET_LABELS[value]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Tabs>
            <FinancialTable rows={filteredRows} periods={visiblePeriods} unit={unit} currency={currency} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sigma className="h-4 w-4" />
              Analytical Ratios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {ratioTiles.map((tile) => (
                <div key={tile.label} className="rounded-2xl border bg-background/75 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{tile.label}</span>
                    <Badge variant={tile.tone ?? "secondary"}>{tile.value}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-4 w-4" />
              2-Period Forecast Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">Historical CAGR moderated</Badge>
              <Badge variant="outline">Margins held near latest trend</Badge>
              <Badge variant="outline">Equity roll-forward included</Badge>
            </div>
            <FinancialTable rows={forecastRows} periods={forecastPeriods} unit={unit} currency={currency} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Insights & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-background/75 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current sheet</p>
              <p className="mt-2 text-lg font-semibold">{SHEET_LABELS[sheet]}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Financials now lives on a single company page, and the same UI contract can swap from demo data to official extracted statements.
              </p>
            </div>
            <Separator />
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              {insights.map((insight) => (
                <p key={insight}>{insight}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FinancialDashboardRoute({ companySlug }: FinancialDashboardRouteProps) {
  const [payload, setPayload] = React.useState<CompanyFinancialPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFinancials() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/company-financials?company=${encodeURIComponent(companySlug)}`);
        if (!response.ok) {
          throw new Error(`Failed to load financials for ${companySlug}`);
        }

        const nextPayload = (await response.json()) as CompanyFinancialPayload;
        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadFinancials();

    return () => {
      cancelled = true;
    };
  }, [companySlug]);

  if (isLoading) {
    return <FinancialDashboardSkeleton />;
  }

  if (error || !payload) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load financial dashboard</AlertTitle>
        <AlertDescription>{error ?? "No financial payload returned."}</AlertDescription>
      </Alert>
    );
  }

  return <FinancialDashboardView payload={payload} />;
}

export default function CompanyFinancialsPage() {
  const params = useParams<{ company?: string | string[] }>();
  const companySlug = React.useMemo(() => {
    const rawCompany = params?.company;
    if (Array.isArray(rawCompany)) return rawCompany[0] ?? "nvda";
    return rawCompany ?? "nvda";
  }, [params]);

  return <FinancialDashboardRoute companySlug={companySlug} />;
}