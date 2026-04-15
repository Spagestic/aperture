import type { Market } from "@/lib/polymarket-events";

export function normalizeSlug(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractSlugFromInput(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const lastSegment = segments.at(-1) || "";
    return normalizeSlug(decodeURIComponent(lastSegment || raw));
  } catch {
    const cleaned = raw
      .replace(/^https?:\/\//i, "")
      .split(/[?#]/)[0]
      .split("/")
      .filter(Boolean)
      .at(-1);

    return normalizeSlug(decodeURIComponent(cleaned || raw));
  }
}

export function marketTitle(market: Market, index: number) {
  return market.question || `Market ${index + 1}`;
}
