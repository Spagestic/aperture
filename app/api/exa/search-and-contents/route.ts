/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      type = "auto",
      numResults = 10,
      text,
      highlights,
      summary,
      maxAgeHours,
      category,
      includeDomains,
      excludeDomains,
      startPublishedDate,
      endPublishedDate,
      ...options
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    if (numResults < 1 || numResults > 100) {
      return NextResponse.json(
        { error: "numResults must be between 1 and 100" },
        { status: 400 },
      );
    }

    const result = await exa.searchAndContents(query, {
      type,
      numResults,
      text,
      highlights,
      summary,
      category,
      includeDomains,
      excludeDomains,
      startPublishedDate,
      endPublishedDate,
      ...(maxAgeHours !== undefined && { maxAgeHours }),
      ...options,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Exa searchAndContents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform search and contents" },
      { status: 500 },
    );
  }
}
