import { generateText, Output, stepCountIs, streamText, UIMessage } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { search, scrape, batchScrape, poll } from "firecrawl-aisdk";
import { z } from "zod";

function getLatestUserText(messages: UIMessage[]): string {
  const latestUser = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  if (!latestUser) return "";

  const textParts = latestUser.parts.filter(
    (part): part is { type: "text"; text: string } => part.type === "text",
  );

  return textParts
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function extractFirstUrl(input: string): string | null {
  const match = input.match(/https?:\/\/[^\s)]+/i);
  return match?.[0] ?? null;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const latestUserText = getLatestUserText(messages);
  const eventUrl = extractFirstUrl(latestUserText);
  const today = new Date().toLocaleDateString();
  const model = mistral("mistral-small-2603");

  if (!latestUserText) {
    const emptyPromptResult = streamText({
      model,
      prompt:
        "Ask the user to paste a prediction-market event URL and include any event details they already know.",
    });

    return emptyPromptResult.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  }

  // 1) Speculative filter.
  const { output: filter } = await generateText({
    model,
    output: Output.object({
      schema: z.object({
        isSpeculative: z.boolean(),
        reason: z.string(),
      }),
    }),
    prompt: `You are a prediction-market intake classifier.
Today is ${today}.

Determine if this event is purely speculative (for example: unverifiable, opinion-only, personal prediction with no measurable public evidence, or impossible to research with public sources).

Return:
- isSpeculative: boolean
- reason: short reason

User event input:
${latestUserText}

Event URL (if provided): ${eventUrl ?? "none"}`,
  });

  if (filter.isSpeculative) {
    const speculativeResult = streamText({
      model,
      prompt: `The user submitted a prediction-market event.
The event is classified as too speculative for meaningful evidence-driven research.

Reason: ${filter.reason}

Respond in 3-5 concise sentences:
1) Explain that there is not enough objective evidence to research/predict confidently.
2) Mention why.
3) Suggest what additional measurable criteria or evidence would make this researchable.`,
    });

    return speculativeResult.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  }

  // 2) Supervisor plan.
  const { output: plan } = await generateText({
    model,
    output: Output.object({
      schema: z.object({
        questions: z.array(z.string()).min(3).max(7),
      }),
    }),
    prompt: `You are a supervisor research planner for prediction-market analysis.
Today is ${today}.

Create a focused set of research questions that can help determine the outcome probability of this event.
Questions must be specific, evidence-seeking, and answerable via web research.
Include a mix of:
- direct resolution criteria checks
- key drivers and leading indicators
- disconfirming/contrarian checks

Event input:
${latestUserText}

Event URL (if provided): ${eventUrl ?? "none"}`,
  });

  async function runResearchWorker(
    question: string,
    depth = 0,
  ): Promise<{
    question: string;
    summary: string;
    followUps: string[];
    nestedFindings: { question: string; summary: string }[];
  }> {
    const { text: summary } = await generateText({
      model,
      system: `You are a web-research worker for prediction-market analysis.
Use tools to gather evidence before answering.
Prefer high-quality and primary sources where possible.
When relevant, include data points, dates, and source links.`,
      prompt: `Research this question thoroughly and summarize findings in markdown.

Question: ${question}
Original event input: ${latestUserText}
Event URL (if provided): ${eventUrl ?? "none"}`,
      tools: {
        search,
        scrape,
        batchScrape,
        poll,
      },
      stopWhen: stepCountIs(10),
    });

    let followUps: string[] = [];

    if (depth < 1) {
      const { output: followUpResult } = await generateText({
        model,
        output: Output.object({
          schema: z.object({
            followUps: z.array(z.string()).max(2),
          }),
        }),
        prompt: `Given this research summary, propose up to 2 follow-up research questions
that would meaningfully improve confidence in predicting the event outcome.
Use concise, non-overlapping questions.

Primary question: ${question}
Summary:
${summary}`,
      });

      followUps = followUpResult.followUps;
    }

    const nestedFindings =
      followUps.length > 0
        ? await Promise.all(
            followUps.map(async (followUpQuestion) => {
              const nested = await runResearchWorker(
                followUpQuestion,
                depth + 1,
              );
              return {
                question: nested.question,
                summary: nested.summary,
              };
            }),
          )
        : [];

    return {
      question,
      summary,
      followUps,
      nestedFindings,
    };
  }

  // 3) Parallel workers (with one depth of sub-agent follow-ups).
  const workerResults = await Promise.all(
    plan.questions.map((question) => runResearchWorker(question)),
  );

  // 4) Market selection and side recommendation across related markets.
  const { output: marketRecommendations } = await generateText({
    model,
    output: Output.object({
      schema: z.object({
        markets: z
          .array(
            z.object({
              market: z.string(),
              side: z.enum(["YES", "NO", "AVOID", "WATCH"]),
              conviction: z.number().int().min(0).max(100),
              rationale: z.string(),
              keyRisk: z.string(),
            }),
          )
          .max(8),
      }),
    }),
    system: `You are a prediction-market portfolio selector.
Choose the most suitable markets related to the event and recommend which side to take.
Be selective and avoid weak setups.`,
    prompt: `Analyze this event and related markets, then suggest the best markets to allocate research/investment attention to.

Requirements:
- Consider that one event can have multiple tradable markets.
- Include only markets with enough evidence edge.
- For each market, choose a side:
  - YES: positive expected edge on YES
  - NO: positive expected edge on NO
  - AVOID: insufficient edge despite relevance
  - WATCH: not investable now but worth monitoring
- Conviction is 0-100 based on evidence strength and uncertainty.

Event input:
${latestUserText}

Event URL (if provided): ${eventUrl ?? "none"}

Research findings:
${JSON.stringify(workerResults, null, 2)}`,
  });

  const result = streamText({
    model,
    // 5) Aggregation and synthesis stream.
    system: `You are an expert Polymarket-style prediction-market analyst.
Today is ${today}.
You are given a supervisor plan and parallel worker research outputs.
Synthesize the information into a practical forecast with uncertainty.`,
    prompt: `Event input:
${latestUserText}

Event URL: ${eventUrl ?? "none"}

Speculative filter:
${JSON.stringify(filter, null, 2)}

Supervisor questions:
${JSON.stringify(plan.questions, null, 2)}

Worker outputs:
${JSON.stringify(workerResults, null, 2)}

Market recommendations:
${JSON.stringify(marketRecommendations, null, 2)}

Produce markdown with these sections:
1) Event understanding
2) Key evidence (grouped by question, include contradictions)
3) What matters most for resolution
4) Forecast
   - directional view
   - rough probability/confidence range
   - major uncertainty drivers
5) Recommended markets and sides
   - list each recommended market
   - side: YES/NO/AVOID/WATCH
   - short thesis for that side
   - key risk that could invalidate thesis
   - rank by attractiveness
6) What to monitor next

Be explicit about evidence quality and where uncertainty is high.`,
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
