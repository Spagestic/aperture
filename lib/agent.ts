// lib/agent.ts
"use server";

import { createDeepAgent } from "deepagents";
import { scrapeWebsiteTool, searchWebTool } from "./tools/firecrawl";

type AgentStreamEvent =
  | { event: "text"; text: string }
  | { event: "tool"; toolPart: ToolPartEvent };

type ToolPartEvent = {
  type: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolCallId?: string;
  errorText?: string;
};

type TokenWithContent = {
  text?: unknown;
  content?: unknown;
  contentBlocks?: Array<{ type?: string; text?: string }>;
};

function extractTextFromToken(token: TokenWithContent): string {
  if (Array.isArray(token.contentBlocks)) {
    let textFromBlocks = "";
    for (const block of token.contentBlocks) {
      if (block.type === "text" && typeof block.text === "string") {
        textFromBlocks += block.text;
      }
    }
    if (textFromBlocks) return textFromBlocks;
  }

  if (typeof token.content === "string") {
    return token.content;
  } else if (Array.isArray(token.content)) {
    let textFromContent = "";
    for (const item of token.content) {
      if (typeof item === "string") {
        textFromContent += item;
      } else if (
        item &&
        typeof item === "object" &&
        "text" in item &&
        typeof (item as { text?: unknown }).text === "string"
      ) {
        textFromContent += (item as { text: string }).text;
      }
    }
    if (textFromContent) return textFromContent;
  }

  if (typeof token.text === "string") {
    return token.text;
  }

  return "";
}

function createAgent() {
  return createDeepAgent({
    model: "mistralai:mistral-small-2603",
    tools: [scrapeWebsiteTool, searchWebTool],
    systemPrompt: `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.
    
    Gather accurate and up-to-date (${new Date().toLocaleDateString()}) information before writing your report.`,
  });
}

function extractToolCallsFromMessage(message: unknown): Array<{
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
}> {
  if (!message || typeof message !== "object") return [];
  const msg = message as Record<string, unknown>;

  const toolCalls: Array<Record<string, unknown>> = [];

  const additionalKwargs = msg.additional_kwargs;
  if (
    additionalKwargs &&
    typeof additionalKwargs === "object" &&
    "tool_calls" in additionalKwargs &&
    Array.isArray((additionalKwargs as { tool_calls?: unknown }).tool_calls)
  ) {
    toolCalls.push(
      ...(((additionalKwargs as { tool_calls: unknown[] }).tool_calls ||
        []) as Record<string, unknown>[]),
    );
  } else if (Array.isArray(msg.tool_calls)) {
    toolCalls.push(...(msg.tool_calls as Record<string, unknown>[]));
  } else if (Array.isArray(msg.content)) {
    // Anthropic-style content blocks can include tool_use
    const blocks = msg.content as Array<Record<string, unknown>>;
    toolCalls.push(...blocks.filter((b) => b?.type === "tool_use"));
  }

  return toolCalls
    .map((call) => {
      const callId =
        typeof call.id === "string"
          ? call.id
          : typeof call.tool_call_id === "string"
            ? (call.tool_call_id as string)
            : undefined;

      const fn = call.function;
      const nameFromFn =
        fn &&
        typeof fn === "object" &&
        typeof (fn as { name?: unknown }).name === "string"
          ? ((fn as { name: string }).name as string)
          : undefined;
      const nameFromCall =
        typeof call.name === "string" ? (call.name as string) : undefined;
      // Note: `call.type` is often `"tool_use"` and is not the tool name.
      const name = nameFromFn || nameFromCall;

      const rawArgs =
        (fn &&
          typeof fn === "object" &&
          (fn as { arguments?: unknown }).arguments) ??
        call.args ??
        call.input ??
        {};

      const args =
        rawArgs && typeof rawArgs === "object"
          ? (rawArgs as Record<string, unknown>)
          : typeof rawArgs === "string"
            ? ({ raw: rawArgs } as Record<string, unknown>)
            : ({ value: rawArgs } as Record<string, unknown>);

      return { id: callId, name, args };
    })
    .filter((c) => typeof c.name === "string" && c.name.trim().length > 0);
}

function extractToolResult(message: unknown): {
  toolCallId?: string;
  name?: string;
  output?: Record<string, unknown>;
  errorText?: string;
} {
  if (!message || typeof message !== "object") return {};
  const msg = message as Record<string, unknown>;
  const toolCallId =
    typeof msg.tool_call_id === "string" ? (msg.tool_call_id as string) : undefined;
  const name = typeof msg.name === "string" ? (msg.name as string) : undefined;

  const content = (msg as { content?: unknown }).content;
  if (content == null) return { toolCallId, name, output: {} };

  if (typeof content === "string") {
    // Attempt JSON parse for structured outputs.
    try {
      const parsed = JSON.parse(content) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { toolCallId, name, output: parsed as Record<string, unknown> };
      }
      return { toolCallId, name, output: { result: parsed } };
    } catch {
      return { toolCallId, name, output: { result: content } };
    }
  }

  if (content && typeof content === "object" && !Array.isArray(content)) {
    return { toolCallId, name, output: content as Record<string, unknown> };
  }

  return { toolCallId, name, output: { result: content } };
}

export async function* streamAgentText(prompt: string) {
  const agent = createAgent();

  const stream = await agent.stream(
    { messages: [{ role: "user", content: prompt }] },
    { streamMode: "messages" },
  );

  for await (const [token] of stream) {
    const text = extractTextFromToken(token as TokenWithContent);
    if (text) {
      yield text;
    }
  }
}

export async function* streamAgentEvents(
  prompt: string,
): AsyncGenerator<AgentStreamEvent> {
  const agent = createAgent();

  const stream = await agent.stream(
    { messages: [{ role: "user", content: prompt }] },
    { streamMode: "messages" },
  );

  for await (const [message] of stream) {
    const msgType =
      message && typeof message === "object" && "type" in (message as object)
        ? typeof (message as { type?: unknown }).type === "string"
          ? ((message as { type: string }).type as string)
          : ""
        : "";

    // Always emit text if present.
    const text = extractTextFromToken(message as TokenWithContent);
    if (text) {
      yield { event: "text", text };
    }

    if (msgType === "ai") {
      const toolCalls = extractToolCallsFromMessage(message);
      for (const call of toolCalls) {
        yield {
          event: "tool",
          toolPart: {
            type: call.name || "tool",
            state: "input-available",
            input: call.args || {},
            toolCallId: call.id,
          },
        };
      }
    } else if (msgType === "tool") {
      const { toolCallId, name, output, errorText } = extractToolResult(message);
      yield {
        event: "tool",
        toolPart: {
          type: name || "tool",
          state: errorText ? "output-error" : "output-available",
          output: output || {},
          toolCallId,
          errorText,
        },
      };
    }
  }
}

export async function runAgent(prompt: string) {
  let response = "";

  for await (const text of streamAgentText(prompt)) {
    response += text;
  }

  return response.trim();
}
