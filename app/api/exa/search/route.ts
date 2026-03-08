/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      type = "auto", // auto, instant, deep, deep-reasoning, deep-max
      numResults = 10,
      contents,
      useAutoprompt,
      category, // company, people, research paper, news, tweet, personal site, financial report
      startPublishedDate,
      endPublishedDate,
      includeDomains,
      excludeDomains,
      startCrawlDate,
      endCrawlDate,
      maxAgeHours, // 0 = always livecrawl, -1 = never livecrawl, omit for default
      outputSchema, // For deep search types
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    // Validate numResults range
    if (numResults < 1 || numResults > 100) {
      return NextResponse.json(
        { error: "numResults must be between 1 and 100" },
        { status: 400 },
      );
    }

    // Validate outputSchema for deep search types
    if (
      outputSchema &&
      !["deep", "deep-reasoning", "deep-max"].includes(type)
    ) {
      return NextResponse.json(
        { error: "outputSchema is only valid for deep search types" },
        { status: 400 },
      );
    }

    const result = await exa.search(query, {
      type,
      numResults,
      contents,
      useAutoprompt,
      category,
      startPublishedDate,
      endPublishedDate,
      includeDomains,
      excludeDomains,
      startCrawlDate,
      endCrawlDate,
      ...(maxAgeHours !== undefined && { maxAgeHours }),
      ...(outputSchema && { outputSchema }),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Exa search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform search" },
      { status: 500 },
    );
  }
}
