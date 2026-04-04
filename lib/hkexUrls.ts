/** Listed ticker string from HKEX stock code, e.g. `5` → `0005.HK`. */
export function formatListedTicker(stockCode: number): string {
  return `${String(stockCode).padStart(4, "0")}.HK`;
}

/** HKEX page for this symbol — derived from listing data (ticker / stock code). Used as the Firecrawl map seed. */
export function hkexSecuritiesPriceUrl(ticker: string): string {
  return `https://www.hkex.com.hk/Market-Data/Securities-Prices/Equities?sc_lang=en&symbol=${encodeURIComponent(ticker)}`;
}
