import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/polymarket-events";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const includeChat = searchParams.get("include_chat") === "true";
    const includeTemplate = searchParams.get("include_template") === "true";

    const event = await getEventBySlug(slug, {
      includeChat,
      includeTemplate,
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Polymarket event.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
