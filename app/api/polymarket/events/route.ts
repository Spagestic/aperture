import { NextResponse } from "next/server";
import { searchPublicEvents } from "@/lib/polymarket-events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limit = Number(searchParams.get("limit") ?? "12");
    const safeLimit = Number.isFinite(limit) ? limit : 12;

    if (!query) {
      return NextResponse.json([]);
    }

    const events = await searchPublicEvents(query, safeLimit);

    return NextResponse.json(events);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Polymarket events.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
