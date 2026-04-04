"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { companyColumns, type CompanyRow } from "./company-columns";
import { CompanyDataTable } from "./company-data-table";
import {
  formatListedTicker,
  hkexSecuritiesPriceUrl,
} from "@/lib/hkexUrls";
import type { SecurityRecord } from "../lib/load-securities";

function formatDescription(record: SecurityRecord): string {
  return [
    record.Category,
    record["Sub-Category"],
    `Board lot ${record["Board Lot"]}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function toCompanyRow(record: SecurityRecord): CompanyRow {
  const ticker = formatListedTicker(record["Stock Code"]);

  return {
    ticker,
    name: record["Name of Securities"],
    exchange: record["Sub-Category"],
    websiteUrl: hkexSecuritiesPriceUrl(ticker),
    description: formatDescription(record),
    category: record.Category,
    subCategory: record["Sub-Category"],
    boardLot: record["Board Lot"],
    isin: record.ISIN ?? undefined,
    currency: record["Trading Currency"],
    rmbCounter:
      record["RMB Counter"] === null
        ? undefined
        : String(record["RMB Counter"]),
  };
}

interface CompaniesTableClientProps {
  securities: SecurityRecord[];
}

export function CompaniesTableClient({
  securities,
}: CompaniesTableClientProps) {
  const companies = securities.map(toCompanyRow);

  if (companies.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <CompanyDataTable columns={companyColumns} data={companies} />;
}
