// app/api/firecrawl/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  FirecrawlAgentErrorResponse,
  FirecrawlAgentRequestBody,
  FirecrawlAgentResponse,
  FirecrawlAgentStatusResponse,
} from "./types";

type AgentError = {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

function normalizeError(error: unknown): AgentError | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return error as AgentError;
}

function createErrorResponse(error: string, status: number, detail?: string) {
  const body: FirecrawlAgentErrorResponse = {
    success: false,
    error,
    ...(detail ? { detail } : {}),
  };

  return NextResponse.json<FirecrawlAgentErrorResponse>(body, { status });
}

// POST: start an agent job
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FirecrawlAgentRequestBody;

    const { prompt, urls, schema, maxCredits, strictConstrainToURLs, model } =
      body;

    const normalizedPrompt = prompt?.trim();

    if (!normalizedPrompt) {
      return createErrorResponse("Missing or invalid `prompt`", 400);
    }

    if (
      urls &&
      (!Array.isArray(urls) || urls.some((url) => typeof url !== "string"))
    ) {
      return createErrorResponse("`urls` must be an array of strings", 400);
    }

    if (maxCredits !== undefined && maxCredits <= 0) {
      return createErrorResponse("`maxCredits` must be greater than 0", 400);
    }

    const response = await firecrawl.startAgent({
      prompt: normalizedPrompt,
      ...(urls ? { urls } : {}),
      ...(schema ? { schema } : {}),
      ...(maxCredits !== undefined ? { maxCredits } : {}),
      ...(strictConstrainToURLs !== undefined ? { strictConstrainToURLs } : {}),
      ...(model ? { model } : {}),
    });

    return NextResponse.json<FirecrawlAgentResponse>(response);
  } catch (error) {
    const normalizedError = normalizeError(error);

    if (normalizedError?.response?.status === 401) {
      return createErrorResponse("Unauthorized - check API key", 401);
    }

    if (normalizedError?.response?.status === 402) {
      return createErrorResponse("Payment required", 402);
    }

    if (normalizedError?.response?.status === 429) {
      return createErrorResponse("Rate limit exceeded", 429);
    }

    return createErrorResponse(
      "Agent route failed",
      500,
      normalizedError?.message ?? String(error),
    );
  }
}

// GET: poll agent job status/results by jobId query param
// Example: /api/firecrawl/agent?jobId=xxxxx
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get("jobId");
    if (!jobId) {
      return createErrorResponse("Missing `jobId` query param", 400);
    }

    const status = await firecrawl.getAgentStatus(jobId);

    return NextResponse.json<FirecrawlAgentStatusResponse>(status);
  } catch (error) {
    const normalizedError = normalizeError(error);

    if (normalizedError?.response?.status === 401) {
      return createErrorResponse("Unauthorized - check API key", 401);
    }

    if (normalizedError?.response?.status === 404) {
      return createErrorResponse("Agent job not found", 404);
    }

    if (normalizedError?.response?.status === 429) {
      return createErrorResponse("Rate limit exceeded", 429);
    }

    return createErrorResponse(
      "Agent status route failed",
      500,
      normalizedError?.message ?? String(error),
    );
  }
}
