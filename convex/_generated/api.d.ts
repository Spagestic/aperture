/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as auth from "../auth.js";
import type * as firecrawl_agent from "../firecrawl/agent.js";
import type * as firecrawl_client from "../firecrawl/client.js";
import type * as firecrawl_crawl from "../firecrawl/crawl.js";
import type * as firecrawl_interact from "../firecrawl/interact.js";
import type * as firecrawl_map from "../firecrawl/map.js";
import type * as firecrawl_scrape from "../firecrawl/scrape.js";
import type * as firecrawl_search from "../firecrawl/search.js";
import type * as http from "../http.js";
import type * as mineru from "../mineru.js";
import type * as research_agent from "../research/agent.js";
import type * as research_api from "../research/api.js";
import type * as research_mutations from "../research/mutations.js";
import type * as research_queries from "../research/queries.js";
import type * as research_steps from "../research/steps.js";
import type * as research_synthesize from "../research/synthesize.js";
import type * as research_worker from "../research/worker.js";
import type * as research_workflow from "../research/workflow.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  "firecrawl/agent": typeof firecrawl_agent;
  "firecrawl/client": typeof firecrawl_client;
  "firecrawl/crawl": typeof firecrawl_crawl;
  "firecrawl/interact": typeof firecrawl_interact;
  "firecrawl/map": typeof firecrawl_map;
  "firecrawl/scrape": typeof firecrawl_scrape;
  "firecrawl/search": typeof firecrawl_search;
  http: typeof http;
  mineru: typeof mineru;
  "research/agent": typeof research_agent;
  "research/api": typeof research_api;
  "research/mutations": typeof research_mutations;
  "research/queries": typeof research_queries;
  "research/steps": typeof research_steps;
  "research/synthesize": typeof research_synthesize;
  "research/worker": typeof research_worker;
  "research/workflow": typeof research_workflow;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
