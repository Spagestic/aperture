import type Firecrawl from "@mendable/firecrawl-js";

type CrawlOptions = NonNullable<Parameters<Firecrawl["startCrawl"]>[1]>;
type CrawlJob = Awaited<ReturnType<Firecrawl["crawl"]>>;

export type FirecrawlCrawlOptions = CrawlOptions & {
  formats?: NonNullable<NonNullable<CrawlOptions["scrapeOptions"]>["formats"]>;
};

export interface FirecrawlCrawlRequestBody {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  crawlOptions?: FirecrawlCrawlOptions;
  pollInterval?: number; // seconds for waiter
  timeout?: number; // seconds for waiter
}

export type FirecrawlCrawlDocument = CrawlJob["data"][number];

export type FirecrawlCrawlStatus = CrawlJob["status"];

export interface FirecrawlCrawlResponseBody {
  success: boolean;
  status?: FirecrawlCrawlStatus;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string | Date;
  next?: string;
  data?: FirecrawlCrawlDocument[];
  id?: string;
  error?: string;
  detail?: string;
}
