/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      urls,
      text = true,
      highlights,
      summary,
      maxAgeHours,
      batchSize = 10, // Process in batches to avoid timeouts
    } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required and must not be empty" },
        { status: 400 },
      );
    }

    if (urls.length > 1000) {
      return NextResponse.json(
        {
          error:
            "Maximum 1000 URLs can be processed. Use pagination for larger sets.",
        },
        { status: 400 },
      );
    }

    // Process URLs in batches
    const results = [];
    const errors = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      try {
        const batchResult = await exa.getContents(batch, {
          text,
          highlights,
          summary,
          ...(maxAgeHours !== undefined && { maxAgeHours }),
        });

        results.push(...batchResult.results);
      } catch (error: any) {
        errors.push({
          batch: i / batchSize + 1,
          urls: batch,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      successfulScrapes: results.length,
      failedBatches: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Exa batch scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to batch scrape URLs" },
      { status: 500 },
    );
  }
}
