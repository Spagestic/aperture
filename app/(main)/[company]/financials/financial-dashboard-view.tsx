import * as React from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  DollarSign,
  Download,
  LineChart,
  MoreHorizontal,
  Sigma,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CompanyFinancialPayload,
  CurrencyCode,
  DisplayUnit,
  FinancialDataset,
  PeriodView,
  SheetType,
  StatementRow,
} from "@/lib/financial-dashboard";

import {
  buildForecastRows,
  buildInsights,
  buildKeyStats,
  buildRatioTiles,
  formatCompactCurrency,
  getRow,
  nextForecastLabels,
  SHEET_LABELS,
  valueOrZero,
  VIEW_LABELS,
} from "./financial-dashboard-utils";
import { FinancialTable } from "./financial-table";

const DISPLAY_UNITS: DisplayUnit[] = ["thousands", "millions", "billions"];
const CURRENCIES: CurrencyCode[] = ["USD", "HKD", "RMB", "JPY", "VND", "EUR", "AUD", "KRW"];

type DashboardControlsProps = {
  payload: CompanyFinancialPayload;
  view: PeriodView;
  setView: (view: PeriodView) => void;
  unit: DisplayUnit;
  setUnit: (unit: DisplayUnit) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  data: FinancialDataset;
  fromPeriod: string;
  setFromPeriod: (value: string) => void;
  toPeriod: string;
  setToPeriod: (value: string) => void;
  latestPrice: number;
  latestMarketCap: number;
};

function DashboardControls({
  payload,
  view,
  setView,
  unit,
  setUnit,
  currency,
  setCurrency,
  data,
  fromPeriod,
  setFromPeriod,
  toPeriod,
  setToPeriod,
  latestPrice,
  latestMarketCap,
}: DashboardControlsProps) {
  return (
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
                      {DISPLAY_UNITS.map((value) => (
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
                        {CURRENCIES.map((value) => (
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
  );
}

type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

function SummaryCards({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type StatementExplorerProps = {
  sheet: SheetType;
  setSheet: (sheet: SheetType) => void;
  visiblePeriods: string[];
  filteredRows: StatementRow[];
  unit: DisplayUnit;
  currency: CurrencyCode;
};

function StatementExplorer({ sheet, setSheet, visiblePeriods, filteredRows, unit, currency }: StatementExplorerProps) {
  return (
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
  );
}

function AnalyticalRatios({ data }: { data: FinancialDataset }) {
  const ratioTiles = React.useMemo(() => buildRatioTiles(data), [data]);

  return (
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
  );
}

type ForecastCardProps = {
  forecastRows: StatementRow[];
  forecastPeriods: string[];
  unit: DisplayUnit;
  currency: CurrencyCode;
};

function ForecastCard({ forecastRows, forecastPeriods, unit, currency }: ForecastCardProps) {
  return (
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
  );
}

type InsightsCardProps = {
  sheet: SheetType;
  insights: string[];
};

function InsightsCard({ sheet, insights }: InsightsCardProps) {
  return (
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
  );
}

export function FinancialDashboardView({ payload }: { payload: CompanyFinancialPayload }) {
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

  const summaryMetrics = React.useMemo<SummaryMetric[]>(() => {
    const previousPeriod = data.periods[data.periods.length - 2];
    const currentRevenue = valueOrZero(getRow(data.income, "Total Revenue")?.values[latestPeriod]);
    const previousRevenue = valueOrZero(getRow(data.income, "Total Revenue")?.values[previousPeriod]);
    const revenueGrowth = previousRevenue ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : "0.0";

    return [
      {
        label: "Revenue",
        value: formatCompactCurrency(currentRevenue, unit, currency),
        detail: `Growth ${revenueGrowth}% vs previous period`,
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
    ];
  }, [currency, data, latestMarketCap, latestPeriod, unit]);

  return (
    <div className="space-y-6">
      {payload.sourceKind === "demo" && payload.message ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Official extract not connected yet</AlertTitle>
          <AlertDescription>{payload.message}</AlertDescription>
        </Alert>
      ) : null}

      <DashboardControls
        payload={payload}
        view={view}
        setView={setView}
        unit={unit}
        setUnit={setUnit}
        currency={currency}
        setCurrency={setCurrency}
        data={data}
        fromPeriod={fromPeriod}
        setFromPeriod={setFromPeriod}
        toPeriod={toPeriod}
        setToPeriod={setToPeriod}
        latestPrice={latestPrice}
        latestMarketCap={latestMarketCap}
      />

      <SummaryCards metrics={summaryMetrics} />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <StatementExplorer
          sheet={sheet}
          setSheet={setSheet}
          visiblePeriods={visiblePeriods}
          filteredRows={filteredRows}
          unit={unit}
          currency={currency}
        />
        <AnalyticalRatios data={data} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ForecastCard forecastRows={forecastRows} forecastPeriods={forecastPeriods} unit={unit} currency={currency} />
        <InsightsCard sheet={sheet} insights={insights} />
      </div>
    </div>
  );
}