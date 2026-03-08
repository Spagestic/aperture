/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      urls,
      text,
      highlights,
      summary,
      maxAgeHours,
      livecrawl = false,
    } = body;

    // Validate that either url or urls is provided
    if (!url && (!urls || !Array.isArray(urls) || urls.length === 0)) {
      return NextResponse.json(
        { error: "Either url (string) or urls (array) parameter is required" },
        { status: 400 },
      );
    }

    // Convert single url to array format
    const urlsToScrape = url ? [url] : urls;

    // Validate URLs
    if (urlsToScrape.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 URLs can be scraped at once" },
        { status: 400 },
      );
    }

    const result = await exa.getContents(urlsToScrape, {
      text,
      highlights,
      summary,
      ...(maxAgeHours !== undefined && { maxAgeHours }),
      ...(livecrawl && { livecrawl }),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Exa scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape URL(s)" },
      { status: 500 },
    );
  }
}

// GET method for simple single URL scraping via query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const includeText = searchParams.get("text") === "true";
    const includeHighlights = searchParams.get("highlights") === "true";
    const includeSummary = searchParams.get("summary") === "true";
    const maxCharacters = searchParams.get("maxCharacters");
    const livecrawl = searchParams.get("livecrawl") === "true";

    if (!url) {
      return NextResponse.json(
        { error: "url query parameter is required" },
        { status: 400 },
      );
    }

    const options: any = {};

    if (includeText) {
      options.text = maxCharacters
        ? { maxCharacters: parseInt(maxCharacters) }
        : true;
    }

    if (includeHighlights) {
      options.highlights = maxCharacters
        ? { maxCharacters: parseInt(maxCharacters) }
        : true;
    }

    if (includeSummary) {
      options.summary = true;
    }

    if (livecrawl) {
      options.livecrawl = true;
    }

    // If no content type specified, default to highlights
    if (!includeText && !includeHighlights && !includeSummary) {
      options.highlights = { maxCharacters: 4000 };
    }

    const result = await exa.getContents([url], options);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Exa scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape URL" },
      { status: 500 },
    );
  }
}
