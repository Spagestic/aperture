"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

import { companyColumns } from "./company-columns";
import { CompanyDataTable } from "./company-data-table";

export function CompaniesTableClient() {
  const companies = useQuery(api.companies.list, {});

  if (companies === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <CompanyDataTable columns={companyColumns} data={companies} />;
}
