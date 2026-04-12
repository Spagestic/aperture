import { NextResponse } from "next/server";
import { buildEventSearchText, getEvents } from "@/lib/polymarket-events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const limit = Number(searchParams.get("limit") ?? "12");
    const events = await getEvents();

    const filteredEvents = query
      ? events.filter((event) => buildEventSearchText(event).includes(query))
      : [];

    return NextResponse.json(filteredEvents.slice(0, Number.isFinite(limit) ? limit : 12));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Polymarket events.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
