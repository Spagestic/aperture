// app/api/firecrawl/scrape/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  FirecrawlScrapeRequestBody,
  FirecrawlScrapeResponseBody,
  FirecrawlScrapeResult,
  FormatOption,
} from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FirecrawlScrapeRequestBody;
    const { url, maxAge, storeInCache, actions, schema, prompt } = body;

    if (!url) {
      return NextResponse.json<FirecrawlScrapeResponseBody>(
        { success: false, error: "URL is required" },
        { status: 400 },
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json<FirecrawlScrapeResponseBody>(
        { success: false, error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const formats: FormatOption[] = ["markdown", "links"];

    if (schema || prompt) {
      formats.push({
        type: "json",
        ...(schema ? { schema } : {}),
        ...(prompt ? { prompt } : {}),
      });
    }

    const scrapeResult = (await firecrawl.scrape(url, {
      formats,
      ...(actions && actions.length > 0 ? { actions } : {}),
      excludeTags: ["script", "style", "noscript", "iframe"],
      onlyMainContent: true,
      maxAge: maxAge ?? 172800000,
      storeInCache: storeInCache ?? true,
      timeout: 120000,
    })) as FirecrawlScrapeResult;

    const responseBody: FirecrawlScrapeResponseBody = {
      success: true,
      markdown: scrapeResult.markdown,
      html: scrapeResult.html,
      rawHtml: scrapeResult.rawHtml,
      json: scrapeResult.json ?? null,
      metadata: scrapeResult.metadata,
      screenshot: scrapeResult.screenshot,
      links: scrapeResult.links,
      actions: scrapeResult.actions,
    };

    return NextResponse.json<FirecrawlScrapeResponseBody>(responseBody);
  } catch (error) {
    console.error("Firecrawl scrape error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown scraping error";

    return NextResponse.json<FirecrawlScrapeResponseBody>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
