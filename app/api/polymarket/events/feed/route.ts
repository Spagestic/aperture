import { NextResponse } from "next/server";
import { getEventsPage } from "@/lib/polymarket-events";

const MAX_LIMIT = 50;

function parseNonNegativeInt(value: string | null, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return fallback;
  return n;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseNonNegativeInt(searchParams.get("offset"), 0);
    const limitRaw = parseNonNegativeInt(
      searchParams.get("limit"),
      24,
    );
    const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    const events = await getEventsPage({ offset, limit });

    return NextResponse.json(events);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Polymarket events.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
