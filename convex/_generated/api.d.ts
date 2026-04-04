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
import type * as companies from "../companies.js";
import type * as discoverDocuments from "../discoverDocuments.js";
import type * as documentDiscovery from "../documentDiscovery.js";
import type * as documentDiscoveryActions from "../documentDiscoveryActions.js";
import type * as documents from "../documents.js";
import type * as firecrawl_agent from "../firecrawl/agent.js";
import type * as firecrawl_client from "../firecrawl/client.js";
import type * as firecrawl_crawl from "../firecrawl/crawl.js";
import type * as firecrawl_interact from "../firecrawl/interact.js";
import type * as firecrawl_map from "../firecrawl/map.js";
import type * as firecrawl_scrape from "../firecrawl/scrape.js";
import type * as firecrawl_search from "../firecrawl/search.js";
import type * as http from "../http.js";
import type * as lib_pdfDiscoveryShared from "../lib/pdfDiscoveryShared.js";
import type * as market from "../market.js";
import type * as marketTransform from "../marketTransform.js";
import type * as mineru from "../mineru.js";
import type * as processDocuments from "../processDocuments.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  companies: typeof companies;
  discoverDocuments: typeof discoverDocuments;
  documentDiscovery: typeof documentDiscovery;
  documentDiscoveryActions: typeof documentDiscoveryActions;
  documents: typeof documents;
  "firecrawl/agent": typeof firecrawl_agent;
  "firecrawl/client": typeof firecrawl_client;
  "firecrawl/crawl": typeof firecrawl_crawl;
  "firecrawl/interact": typeof firecrawl_interact;
  "firecrawl/map": typeof firecrawl_map;
  "firecrawl/scrape": typeof firecrawl_scrape;
  "firecrawl/search": typeof firecrawl_search;
  http: typeof http;
  "lib/pdfDiscoveryShared": typeof lib_pdfDiscoveryShared;
  market: typeof market;
  marketTransform: typeof marketTransform;
  mineru: typeof mineru;
  processDocuments: typeof processDocuments;
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

export declare const components: {};
