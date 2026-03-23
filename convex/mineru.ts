/* eslint-disable @typescript-eslint/no-explicit-any */
import { action } from "./_generated/server";
import { v } from "convex/values";

const MINERU_BASE_URL = "https://mineru.net/api/v4";
const MINERU_AGENT_BASE_URL = "https://mineru.net/api/v1/agent";

function getMineruToken() {
  const token = process.env.MINERU_API_KEY;
  if (!token) {
    throw new Error("MINERU_API_KEY environment variable is not set");
  }
  return token;
}

// -------------------------------------------------------------
// 🎯 Precision Parsing API Endpoints
// -------------------------------------------------------------

export const extractTaskUrl = action({
  args: {
    url: v.string(),
    modelVersion: v.union(
      v.literal("pipeline"),
      v.literal("vlm"),
      v.literal("MinerU-HTML"),
    ),
    isOcr: v.optional(v.boolean()),
    enableFormula: v.optional(v.boolean()),
    enableTable: v.optional(v.boolean()),
    language: v.optional(v.string()),
    dataId: v.optional(v.string()),
    callback: v.optional(v.string()),
    seed: v.optional(v.string()),
    extraFormats: v.optional(v.array(v.string())),
    pageRanges: v.optional(v.string()),
    noCache: v.optional(v.boolean()),
    cacheTolerance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const token = getMineruToken();
    const response = await fetch(`${MINERU_BASE_URL}/extract/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: args.url,
        model_version: args.modelVersion,
        is_ocr: args.isOcr,
        enable_formula: args.enableFormula,
        enable_table: args.enableTable,
        language: args.language,
        data_id: args.dataId,
        callback: args.callback,
        seed: args.seed,
        extra_formats: args.extraFormats,
        page_ranges: args.pageRanges,
        no_cache: args.noCache,
        cache_tolerance: args.cacheTolerance,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `MinerU API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const getExtractTaskResult = action({
  args: { taskId: v.string() },
  handler: async (ctx, { taskId }) => {
    const token = getMineruToken();
    const response = await fetch(`${MINERU_BASE_URL}/extract/task/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `MinerU API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const getBatchUploadUrls = action({
  args: {
    files: v.array(
      v.object({
        name: v.string(),
        dataId: v.optional(v.string()),
        isOcr: v.optional(v.boolean()),
        pageRanges: v.optional(v.string()),
      }),
    ),
    modelVersion: v.union(
      v.literal("pipeline"),
      v.literal("vlm"),
      v.literal("MinerU-HTML"),
    ),
    enableFormula: v.optional(v.boolean()),
    enableTable: v.optional(v.boolean()),
    language: v.optional(v.string()),
    callback: v.optional(v.string()),
    seed: v.optional(v.string()),
    extraFormats: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const token = getMineruToken();
    const response = await fetch(`${MINERU_BASE_URL}/file-urls/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        files: args.files.map((f) => ({
          name: f.name,
          data_id: f.dataId,
          is_ocr: f.isOcr,
          page_ranges: f.pageRanges,
        })),
        model_version: args.modelVersion,
        enable_formula: args.enableFormula,
        enable_table: args.enableTable,
        language: args.language,
        callback: args.callback,
        seed: args.seed,
        extra_formats: args.extraFormats,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `MinerU API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const extractTaskBatch = action({
  args: {
    files: v.array(
      v.object({
        url: v.string(),
        dataId: v.optional(v.string()),
        isOcr: v.optional(v.boolean()),
        pageRanges: v.optional(v.string()),
      }),
    ),
    modelVersion: v.union(
      v.literal("pipeline"),
      v.literal("vlm"),
      v.literal("MinerU-HTML"),
    ),
    enableFormula: v.optional(v.boolean()),
    enableTable: v.optional(v.boolean()),
    language: v.optional(v.string()),
    callback: v.optional(v.string()),
    seed: v.optional(v.string()),
    extraFormats: v.optional(v.array(v.string())),
    noCache: v.optional(v.boolean()),
    cacheTolerance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const token = getMineruToken();
    const response = await fetch(`${MINERU_BASE_URL}/extract/task/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        files: args.files.map((f) => ({
          url: f.url,
          data_id: f.dataId,
          is_ocr: f.isOcr,
          page_ranges: f.pageRanges,
        })),
        model_version: args.modelVersion,
        enable_formula: args.enableFormula,
        enable_table: args.enableTable,
        language: args.language,
        callback: args.callback,
        seed: args.seed,
        extra_formats: args.extraFormats,
        no_cache: args.noCache,
        cache_tolerance: args.cacheTolerance,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `MinerU API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const getBatchExtractTaskResult = action({
  args: { batchId: v.string() },
  handler: async (ctx, { batchId }) => {
    const token = getMineruToken();
    const response = await fetch(
      `${MINERU_BASE_URL}/extract-results/batch/${batchId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `MinerU API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

// -------------------------------------------------------------
// ⚡ Agent Lightweight Parsing API Endpoints
// -------------------------------------------------------------

export const agentParseUrl = action({
  args: {
    url: v.string(),
    fileName: v.optional(v.string()),
    language: v.optional(v.string()),
    pageRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payload: any = { url: args.url };
    if (args.fileName !== undefined) payload.file_name = args.fileName;
    if (args.language !== undefined) payload.language = args.language;
    if (args.pageRange !== undefined) payload.page_range = args.pageRange;

    const response = await fetch(`${MINERU_AGENT_BASE_URL}/parse/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `MinerU Agent API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const agentGetSignedUploadUrl = action({
  args: {
    fileName: v.string(),
    language: v.optional(v.string()),
    pageRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payload: any = { file_name: args.fileName };
    if (args.language !== undefined) payload.language = args.language;
    if (args.pageRange !== undefined) payload.page_range = args.pageRange;

    const response = await fetch(`${MINERU_AGENT_BASE_URL}/parse/file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `MinerU Agent API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});

export const agentGetParseResult = action({
  args: { taskId: v.string() },
  handler: async (ctx, { taskId }) => {
    const response = await fetch(`${MINERU_AGENT_BASE_URL}/parse/${taskId}`);

    if (!response.ok) {
      throw new Error(
        `MinerU Agent API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  },
});
