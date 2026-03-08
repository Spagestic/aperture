// app/api/firecrawl/crawl/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  FirecrawlCrawlRequestBody,
  FirecrawlCrawlResponseBody,
} from "./types";

type FirecrawlCrawlOptions = NonNullable<
  Parameters<typeof firecrawl.startCrawl>[1]
>;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FirecrawlCrawlRequestBody;

    // Input validation
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "url is required" },
        { status: 400 },
      );
    }

    // URL validation
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const { url, maxDepth, maxPages, crawlOptions, pollInterval, timeout } =
      body;

    const normalizedTimeout = timeout ?? 600;

    if (normalizedTimeout < 1) {
      return NextResponse.json<FirecrawlCrawlResponseBody>(
        { success: false, error: "timeout must be greater than 0" },
        { status: 400 },
      );
    }

    if (pollInterval !== undefined && pollInterval < 1) {
      return NextResponse.json<FirecrawlCrawlResponseBody>(
        { success: false, error: "pollInterval must be greater than 0" },
        { status: 400 },
      );
    }

    const scrapeOptions =
      crawlOptions?.scrapeOptions ??
      (crawlOptions?.formats ? { formats: crawlOptions.formats } : undefined);

    const crawlRequest: FirecrawlCrawlOptions & {
      pollInterval?: number;
      timeout?: number;
    } = {
      ...(crawlOptions?.includePaths
        ? { includePaths: crawlOptions.includePaths }
        : {}),
      ...(crawlOptions?.excludePaths
        ? { excludePaths: crawlOptions.excludePaths }
        : {}),
      ...(crawlOptions?.prompt ? { prompt: crawlOptions.prompt } : {}),
      ...(crawlOptions?.maxDiscoveryDepth !== undefined ||
      maxDepth !== undefined
        ? { maxDiscoveryDepth: crawlOptions?.maxDiscoveryDepth ?? maxDepth }
        : {}),
      ...(crawlOptions?.sitemap ? { sitemap: crawlOptions.sitemap } : {}),
      ...(crawlOptions?.ignoreQueryParameters !== undefined
        ? { ignoreQueryParameters: crawlOptions.ignoreQueryParameters }
        : {}),
      ...(crawlOptions?.regexOnFullURL !== undefined
        ? { regexOnFullURL: crawlOptions.regexOnFullURL }
        : {}),
      ...(crawlOptions?.limit !== undefined || maxPages !== undefined
        ? { limit: crawlOptions?.limit ?? maxPages }
        : {}),
      ...(crawlOptions?.crawlEntireDomain !== undefined
        ? { crawlEntireDomain: crawlOptions.crawlEntireDomain }
        : {}),
      ...(crawlOptions?.allowExternalLinks !== undefined
        ? { allowExternalLinks: crawlOptions.allowExternalLinks }
        : {}),
      ...(crawlOptions?.allowSubdomains !== undefined
        ? { allowSubdomains: crawlOptions.allowSubdomains }
        : {}),
      ...(crawlOptions?.delay !== undefined
        ? { delay: crawlOptions.delay }
        : {}),
      ...(crawlOptions?.maxConcurrency !== undefined
        ? { maxConcurrency: crawlOptions.maxConcurrency }
        : {}),
      ...(crawlOptions?.webhook ? { webhook: crawlOptions.webhook } : {}),
      ...(crawlOptions?.zeroDataRetention !== undefined
        ? { zeroDataRetention: crawlOptions.zeroDataRetention }
        : {}),
      ...(scrapeOptions ? { scrapeOptions } : {}),
      pollInterval: pollInterval ?? 2,
      timeout: normalizedTimeout,
    };

    const crawlJob = await firecrawl.crawl(url, crawlRequest);

    // Transform CrawlJob to your response format
    const response: FirecrawlCrawlResponseBody = {
      success: true,
      status: crawlJob.status,
      completed: crawlJob.completed,
      total: crawlJob.total,
      creditsUsed: crawlJob.creditsUsed,
      expiresAt: crawlJob.expiresAt,
      next: crawlJob.next ?? undefined,
      data: crawlJob.data ?? undefined,
      id: crawlJob.id ?? undefined,
    };

    return NextResponse.json<FirecrawlCrawlResponseBody>(response);
  } catch (error) {
    console.error("Crawl error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const errorResponse =
      typeof error === "object" && error !== null
        ? (error as {
            message?: string;
            response?: { status?: number };
          })
        : undefined;

    // Handle specific error types
    if (
      errorResponse?.response?.status === 429 ||
      errorResponse?.message?.toLowerCase().includes("rate limit")
    ) {
      return NextResponse.json<FirecrawlCrawlResponseBody>(
        {
          success: false,
          error: "Rate limit exceeded",
          detail: errorResponse?.message,
        },
        { status: 429 },
      );
    }

    if (
      errorResponse?.response?.status === 401 ||
      errorResponse?.message?.toLowerCase().includes("authentication")
    ) {
      return NextResponse.json<FirecrawlCrawlResponseBody>(
        { success: false, error: "Authentication failed" },
        { status: 401 },
      );
    }

    if (errorResponse?.response?.status === 408) {
      return NextResponse.json<FirecrawlCrawlResponseBody>(
        { success: false, error: "Crawl timed out" },
        { status: 408 },
      );
    }

    return NextResponse.json<FirecrawlCrawlResponseBody>(
      {
        success: false,
        error: "Crawl failed",
        detail: errorResponse?.message,
      },
      { status: 500 },
    );
  }
}
