"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "./data-table-column-header";
import { CompanyRowActions } from "./company-row-actions";
import { CompanyPriceCell } from "./company-price-cell";

export type CompanyRow = {
  ticker: string;
  name: string;
  exchange: string;
  websiteUrl?: string;
  latestFilingDate?: string;
  country?: string;
  sector?: string;
  industry?: string;
  currency?: string;
  listedBoard?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  boardLot?: string;
  isin?: string;
  rmbCounter?: string;
};

function formatFilingDate(isoDay: string): string {
  try {
    return new Intl.DateTimeFormat("en-HK", {
      dateStyle: "medium",
    }).format(new Date(`${isoDay}T12:00:00`));
  } catch {
    return isoDay;
  }
}

export const companyColumns: ColumnDef<CompanyRow>[] = [
  {
    accessorKey: "ticker",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ticker" />
    ),
    cell: ({ row }) => {
      const ticker = row.getValue("ticker") as string;
      return <span className="font-medium text-primary">{ticker}</span>;
    },
    filterFn: (row, _id, value) => {
      const q = String(value).toLowerCase().trim();
      if (!q) return true;
      const c = row.original;
      const hay = [c.ticker, c.name, c.boardLot, c.currency, c.latestFilingDate]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="max-w-105 truncate">{row.getValue("name")}</span>
    ),
  },

  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price (Yahoo)" />
    ),
    cell: ({ row }) => <CompanyPriceCell ticker={row.original.ticker} />,
    enableSorting: false,
  },
  {
    accessorKey: "boardLot",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Board Lot" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("boardLot") as string | undefined;
      return v ? (
        <span className="tabular-nums">{v}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trading Currency" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("currency") as string | undefined;
      return v ? (
        <span className="tabular-nums">{v}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "latestFilingDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Latest filing" />
    ),
    cell: ({ row }) => {
      const d = row.getValue("latestFilingDate") as string | undefined;
      if (!d) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="text-muted-foreground tabular-nums" title={d}>
          {formatFilingDate(d)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CompanyRowActions row={row} />,
  },
];
