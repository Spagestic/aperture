"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CompanyFinancialPayload } from "@/lib/financial-dashboard";

import { FinancialDashboardSkeleton } from "./financial-dashboard-skeleton";
import { FinancialDashboardView } from "./financial-dashboard-view";

type FinancialDashboardRouteProps = {
  companySlug: string;
};

export function FinancialDashboardRoute({
  companySlug,
}: FinancialDashboardRouteProps) {
  const [payload, setPayload] = React.useState<CompanyFinancialPayload | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFinancials() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/company-financials?company=${encodeURIComponent(companySlug)}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load financials for ${companySlug}`);
        }

        const nextPayload = (await response.json()) as CompanyFinancialPayload;
        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : "Unknown error",
          );
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
        <AlertDescription>
          {error ?? "No financial payload returned."}
        </AlertDescription>
      </Alert>
    );
  }

  return <FinancialDashboardView payload={payload} />;
}

export default function CompanyFinancialsPage() {
  const params = useParams<{ company?: string | string[] }>();
  const companySlug = React.useMemo(() => {
    const rawCompany = params?.company;
    if (Array.isArray(rawCompany)) return rawCompany[0] ?? "0700.HK";
    return rawCompany ?? "0700.HK";
  }, [params]);

  return <FinancialDashboardRoute companySlug={companySlug} />;
}
