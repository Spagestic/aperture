type InteractOptions = {
  prompt?: string;
  code?: string;
  language?: "node" | "python" | "bash";
  timeout?: number;
  origin?: string;
};

type InteractClient = {
  interact: (scrapeId: string, options: InteractOptions) => Promise<unknown>;
  stopInteraction: (scrapeId: string) => Promise<unknown>;
};

export interface FirecrawlInteractRequestBody {
  scrapeId: string;
  prompt?: string;
  code?: string;
  language?: "node" | "python" | "bash";
  timeout?: number;
  origin?: string;
}

export type FirecrawlInteractResponse = Awaited<
  ReturnType<InteractClient["interact"]>
>;

export type FirecrawlStopInteractionResponse = Awaited<
  ReturnType<InteractClient["stopInteraction"]>
>;

export interface FirecrawlInteractErrorResponse {
  success: false;
  error: string;
  detail?: string;
}
