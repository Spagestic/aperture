import type Firecrawl from "@mendable/firecrawl-js";
import type { SearchData } from "@mendable/firecrawl-js";

type SearchOptions = NonNullable<Parameters<Firecrawl["search"]>[1]>;

export type SearchSource = "web" | "images" | "news";
export type CategoryType = "github" | "research" | "pdf";
export type SearchCategory = CategoryType | { type: CategoryType };
export type SearchScrapeOptions = NonNullable<SearchOptions["scrapeOptions"]>;

export interface SearchRequestBody extends Omit<
  SearchOptions,
  "categories" | "sources"
> {
  query: string;
  sources?: SearchSource[];
  categories?: SearchCategory[];
  country?: string;
  scrapeOptions?: SearchScrapeOptions;
}

export interface SearchResponseBody {
  success: boolean;
  data?: SearchData;
  warning?: string | null;
  id?: string;
  creditsUsed?: number;
  error?: string;
  detail?: string;
}
