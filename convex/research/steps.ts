"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateStructured, today, RESEARCH_BUDGET } from "./agent";

type EventContext = {
  title?: string;
  description?: string;
  url?: string;
  marketsJson?: string;
};

function buildEventContext(run: {
  eventTitle?: string | undefined;
  eventDescription?: string | undefined;
  eventUrl?: string | undefined;
  eventMarketsJson?: string | undefined;
}): EventContext {
  return {
    title: run.eventTitle,
    description: run.eventDescription,
    url: run.eventUrl,
    marketsJson: run.eventMarketsJson,
  };
}

function eventContextText(ctx: EventContext): string {
  const parts: string[] = [];
  if (ctx.title) parts.push(`Title: ${ctx.title}`);
  if (ctx.url) parts.push(`URL: ${ctx.url}`);
  if (ctx.description)
    parts.push(`Description: ${ctx.description.slice(0, 2000)}`);
  if (ctx.marketsJson) {
    parts.push(`Related markets (JSON): ${ctx.marketsJson.slice(0, 4000)}`);
  }
  return parts.join("\n");
}

export const classifySpeculative = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.object({
    isSpeculative: v.boolean(),
    reason: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      status: "classifying",
    });

    const run = await ctx.runQuery(internal.research.queries.getRunInternal, {
      runId: args.runId,
    });
    if (!run) throw new Error("Run not found");

    const eventCtx = buildEventContext(run);

    const schema = z.object({
      isSpeculative: z.boolean(),
      reason: z.string(),
    });

    const result = await generateStructured({
      schema,
      system: `You are a prediction-market intake classifier.
Today is ${today()}.
An event is "purely speculative" when it cannot be meaningfully researched with public sources: personal opinion, unverifiable, no measurable resolution criteria, or only guessable from vibes.
An event is researchable when it has measurable resolution criteria, credible public indicators, or is tied to observable events (politics, sports, economics, products, etc.).`,
      prompt: `Classify this prediction-market event.

${eventContextText(eventCtx)}

Return:
- isSpeculative: boolean
- reason: 1-2 sentences`,
      temperature: 0,
    });

    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      isSpeculative: result.isSpeculative,
      speculativeReason: result.reason,
    });
    await ctx.runMutation(internal.research.mutations.log, {
      runId: args.runId,
      phase: "classify",
      level: "info",
      message: `isSpeculative=${result.isSpeculative}: ${result.reason}`,
    });

    return result;
  },
});

export const planQuestions = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.object({
    questionIds: v.array(v.id("researchQuestions")),
  }),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      status: "planning",
    });

    const run = await ctx.runQuery(internal.research.queries.getRunInternal, {
      runId: args.runId,
    });
    if (!run) throw new Error("Run not found");

    const eventCtx = buildEventContext(run);

    const schema = z.object({
      questions: z
        .array(z.string().min(10))
        .min(3)
        .max(RESEARCH_BUDGET.MAX_QUESTIONS),
    });

    const result = await generateStructured({
      schema,
      system: `You are a supervisor research planner for prediction-market analysis.
Today is ${today()}.
Your job is to break the event into a small set of focused research questions that can be answered via public web research and that meaningfully change the probability of the event.
Each question should be:
- specific and evidence-seeking (not opinion)
- answerable via web search / scraping
- non-overlapping

Include a mix of:
- direct resolution-criteria checks
- key drivers / leading indicators
- disconfirming / contrarian checks`,
      prompt: `Generate between 3 and ${RESEARCH_BUDGET.MAX_QUESTIONS} research questions.

${eventContextText(eventCtx)}`,
      temperature: 0.2,
    });

    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      planQuestions: result.questions,
    });

    const questionIds: Array<string> = [];
    for (const question of result.questions) {
      const qid = await ctx.runMutation(
        internal.research.mutations.createQuestion,
        { runId: args.runId, question },
      );
      questionIds.push(qid);
    }

    await ctx.runMutation(internal.research.mutations.log, {
      runId: args.runId,
      phase: "plan",
      level: "info",
      message: `Planned ${result.questions.length} research questions.`,
    });

    return {
      questionIds: questionIds as Array<import("../_generated/dataModel").Id<"researchQuestions">>,
    };
  },
});
