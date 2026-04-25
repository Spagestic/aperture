import { v } from "convex/values";
import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export const workflow = new WorkflowManager(components.workflow);

export const researchEvent = workflow.define({
  args: {
    runId: v.id("researchRuns"),
  },
  handler: async (step, args) => {
    try {
      const { isSpeculative } = await step.runAction(
        internal.research.steps.classifySpeculative,
        { runId: args.runId },
        { name: "classifySpeculative", retry: true },
      );

      if (isSpeculative) {
        await step.runMutation(internal.research.mutations.patchRun, {
          runId: args.runId,
          status: "stopped_speculative",
          completedAt: Date.now(),
        });
        return;
      }

      const { questionIds } = await step.runAction(
        internal.research.steps.planQuestions,
        { runId: args.runId },
        { name: "planQuestions", retry: true },
      );

      await step.runMutation(internal.research.mutations.patchRun, {
        runId: args.runId,
        status: "researching",
      });

      const questionsList = questionIds as Array<Id<"researchQuestions">>;
      const chunkSize = 5;

      for (let i = 0; i < questionsList.length; i += chunkSize) {
        const chunk = questionsList.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((questionId) =>
            step.runAction(
              internal.research.worker.runSubagent,
              { runId: args.runId, questionId },
              { name: `subagent:${questionId}`, retry: true },
            ),
          ),
        );

        // Sleep for 1 minute before starting the next batch to respect Firecrawl rate limits (5 req/min free plan)
        if (i + chunkSize < questionsList.length) {
          await step.sleep(60000, { name: `firecrawl-rate-limit-sleep-${i}` });
        }
      }

      await step.runAction(
        internal.research.synthesize.pickMarkets,
        { runId: args.runId },
        { name: "pickMarkets", retry: true },
      );

      await step.runAction(
        internal.research.synthesize.synthesizeFinal,
        { runId: args.runId },
        { name: "synthesizeFinal", retry: true },
      );
    } catch (err) {
      await step.runMutation(internal.research.mutations.patchRun, {
        runId: args.runId,
        status: "failed",
        errorMessage: String(err).slice(0, 500),
        completedAt: Date.now(),
      });
      await step.runMutation(internal.research.mutations.log, {
        runId: args.runId,
        phase: "workflow",
        level: "error",
        message: `Workflow failed: ${String(err).slice(0, 500)}`,
      });
      throw err;
    }
  },
});
