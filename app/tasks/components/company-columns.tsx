"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { Doc } from "@/convex/_generated/dataModel";
import { DataTableColumnHeader } from "./data-table-column-header";
import { CompanyRowActions } from "./company-row-actions";
import { CompanyPriceCell } from "./company-price-cell";

export type CompanyRow = Doc<"companies">;

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
      return (
        <Link
          href={`/company/${encodeURIComponent(ticker)}/documents`}
          className="font-medium text-primary hover:underline"
        >
          {ticker}
        </Link>
      );
    },
    filterFn: (row, _id, value) => {
      const q = String(value).toLowerCase().trim();
      if (!q) return true;
      const c = row.original;
      const hay = [c.ticker, c.name, c.description, c.latestFilingDate]
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
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("description") as string | undefined;
      if (!v) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="text-muted-foreground max-w-70 truncate" title={v}>
          {v}
        </span>
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
