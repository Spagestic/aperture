import { readFile } from "node:fs/promises";
import path from "node:path";

import { formatListedTicker } from "@/lib/hkexUrls";

export type SecurityRecord = {
  "Stock Code": number;
  "Name of Securities": string;
  Category: string;
  "Sub-Category": string;
  "Board Lot": string;
  ISIN: string | null;
  "Trading Currency": string;
  "RMB Counter": number | null;
};

const securitiesPath = path.join(
  process.cwd(),
  "data",
  "ListOfSecurities.json",
);

export async function loadSecurities(): Promise<SecurityRecord[]> {
  const file = await readFile(securitiesPath, "utf8");

  return file
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SecurityRecord);
}

export function getSecurityByTicker(
  ticker: string,
  securities: SecurityRecord[],
): SecurityRecord | undefined {
  return securities.find(
    (r) => formatListedTicker(r["Stock Code"]) === ticker,
  );
}
