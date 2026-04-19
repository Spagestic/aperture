import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText, type LanguageModel } from "ai";
import type { z } from "zod";

export const MODEL: LanguageModel = mistral("mistral-large-2512");

export const RESEARCH_BUDGET = {
  /** Max research questions the supervisor can produce. */
  MAX_QUESTIONS: 6,
  /** Max outer iterations per subagent (search -> judge -> scrape -> summarize). */
  MAX_ITERATIONS_PER_QUESTION: 3,
  /** Max search results requested per iteration. */
  SEARCH_RESULTS_PER_ITERATION: 6,
  /** Max number of URLs scraped per iteration. */
  MAX_SCRAPES_PER_ITERATION: 4,
  /** Number of relevant sources that are enough to stop a question's loop. */
  RELEVANT_SOURCE_TARGET: 3,
} as const;

export async function generateStructured<T>(args: {
  schema: z.ZodType<T>;
  prompt: string;
  system?: string;
  temperature?: number;
}): Promise<T> {
  const result = await generateObject({
    model: MODEL,
    schema: args.schema,
    prompt: args.prompt,
    ...(args.system ? { system: args.system } : {}),
    ...(args.temperature !== undefined
      ? { temperature: args.temperature }
      : {}),
  });
  return result.object as T;
}

export async function generateMarkdown(args: {
  prompt: string;
  system?: string;
  temperature?: number;
}): Promise<string> {
  const result = await generateText({
    model: MODEL,
    prompt: args.prompt,
    ...(args.system ? { system: args.system } : {}),
    ...(args.temperature !== undefined
      ? { temperature: args.temperature }
      : {}),
  });
  return result.text;
}

export function today(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
