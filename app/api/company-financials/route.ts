import { NextRequest, NextResponse } from "next/server";

import { getDemoCompanyFinancialPayload } from "@/lib/financial-dashboard";

export async function GET(request: NextRequest) {
  const company = request.nextUrl.searchParams.get("company") ?? "nvda";

  const payload = getDemoCompanyFinancialPayload(company);

  return NextResponse.json(payload);
}
