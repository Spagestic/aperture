/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      subpages = 10,
      subpageTarget = [],
      text,
      highlights,
      summary,
      maxAgeHours,
      livecrawlTimeout = 12000,
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: "url parameter is required" },
        { status: 400 },
      );
    }

    if (subpages < 1 || subpages > 50) {
      return NextResponse.json(
        { error: "subpages must be between 1 and 50" },
        { status: 400 },
      );
    }

    const options: any = {
      subpages,
      livecrawlTimeout,
    };

    if (subpageTarget.length > 0) {
      options.subpageTarget = subpageTarget;
    }

    // Add content options
    if (text !== undefined) options.text = text;
    if (highlights !== undefined) options.highlights = highlights;
    if (summary !== undefined) options.summary = summary;

    // Add freshness options
    if (maxAgeHours !== undefined) options.maxAgeHours = maxAgeHours;

    const result = await exa.getContents([url], options);

    // Enhanced response with subpage information
    const processedResult = {
      ...result,
      crawlSummary: {
        baseUrl: url,
        requestedSubpages: subpages,
        targetKeywords: subpageTarget,
        totalPagesReturned: result.results?.length || 0,
        successful:
          result.statuses?.filter((s: any) => s.status === "success").length ||
          0,
        failed:
          result.statuses?.filter((s: any) => s.status === "error").length || 0,
      },
    };

    return NextResponse.json(processedResult);
  } catch (error: any) {
    console.error("Exa subpage scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape subpages" },
      { status: 500 },
    );
  }
}
