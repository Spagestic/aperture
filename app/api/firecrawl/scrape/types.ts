// app/api/firecrawl/scrape/types.ts
import type Firecrawl from "@mendable/firecrawl-js";

type ScrapeOptions = NonNullable<Parameters<Firecrawl["scrape"]>[1]>;
export type FormatOption = NonNullable<ScrapeOptions["formats"]>[number];
export type ActionOption = NonNullable<ScrapeOptions["actions"]>[number];

export interface FirecrawlScrapeRequestBody {
  url: string;
  maxAge?: number;
  storeInCache?: boolean;
  actions?: ActionOption[];
  schema?: Record<string, unknown>;
  prompt?: string;
}

export interface ScrapeMetadata {
  title?: string | string[];
  description?: string | string[];
  language?: string | string[];
  keywords?: string | string[];
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  ogSiteName?: string;
  sourceURL?: string;
  url?: string;
  statusCode?: number;
  error?: string | null;
  [key: string]: unknown;
}

export interface FirecrawlScrapeResult {
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  screenshot?: string;
  json?: Record<string, unknown>;
  metadata?: ScrapeMetadata;
  actions?: {
    screenshots?: string[];
    scrapes?: Array<{ url: string; html: string }>;
  };
}

export interface FirecrawlScrapeResponseBody {
  success: boolean;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  json?: Record<string, unknown> | null;
  metadata?: ScrapeMetadata;
  screenshot?: string;
  links?: string[];
  actions?: FirecrawlScrapeResult["actions"];
  error?: string;
}
