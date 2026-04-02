import { NextRequest, NextResponse } from "next/server";
import { firecrawl } from "../firecrawlClient";
import type {
  FirecrawlInteractErrorResponse,
  FirecrawlInteractRequestBody,
  FirecrawlInteractResponse,
  FirecrawlStopInteractionResponse,
} from "./types";

type InteractError = {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

function normalizeError(error: unknown): InteractError | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return error as InteractError;
}

function createErrorResponse(error: string, status: number, detail?: string) {
  const body: FirecrawlInteractErrorResponse = {
    success: false,
    error,
    ...(detail ? { detail } : {}),
  };

  return NextResponse.json<FirecrawlInteractErrorResponse>(body, { status });
}

const VALID_LANGUAGES = new Set(["node", "python", "bash"]);

type InteractClient = {
  interact: (
    scrapeId: string,
    options: {
      prompt?: string;
      code?: string;
      language?: "node" | "python" | "bash";
      timeout?: number;
      origin?: string;
    },
  ) => Promise<unknown>;
  stopInteraction: (scrapeId: string) => Promise<unknown>;
};

function getInteractClient() {
  return firecrawl as unknown as InteractClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FirecrawlInteractRequestBody;
    const { scrapeId, prompt, code, language, timeout, origin } = body;

    const normalizedScrapeId = scrapeId?.trim();
    const normalizedPrompt = prompt?.trim();
    const normalizedCode = code?.trim();

    if (!normalizedScrapeId) {
      return createErrorResponse("Missing `scrapeId`", 400);
    }

    if (!normalizedPrompt && !normalizedCode) {
      return createErrorResponse(
        "Either `prompt` or `code` must be provided",
        400,
      );
    }

    if (normalizedPrompt && normalizedCode) {
      return createErrorResponse("Provide only one of `prompt` or `code`", 400);
    }

    if (normalizedCode && !VALID_LANGUAGES.has(language ?? "node")) {
      return createErrorResponse(
        "`language` must be one of `node`, `python`, or `bash`",
        400,
      );
    }

    if (
      timeout !== undefined &&
      (!Number.isFinite(timeout) || timeout < 1 || timeout > 300)
    ) {
      return createErrorResponse(
        "`timeout` must be between 1 and 300 seconds",
        400,
      );
    }

    const response = await getInteractClient().interact(normalizedScrapeId, {
      ...(normalizedPrompt ? { prompt: normalizedPrompt } : {}),
      ...(normalizedCode ? { code: normalizedCode } : {}),
      ...(normalizedCode ? { language: language ?? "node" } : {}),
      ...(timeout !== undefined ? { timeout } : {}),
      ...(origin ? { origin } : {}),
    });

    return NextResponse.json<FirecrawlInteractResponse>(
      response as FirecrawlInteractResponse,
    );
  } catch (error) {
    const normalizedError = normalizeError(error);

    if (normalizedError?.response?.status === 401) {
      return createErrorResponse("Unauthorized - check API key", 401);
    }

    if (normalizedError?.response?.status === 402) {
      return createErrorResponse("Payment required", 402);
    }

    if (normalizedError?.response?.status === 403) {
      return createErrorResponse("Forbidden", 403);
    }

    if (normalizedError?.response?.status === 404) {
      return createErrorResponse("Scrape job not found", 404);
    }

    if (normalizedError?.response?.status === 409) {
      return createErrorResponse("Replay context unavailable", 409);
    }

    if (normalizedError?.response?.status === 410) {
      return createErrorResponse(
        "Browser session has already been destroyed",
        410,
      );
    }

    if (normalizedError?.response?.status === 429) {
      return createErrorResponse("Rate limit exceeded", 429);
    }

    return createErrorResponse(
      "Interact route failed",
      500,
      normalizedError?.message ?? String(error),
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const scrapeId = request.nextUrl.searchParams.get("scrapeId")?.trim();

    if (!scrapeId) {
      return createErrorResponse("Missing `scrapeId` query param", 400);
    }

    const response = await getInteractClient().stopInteraction(scrapeId);

    return NextResponse.json<FirecrawlStopInteractionResponse>(
      response as FirecrawlStopInteractionResponse,
    );
  } catch (error) {
    const normalizedError = normalizeError(error);

    if (normalizedError?.response?.status === 401) {
      return createErrorResponse("Unauthorized - check API key", 401);
    }

    if (normalizedError?.response?.status === 403) {
      return createErrorResponse("Forbidden", 403);
    }

    if (normalizedError?.response?.status === 404) {
      return createErrorResponse("Browser session not found", 404);
    }

    return createErrorResponse(
      "Stop interact route failed",
      500,
      normalizedError?.message ?? String(error),
    );
  }
}
