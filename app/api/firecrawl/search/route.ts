// app/api/firecrawl/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  CategoryType,
  SearchRequestBody,
  SearchResponseBody,
  SearchSource,
} from "./types";

const VALID_SOURCES: SearchSource[] = ["web", "images", "news"];
const VALID_CATEGORIES: CategoryType[] = ["github", "research", "pdf"];

type FirecrawlSearchOptions = NonNullable<
  Parameters<typeof firecrawl.search>[1]
> & {
  country?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: SearchRequestBody = await req.json();
    const {
      query,
      limit = 5,
      sources = ["web"],
      categories,
      tbs,
      location,
      country = "US",
      timeout = 60000,
      ignoreInvalidURLs = false,
      scrapeOptions,
    } = body;

    const normalizedQuery = query?.trim();

    // Validation
    if (!normalizedQuery) {
      return NextResponse.json<SearchResponseBody>(
        { success: false, error: "Valid query string is required" },
        { status: 400 },
      );
    }

    // Validate limit range (1-100 per API docs)
    if (limit < 1 || limit > 100) {
      return NextResponse.json<SearchResponseBody>(
        { success: false, error: "limit must be between 1 and 100" },
        { status: 400 },
      );
    }

    // Validate sources
    if (sources.some((source) => !VALID_SOURCES.includes(source))) {
      return NextResponse.json<SearchResponseBody>(
        {
          success: false,
          error: `Invalid sources. Must be one of: ${VALID_SOURCES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const normalizedCategories = categories?.map((category) =>
      typeof category === "string" ? category : category.type,
    );

    if (
      normalizedCategories?.some(
        (category) => !VALID_CATEGORIES.includes(category),
      )
    ) {
      return NextResponse.json<SearchResponseBody>(
        {
          success: false,
          error: `Invalid categories. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Build search options
    const searchOptions: FirecrawlSearchOptions = {
      limit,
      sources,
      country,
      timeout,
      ignoreInvalidURLs,
    };

    // Only include optional parameters if provided
    if (normalizedCategories && normalizedCategories.length > 0) {
      searchOptions.categories = normalizedCategories;
    }
    if (tbs) {
      searchOptions.tbs = tbs;
    }
    if (location) {
      searchOptions.location = location;
    }
    if (scrapeOptions) {
      searchOptions.scrapeOptions = scrapeOptions;
    }

    // Execute search
    const result = await firecrawl.search(normalizedQuery, searchOptions);

    // Return successful result with metadata
    const responseBody: SearchResponseBody = {
      success: true,
      data: result,
    };

    return NextResponse.json<SearchResponseBody>(responseBody);
  } catch (error) {
    console.error("Search endpoint error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      response:
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : undefined,
    });

    const errorResponse =
      typeof error === "object" && error !== null
        ? (error as {
            message?: string;
            response?: { status?: number };
          })
        : undefined;

    // Distinguish between different error types
    if (errorResponse?.response?.status === 401) {
      return NextResponse.json<SearchResponseBody>(
        { success: false, error: "Unauthorized - check API key" },
        { status: 401 },
      );
    }

    if (errorResponse?.response?.status === 408) {
      return NextResponse.json<SearchResponseBody>(
        { success: false, error: "Search timed out" },
        { status: 408 },
      );
    }

    if (errorResponse?.response?.status === 429) {
      return NextResponse.json<SearchResponseBody>(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    return NextResponse.json<SearchResponseBody>(
      {
        success: false,
        error: "Search failed",
        detail: errorResponse?.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
