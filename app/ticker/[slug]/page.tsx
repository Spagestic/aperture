import { notFound } from "next/navigation";

import {
  getSecurityByTicker,
  loadSecurities,
} from "@/app/dashboard/lib/load-securities";
import { TickerWorkspaceClient } from "./ticker-workspace-client";

export default async function TickerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug);

  if (!ticker || !/^\d{4}\.HK$/i.test(ticker.trim())) {
    notFound();
  }

  const securities = await loadSecurities();
  const security = getSecurityByTicker(ticker, securities);

  return <TickerWorkspaceClient ticker={ticker} security={security} />;
}
