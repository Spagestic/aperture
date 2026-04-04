import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { getFirecrawlClient } from "./firecrawl/client";
import {
  coalesceMapLinks,
  filterMapLinks,
  inferDocumentType,
  normalizeUrl,
  resolvePdfDisplayTitle,
} from "./lib/pdfDiscoveryShared";

type CrawlPage = {
  metadata?: {
    title?: string;
  };
  links?: unknown;
};

function urlFromSearchItem(item: Record<string, unknown>): string | undefined {
  if (typeof item.url === "string" && /^https?:\/\//i.test(item.url.trim())) {
    return item.url.trim();
  }
  const meta = item.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    for (const k of ["sourceURL", "url", "ogUrl"] as const) {
      const u = m[k];
      if (typeof u === "string" && /^https?:\/\//i.test(u.trim())) {
        return u.trim();
      }
    }
  }
  return undefined;
}

function titleFromSearchItem(item: Record<string, unknown>): string | undefined {
  if (typeof item.title === "string" && item.title.trim()) {
    return item.title.trim();
  }
  const meta = item.metadata;
  if (meta && typeof meta === "object") {
    const t = (meta as Record<string, unknown>).title;
    if (typeof t === "string" && t.trim()) {
      return t.trim();
    }
  }
  return undefined;
}

function extractUrlsFromSearchData(data: unknown): { url: string; title?: string }[] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const d = data as Record<string, unknown>;
  const out: { url: string; title?: string }[] = [];
  for (const key of ["web", "news"] as const) {
    const arr = d[key];
    if (!Array.isArray(arr)) {
      continue;
    }
    for (const item of arr) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const o = item as Record<string, unknown>;
      const url = urlFromSearchItem(o);
      if (!url) {
        continue;
      }
      out.push({ url, title: titleFromSearchItem(o) });
    }
  }
  return out;
}

/** Prefer hub pages (IR, HKEX news) over raw PDFs in search results. */
function scoreIrSeedCandidate(url: string, title?: string): number {
  const hay = `${url} ${title ?? ""}`.toLowerCase();
  let s = 0;
  if (hay.includes("investor")) {
    s += 6;
  }
  if (hay.includes("hkexnews") || hay.includes("hkex news")) {
    s += 7;
  }
  if (hay.includes("/ir") || hay.includes("ir.") || hay.includes("investor-relation")) {
    s += 4;
  }
  if (hay.includes("corporate")) {
    s += 2;
  }
  if (hay.includes("annual") || hay.includes("interim") || hay.includes("financial")) {
    s += 2;
  }
  if (hay.includes("announcement") || hay.includes("filing")) {
    s += 2;
  }
  if (hay.endsWith(".pdf") || hay.includes(".pdf?")) {
    s -= 6;
  }
  return s;
}

function pickDiscoverySeedUrls(
  results: { url: string; title?: string; score: number }[],
  fallbackUrl: string,
  maxSeeds: number,
): string[] {
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const r of sorted) {
    const n = normalizeUrl(r.url);
    if (!n || seen.has(n)) {
      continue;
    }
    seen.add(n);
    urls.push(r.url);
    if (urls.length >= maxSeeds) {
      break;
    }
  }
  if (urls.length === 0 && fallbackUrl.trim()) {
    urls.push(fallbackUrl.trim());
  }
  return urls;
}

function processCrawlPagesForDiscovery(pages: CrawlPage[]): {
  uniqueLinks: string[];
  titleByNorm: Map<string, string>;
} {
  const allLinkStrings: string[] = [];
  /** First page title seen for each normalized link (link discovery context). */
  const normToPageTitle = new Map<string, string>();

  for (const page of pages) {
    const rawTitle = page.metadata?.title;
    const pageTitle =
      typeof rawTitle === "string" ? rawTitle.trim() : undefined;
    if (!Array.isArray(page.links)) {
      continue;
    }
    const linkStrings = coalesceMapLinks(page.links);
    allLinkStrings.push(...linkStrings);
    if (!pageTitle) {
      continue;
    }
    for (const rawLink of linkStrings) {
      const normalized = normalizeUrl(rawLink);
      if (!normalized || normToPageTitle.has(normalized)) {
        continue;
      }
      normToPageTitle.set(normalized, pageTitle);
    }
  }

  const uniqueLinks = filterMapLinks(allLinkStrings);
  const titleByNorm = new Map<string, string>();
  for (const url of uniqueLinks) {
    const n = normalizeUrl(url);
    const pageTitle = normToPageTitle.get(n);
    titleByNorm.set(n, resolvePdfDisplayTitle(url, pageTitle));
  }

  return { uniqueLinks, titleByNorm };
}

async function crawlSeedForPdfLinks(seedUrl: string): Promise<{
  uniqueLinks: string[];
  titleByNorm: Map<string, string>;
}> {
  const firecrawl = getFirecrawlClient();
  const job = await firecrawl.crawl(seedUrl, {
    limit: 45,
    maxDiscoveryDepth: 2,
    pollInterval: 2,
    timeout: 180,
    scrapeOptions: {
      formats: ["links"],
      onlyMainContent: true,
    },
  });

  if (job.status === "failed" || job.status === "cancelled") {
    return { uniqueLinks: [], titleByNorm: new Map() };
  }

  const pages = job.data;
  if (!Array.isArray(pages) || pages.length === 0) {
    return { uniqueLinks: [], titleByNorm: new Map() };
  }

  return processCrawlPagesForDiscovery(pages as CrawlPage[]);
}

const BATCH = 20;

export const mapPhase = internalAction({
  args: { jobId: v.id("documentDiscoveryJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.documentDiscovery.getJob, {
      jobId: args.jobId,
    });
    if (!job) {
      return;
    }

    const company = await ctx.runQuery(api.companies.getByTicker, {
      ticker: job.ticker,
    });
    if (!company?.websiteUrl) {
      await ctx.runMutation(internal.documentDiscovery.failJob, {
        jobId: args.jobId,
        errorMessage: "Missing company website URL (listing fallback).",
      });
      return;
    }

    const fallbackListingUrl = company.websiteUrl.trim();

    try {
      await ctx.runMutation(internal.documentDiscovery.patchJob, {
        jobId: args.jobId,
        status: "mapping",
        phaseDetail: "Searching for investor / IR pages…",
      });

      const firecrawl = getFirecrawlClient();
      const name = company.name.trim();
      const ticker = job.ticker;
      const searchQueries = [
        `${name} investor relations`,
        `${name} ${ticker} annual report HKEX`,
        `${name} site:hkexnews.hk`,
      ];

      const ranked: { url: string; title?: string; score: number }[] = [];
      const seenNorm = new Set<string>();

      for (const query of searchQueries) {
        try {
          const searchData = (await firecrawl.search(query, {
            limit: 8,
            sources: ["web"],
            timeout: 60000,
            ignoreInvalidURLs: true,
          })) as unknown;

          for (const { url, title } of extractUrlsFromSearchData(searchData)) {
            const n = normalizeUrl(url);
            if (!n || seenNorm.has(n)) {
              continue;
            }
            seenNorm.add(n);
            ranked.push({
              url,
              title,
              score: scoreIrSeedCandidate(url, title),
            });
          }
        } catch (err) {
          console.warn(`Firecrawl search failed for query "${query}":`, err);
        }
      }

      const seeds = pickDiscoverySeedUrls(ranked, fallbackListingUrl, 3);
      const primarySeed = seeds[0] ?? fallbackListingUrl;

      await ctx.runMutation(internal.documentDiscovery.patchJob, {
        jobId: args.jobId,
        phaseDetail: `Crawling ${primarySeed.slice(0, 72)}…`,
        discoverySeedUrl: primarySeed,
      });

      let { uniqueLinks, titleByNorm } = await crawlSeedForPdfLinks(primarySeed);

      if (uniqueLinks.length === 0 && seeds.length > 1) {
        const alt = seeds[1];
        await ctx.runMutation(internal.documentDiscovery.patchJob, {
          jobId: args.jobId,
          phaseDetail: `Trying alternate seed…`,
          discoverySeedUrl: alt,
        });
        const second = await crawlSeedForPdfLinks(alt);
        uniqueLinks = second.uniqueLinks;
        titleByNorm = second.titleByNorm;
      }

      if (uniqueLinks.length === 0 && primarySeed !== fallbackListingUrl) {
        await ctx.runMutation(internal.documentDiscovery.patchJob, {
          jobId: args.jobId,
          phaseDetail: "Crawling listing fallback URL…",
          discoverySeedUrl: fallbackListingUrl,
        });
        const fb = await crawlSeedForPdfLinks(fallbackListingUrl);
        uniqueLinks = fb.uniqueLinks;
        titleByNorm = fb.titleByNorm;
      }

      const candidates = uniqueLinks.map((url) => {
        const normalizedUrl = normalizeUrl(url);
        return {
          normalizedUrl,
          url,
          title: resolvePdfDisplayTitle(url),
          documentType: inferDocumentType(url),
        };
      });

      if (candidates.length > 0) {
        await ctx.runMutation(internal.documentDiscovery.insertCandidates, {
          jobId: args.jobId,
          candidates,
        });
      }

      const updates = [...titleByNorm.entries()].map(([normalizedUrl, title]) => ({
        normalizedUrl,
        title,
      }));

      if (updates.length > 0) {
        await ctx.runMutation(internal.documentDiscovery.applyContextTitles, {
          jobId: args.jobId,
          updates,
        });
      }

      await ctx.runMutation(internal.documentDiscovery.patchJob, {
        jobId: args.jobId,
        totalCandidates: candidates.length,
        status: "persisting",
        phaseDetail: "Saving PDF links…",
      });

      await ctx.scheduler.runAfter(
        0,
        internal.documentDiscoveryActions.persistBatch,
        { jobId: args.jobId },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.documentDiscovery.failJob, {
        jobId: args.jobId,
        errorMessage: message,
      });
    }
  },
});

export const persistBatch = internalAction({
  args: { jobId: v.id("documentDiscoveryJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.documentDiscovery.getJob, {
      jobId: args.jobId,
    });
    if (!job || job.status === "failed" || job.status === "completed") {
      return;
    }

    try {
      const batch = await ctx.runQuery(
        internal.documentDiscovery.getPendingCandidates,
        { jobId: args.jobId, limit: BATCH },
      );

      const company = await ctx.runQuery(api.companies.getByTicker, {
        ticker: job.ticker,
      });
      if (!company) {
        await ctx.runMutation(internal.documentDiscovery.failJob, {
          jobId: args.jobId,
          errorMessage: "Company not found.",
        });
        return;
      }

      const existingDocs = await ctx.runQuery(api.documents.listByCompany, {
        companyId: company._id,
      });
      const existingPdfUrls = new Set(
        existingDocs.map((doc) => normalizeUrl(doc.pdfUrl)),
      );

      for (const candidate of batch) {
        if (existingPdfUrls.has(candidate.normalizedUrl)) {
          await ctx.runMutation(internal.documentDiscovery.markCandidateSkipped, {
            candidateId: candidate._id,
          });
          continue;
        }

        const finalTitle = resolvePdfDisplayTitle(
          candidate.url,
          candidate.title,
        );

        await ctx.runMutation(api.documents.create, {
          companyId: company._id,
          type: candidate.documentType,
          title: finalTitle,
          pdfUrl: candidate.url,
          publishedDate: new Date().toISOString(),
        });

        existingPdfUrls.add(candidate.normalizedUrl);

        await ctx.runMutation(internal.documentDiscovery.markCandidateInserted, {
          candidateId: candidate._id,
        });
      }

      const remaining = await ctx.runQuery(
        internal.documentDiscovery.countPendingCandidates,
        { jobId: args.jobId },
      );

      const done = job.totalCandidates;
      const processed = done - remaining;
      await ctx.runMutation(internal.documentDiscovery.patchJob, {
        jobId: args.jobId,
        phaseDetail: `Saving PDF links… (${processed} / ${done})`,
      });

      if (remaining > 0) {
        await ctx.scheduler.runAfter(
          0,
          internal.documentDiscoveryActions.persistBatch,
          { jobId: args.jobId },
        );
      } else {
        await ctx.runMutation(internal.documentDiscovery.completeJob, {
          jobId: args.jobId,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.documentDiscovery.failJob, {
        jobId: args.jobId,
        errorMessage: message,
      });
    }
  },
});
