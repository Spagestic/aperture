import { Star } from "lucide-react";

import { ReactNode, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getDemoCompanyFinancialPayload } from "@/lib/financial-dashboard";
import { fetchCompanyFinancials } from "@/lib/company-financials-api";
import CompanyCard from "./company-card";
import { CompanyTabs } from "./company-tabs";
import { cacheLife, cacheTag } from "next/cache";

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

async function getCompanyPayload(ticker: string, id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("company-financials");
  cacheTag(`company:${ticker}`);

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  let payload = getDemoCompanyFinancialPayload(id);
  if (apiKey) {
    try {
      payload = await fetchCompanyFinancials(ticker, apiKey);
    } catch {
      payload = getDemoCompanyFinancialPayload(id);
    }
  }

  return payload;
}

export default function CompanyLayout(props: CompanyLayoutProps) {
  return (
    <Suspense fallback={<div className="px-4 py-6 md:px-6">Loading…</div>}>
      <CompanyLayoutContent {...props} />
    </Suspense>
  );
}

async function CompanyLayoutContent({ children, params }: CompanyLayoutProps) {
  const { id } = await params;
  const ticker = id.length <= 5 ? id.toUpperCase() : id;

  const payload = await getCompanyPayload(ticker, id);

  const profile = payload.company;

  return (
    <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
      {/* Top Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.ticker} · {profile.exchange}
              {profile.country ? ` · ${profile.country}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Star className="size-4" />
            Following
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Side */}
        <div className="w-full">
          <CompanyTabs id={id} />
          <div className="pt-4">{children}</div>
        </div>
        {/* Right Side */}
        <div className="space-y-6">
          <CompanyCard profile={profile} />
        </div>
      </div>
    </div>
  );
}
