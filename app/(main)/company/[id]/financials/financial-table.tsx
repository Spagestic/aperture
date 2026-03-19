import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CurrencyCode, DisplayUnit, StatementRow } from "@/lib/financial-dashboard";

import { formatValue } from "./financial-dashboard-utils";

type FinancialTableProps = {
  rows: StatementRow[];
  periods: string[];
  unit: DisplayUnit;
  currency: CurrencyCode;
};

export function FinancialTable({ rows, periods, unit, currency }: FinancialTableProps) {
  return (
    <ScrollArea className="h-[32rem] w-full whitespace-nowrap rounded-2xl border bg-background/80">
      <div className="min-w-[1040px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 top-0 z-20 min-w-[300px] bg-background">Line Item</TableHead>
              {periods.map((period) => (
                <TableHead
                  key={period}
                  className="sticky top-0 z-10 bg-background text-right text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
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