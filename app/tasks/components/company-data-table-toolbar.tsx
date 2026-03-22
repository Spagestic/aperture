"use client";

import { Table } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CompanyRow } from "./company-columns";

interface CompanyDataTableToolbarProps {
  table: Table<CompanyRow>;
}

export function CompanyDataTableToolbar({
  table,
}: CompanyDataTableToolbarProps) {
  const tickerCol = table.getColumn("ticker");
  const filterValue = (tickerCol?.getFilterValue() as string) ?? "";
  const isFiltered = filterValue.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter by name, ticker, description, or filing date..."
          value={filterValue}
          onChange={(event) => tickerCol?.setFilterValue(event.target.value)}
          className="h-8 w-42 lg:w-70"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
            }}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <Button size="sm" className="h-8">
        <Plus className="mr-2 h-4 w-4" />
        Add Company
      </Button>
    </div>
  );
}
