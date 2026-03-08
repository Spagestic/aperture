import type Firecrawl from "@mendable/firecrawl-js";

type FirecrawlMapOptions = NonNullable<Parameters<Firecrawl["map"]>[1]>;
type FirecrawlMapResult = Awaited<ReturnType<Firecrawl["map"]>>;

export type SitemapMode = NonNullable<FirecrawlMapOptions["sitemap"]>;

export interface MapRequestBody extends FirecrawlMapOptions {
  url?: string;
}

export type MapResponseBody = FirecrawlMapResult;

export interface MapErrorResponse {
  error: string;
  detail?: string;
}
