export type Market = {
  id: string;
  question?: string;
  outcomes?: string[] | string;
  outcomePrices?: string[] | string;
  volume24hr?: number | string;
  liquidity?: number | string;
};

export type EventItem = {
  id: string;
  title?: string;
  slug?: string;
  category?: string;
  volume24hr?: number | string;
  liquidity?: number | string;
  startDate?: string;
  endDate?: string;
  image?: string;
  icon?: string;
  markets?: Market[];
};

export type PolymarketEvent = EventItem & {
  subtitle?: string;
  description?: string;
  resolutionSource?: string;
  startDate?: string;
  creationDate?: string;
  endDate?: string;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  featured?: boolean;
  restricted?: boolean;
  liquidity?: number | string;
  volume?: number | string;
  openInterest?: number | string;
  category?: string;
  subcategory?: string;
  image?: string;
  icon?: string;
  commentsEnabled?: boolean;
  markets?: Market[];
  tags?: Array<{ id?: string; label?: string; slug?: string }>;
  categories?: Array<{ id?: string; label?: string; slug?: string }>;
  published_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TopOutcome = {
  name: string;
  probability: string;
};

function buildGammaEventFeedUrls(offset: number, limit: number): string[] {
  const o = String(Math.max(0, offset));
  const l = String(Math.max(1, limit));
  return [
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&order=volume_24hr&ascending=false&limit=${l}&offset=${o}`,
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&order=volume24hr&ascending=false&limit=${l}&offset=${o}`,
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&limit=${l}&offset=${o}`,
  ];
}

const DEFAULT_EVENTS_LIMIT = 24;

export async function getEventsPage(
  params: { offset: number; limit: number },
  init?: RequestInit,
): Promise<EventItem[]> {
  const { offset, limit } = params;
  const urls = buildGammaEventFeedUrls(offset, limit);

  for (const url of urls) {
    // Gamma often returns >2MB per page; Next.js fetch cache rejects entries over 2MB.
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...init,
      cache: "no-store",
    });

    if (res.ok) {
      return res.json();
    }

    if (res.status !== 422) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch events from Polymarket (${res.status}): ${body || res.statusText}`,
      );
    }
  }

  return [];
}

export async function getEvents(): Promise<EventItem[]> {
  return getEventsPage({ offset: 0, limit: DEFAULT_EVENTS_LIMIT });
}

export async function getEventBySlug(
  slug: string,
  options?: {
    includeChat?: boolean;
    includeTemplate?: boolean;
  },
  init?: RequestInit,
): Promise<PolymarketEvent | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const params = new URLSearchParams();
  if (options?.includeChat) params.set("include_chat", "true");
  if (options?.includeTemplate) params.set("include_template", "true");

  const query = params.toString();
  const url = `https://gamma-api.polymarket.com/events/slug/${encodeURIComponent(normalizedSlug)}${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    ...init,
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch Polymarket event (${res.status}): ${body || res.statusText}`,
    );
  }

  return (await res.json()) as PolymarketEvent;
}

type GammaPublicSearchResponse = {
  events?: EventItem[] | null;
};

/**
 * Server-side search across Polymarket’s catalog via Gamma public-search
 * (not limited to the first page of the volume-sorted events feed).
 */
export async function searchPublicEvents(
  query: string,
  limitPerType: number,
  init?: RequestInit,
): Promise<EventItem[]> {
  const q = query.trim();
  if (!q) return [];

  const capped = Math.max(1, Math.min(Math.floor(limitPerType), 50));
  const params = new URLSearchParams({
    q,
    limit_per_type: String(capped),
    search_profiles: "false",
  });

  const url = `https://gamma-api.polymarket.com/public-search?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    ...init,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to search Polymarket (${res.status}): ${body || res.statusText}`,
    );
  }

  const data = (await res.json()) as GammaPublicSearchResponse;
  const events = data.events;
  if (!Array.isArray(events)) return [];
  return events.slice(0, capped);
}

export function buildEventSearchText(event: EventItem) {
  const marketText = (event.markets ?? [])
    .flatMap((market) => [market.question, market.id])
    .filter(Boolean)
    .join(" ");

  return [event.title, event.category, event.slug, marketText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function formatMoney(value?: string | number) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: num >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatDate(value?: string) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function parseArray(value?: string[] | string) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function topOutcome(market?: Market): TopOutcome | null {
  if (!market) return null;
  const outcomes = parseArray(market.outcomes);
  const prices = parseArray(market.outcomePrices)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  if (!outcomes.length || !prices.length) return null;

  let bestIndex = 0;
  for (let i = 1; i < Math.min(outcomes.length, prices.length); i++) {
    if (prices[i] > prices[bestIndex]) bestIndex = i;
  }

  return {
    name: outcomes[bestIndex],
    probability: `${Math.round(prices[bestIndex] * 100)}%`,
  };
}
