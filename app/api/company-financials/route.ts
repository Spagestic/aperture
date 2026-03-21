import { NextRequest, NextResponse } from "next/server";

import { fetchCompanyFinancials } from "@/lib/company-financials-api";
import { getDemoCompanyFinancialPayload } from "@/lib/financial-dashboard";

export async function GET(request: NextRequest) {
  const company = request.nextUrl.searchParams.get("company") ?? "0700.HK";
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    const payload = getDemoCompanyFinancialPayload(company);
    return NextResponse.json(payload);
  }

  const ticker = company.length <= 5 ? company.toUpperCase() : company;
  try {
    const payload = await fetchCompanyFinancials(ticker, apiKey);
    return NextResponse.json(payload);
  } catch {
    const payload = getDemoCompanyFinancialPayload(company);
    payload.message = "Live data temporarily unavailable; showing demo data.";
    return NextResponse.json(payload);
  }
}
