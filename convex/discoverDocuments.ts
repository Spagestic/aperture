import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getFirecrawlClient } from "./firecrawl/client";

type DocumentType =
  | "Annual Report"
  | "Interim Report"
  | "Announcement"
  | "Press Release"
  | "Other";

type CrawlPage = {
  metadata?: {
    title?: string;
  };
  links?: string[];
};

const GENERIC_TITLE_PATTERNS = [
  /^document from /i,
  /^untitled/i,
  /^index$/i,
  /^[a-f0-9]{16,}\.pdf$/i,
];

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase();
}

function isLikelyPdf(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith(".pdf") || lower.includes(".pdf?");
}

function inferDocumentType(url: string): DocumentType {
  const lower = url.toLowerCase();
  if (lower.includes("annual")) return "Annual Report";
  if (lower.includes("interim")) return "Interim Report";
  if (lower.includes("press")) return "Press Release";
  if (lower.includes("announcement")) return "Announcement";
  return "Other";
}

function titleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const rawName = pathname.split("/").pop() || "";
    const decoded = decodeURIComponent(rawName).replace(/[-_]+/g, " ").trim();
    return decoded || `Document from ${url}`;
  } catch {
    return `Document from ${url}`;
  }
}

function isGenericTitle(title: string | undefined): boolean {
  if (!title) return true;
  const trimmed = title.trim();
  if (!trimmed) return true;
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

async function buildPdfContextTitleMap(
  websiteUrl: string,
): Promise<Map<string, string>> {
  const firecrawl = getFirecrawlClient();
  const contextByPdfUrl = new Map<string, string>();

  try {
    const crawlResult = (await firecrawl.crawl(websiteUrl, {
      limit: 30,
      maxDiscoveryDepth: 2,
      pollInterval: 2,
      timeout: 180,
      scrapeOptions: {
        formats: ["links"],
        onlyMainContent: true,
      },
      includePaths: [
        ".*investor.*",
        ".*financial.*",
        ".*report.*",
        ".*announcement.*",
      ],
    })) as unknown as { data?: unknown[]; success?: boolean };

    if (crawlResult.success === false || !Array.isArray(crawlResult.data)) {
      return contextByPdfUrl;
    }

    for (const page of crawlResult.data as CrawlPage[]) {
      const pageTitle = page.metadata?.title?.trim();
      if (
        !pageTitle ||
        isGenericTitle(pageTitle) ||
        !Array.isArray(page.links)
      ) {
        continue;
      }

      for (const rawLink of page.links) {
        if (typeof rawLink !== "string" || !isLikelyPdf(rawLink)) {
          continue;
        }
        const normalized = normalizeUrl(rawLink);
        if (!contextByPdfUrl.has(normalized)) {
          contextByPdfUrl.set(normalized, pageTitle);
        }
      }
    }
  } catch (error) {
    console.warn("Unable to build contextual PDF title map from crawl:", error);
  }

  return contextByPdfUrl;
}

export const mapCompanyDocuments = action({
  args: {
    ticker: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message: string;
    documentsAdded: number;
    linksTried: number;
    discoveredLinks: string[];
  }> => {
    const company = await ctx.runQuery(api.companies.getByTicker, {
      ticker: args.ticker,
    });

    if (!company) {
      throw new Error(`Company not found with ticker: ${args.ticker}`);
    }

    if (!company.websiteUrl) {
      throw new Error(`Company ${company.ticker} has no websiteUrl set.`);
    }

    console.log(
      `Starting Firecrawl discovery for ${company.ticker} at ${company.websiteUrl}`,
    );
    const firecrawl = getFirecrawlClient();

    const mapResult = (await firecrawl.map(company.websiteUrl, {
      search:
        "investor relations, annual report, interim report, announcement, financials, pdf",
      limit: 150,
      includeSubdomains: true,
      timeout: 60000,
    })) as unknown as { links?: string[]; success?: boolean };

    if (mapResult.success === false) {
      throw new Error("Failed to map via Firecrawl");
    }

    const links: string[] = Array.isArray(mapResult.links)
      ? mapResult.links
      : [];

    const existingDocs = await ctx.runQuery(api.documents.listByCompany, {
      companyId: company._id,
    });
    const existingPdfUrls = new Set(
      existingDocs.map((doc) => normalizeUrl(doc.pdfUrl)),
    );

    // Filter for PDF links or common report pages
    const pdfLinks = links.filter(
      (link) =>
        link.toLowerCase().endsWith(".pdf") ||
        link.toLowerCase().includes("report") ||
        link.toLowerCase().includes("announcement") ||
        link.toLowerCase().includes("financial"),
    );

    const uniqueLinks = Array.from(
      new Map(pdfLinks.map((link) => [normalizeUrl(link), link])).values(),
    );

    console.log(`Found ${uniqueLinks.length} potential documents/PDFs.`);
    const contextualTitleMap = await buildPdfContextTitleMap(
      company.websiteUrl,
    );

    // Insert these findings into Convex DB as "pending" documents.
    const addedDocs: string[] = [];
    for (const link of uniqueLinks) {
      const normalizedLink = normalizeUrl(link);
      if (existingPdfUrls.has(normalizedLink)) {
        continue;
      }

      const type = inferDocumentType(link);
      const fallbackTitle = titleFromUrl(link);
      const contextualTitle = contextualTitleMap.get(normalizedLink);
      const finalTitle =
        contextualTitle && !isGenericTitle(contextualTitle)
          ? contextualTitle
          : fallbackTitle;

      try {
        const newDocId = await ctx.runMutation(api.documents.create, {
          companyId: company._id,
          type: type,
          title: finalTitle,
          pdfUrl: link,
          // Placeholder date, to be refined during OCR if needed
          publishedDate: new Date().toISOString(),
        });
        addedDocs.push(newDocId);
      } catch (err) {
        console.error("Failed to add document record:", err);
      }
    }

    return {
      success: true,
      message: `Finished mapping ${company.websiteUrl}. Found ${uniqueLinks.length} docs.`,
      documentsAdded: addedDocs.length,
      linksTried: links.length,
      discoveredLinks: uniqueLinks,
    };
  },
});
