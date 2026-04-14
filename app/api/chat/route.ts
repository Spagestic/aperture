import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { search, scrape, batchScrape, poll } from "firecrawl-aisdk";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: mistral("mistral-small-2603"),
    messages: await convertToModelMessages(messages),
    system: `You are a helpful research assistant. The current date is ${new Date().toLocaleDateString()}. When answering questions based on search results, scrape multiple URLs if necessary to ensure your answer is comprehensive and accurate.`,
    tools: {
      search: search,
      scrape: scrape,
      batchScrape: batchScrape,
      poll: poll,
    },
    // toolChoice: "required", // Force tool calls at every step
    stopWhen: stepCountIs(20),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
