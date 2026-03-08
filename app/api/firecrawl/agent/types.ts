import type Firecrawl from "@mendable/firecrawl-js";

type StartAgentArgs = Parameters<Firecrawl["startAgent"]>[0];

export interface FirecrawlAgentRequestBody extends StartAgentArgs {
  prompt: string;
}

export type FirecrawlAgentResponse = Awaited<
  ReturnType<Firecrawl["startAgent"]>
>;

export type FirecrawlAgentStatusResponse = Awaited<
  ReturnType<Firecrawl["getAgentStatus"]>
>;

export interface FirecrawlAgentErrorResponse {
  success: false;
  error: string;
  detail?: string;
}
