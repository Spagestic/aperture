// app/api/firecrawl/map/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  MapErrorResponse,
  MapRequestBody,
  MapResponseBody,
  SitemapMode,
} from "./types";

type MapError = {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

function createErrorResponse(error: string, status: number, detail?: string) {
  const body: MapErrorResponse = {
    error,
    ...(detail ? { detail } : {}),
  };

  return NextResponse.json<MapErrorResponse>(body, { status });
}

export async function POST(req: NextRequest) {
  let body: MapRequestBody;

  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON body", 400);
  }

  const {
    url,
    limit,
    sitemap,
    search,
    location,
    includeSubdomains,
    ignoreQueryParameters,
    timeout,
  } = body;

  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return createErrorResponse("url is required and must be a string", 400);
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return createErrorResponse("Invalid URL format", 400);
  }

  const parsedLimit =
    typeof limit === "number" && Number.isFinite(limit) && limit > 0
      ? Math.min(limit, 100000)
      : undefined;

  if (limit !== undefined && parsedLimit === undefined) {
    return createErrorResponse("limit must be a positive number", 400);
  }

  if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
    return createErrorResponse("timeout must be a non-negative number", 400);
  }

  const sitemapMode: SitemapMode =
    sitemap === "include" || sitemap === "skip" || sitemap === "only"
      ? sitemap
      : "include";

  try {
    const result = await firecrawl.map(normalizedUrl, {
      ...(parsedLimit !== undefined ? { limit: parsedLimit } : {}),
      ...(sitemap ? { sitemap: sitemapMode } : {}),
      ...(search ? { search } : {}),
      ...(location ? { location } : {}),
      ...(includeSubdomains !== undefined ? { includeSubdomains } : {}),
      ...(ignoreQueryParameters !== undefined ? { ignoreQueryParameters } : {}),
      ...(timeout !== undefined ? { timeout } : {}),
    });

    return NextResponse.json<MapResponseBody>(result, { status: 200 });
  } catch (error) {
    const normalizedError =
      typeof error === "object" && error !== null
        ? (error as MapError)
        : undefined;

    console.error("map error", {
      message: normalizedError?.message ?? String(error),
      response: normalizedError?.response?.data,
    });

    if (normalizedError?.response?.status === 401) {
      return createErrorResponse("Unauthorized - check API key", 401);
    }

    if (normalizedError?.response?.status === 402) {
      return createErrorResponse("Payment required", 402);
    }

    if (normalizedError?.response?.status === 429) {
      return createErrorResponse("Rate limit exceeded", 429);
    }

    // Try to surface provider error details if they exist
    const detail =
      typeof normalizedError?.response?.data === "string"
        ? normalizedError.response.data
        : (normalizedError?.message ?? "Unknown error from Firecrawl");

    return createErrorResponse("Map failed", 502, detail);
  }
}
