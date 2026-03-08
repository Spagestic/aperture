import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { scrape, search, browser } from "firecrawl-aisdk";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "mistral/mistral-large-3",
    messages: await convertToModelMessages(messages),
    tools: {
      search: search,
      scrape: scrape,
      browser: browser(),
    },
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse();
}
