export type DocumentType =
  | "Annual Report"
  | "Interim Report"
  | "Announcement"
  | "Press Release"
  | "Other";

/** Firecrawl map sometimes returns link objects `{ url }` / `{ href }` instead of plain strings. */
export function coalesceMapLinks(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push(t);
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const u = o.url ?? o.href ?? o.link;
      if (typeof u === "string" && u.trim()) {
        out.push(u.trim());
      }
    }
  }
  return out;
}

export function normalizeUrl(url: string): string {
  if (typeof url !== "string") {
    return "";
  }
  return url.trim().toLowerCase();
}

export function isLikelyPdf(url: string): boolean {
  if (typeof url !== "string") {
    return false;
  }
  const lower = url.toLowerCase();
  return lower.endsWith(".pdf") || lower.includes(".pdf?");
}

export function inferDocumentType(url: string): DocumentType {
  if (typeof url !== "string") {
    return "Other";
  }
  const lower = url.toLowerCase();
  if (lower.includes("annual")) return "Annual Report";
  if (lower.includes("interim")) return "Interim Report";
  if (lower.includes("press")) return "Press Release";
  if (lower.includes("announcement")) return "Announcement";
  return "Other";
}

/** Decode a filename / path segment into a readable title fragment. */
export function humanizeFilenameSegment(name: string): string {
  const base = name.replace(/\.(pdf|php|asp|aspx|jsp)(\?.*)?$/i, "").trim();
  return decodeURIComponent(base).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export function titleFromUrl(url: string): string {
  if (typeof url !== "string" || !url.trim()) {
    return "Document";
  }
  try {
    const u = new URL(url);

    for (const key of [
      "file",
      "filename",
      "fn",
      "doc",
      "document",
      "path",
      "f",
      "url",
    ]) {
      const v = u.searchParams.get(key);
      if (v && /\.pdf(\?|$)/i.test(v)) {
        const leaf = v.split("/").pop() || v;
        const h = humanizeFilenameSegment(leaf);
        if (h.length > 2) {
          return h;
        }
      }
    }

    const pdfInPath = url.match(/([^/?#]+\.pdf)(?:\?|$)/i);
    if (pdfInPath) {
      const h = humanizeFilenameSegment(pdfInPath[1]);
      if (h.length > 2) {
        return h;
      }
    }

    const pathname = u.pathname;
    const rawName = pathname.split("/").filter(Boolean).pop() || "";
    const decoded = humanizeFilenameSegment(rawName);
    if (decoded.length > 2) {
      const lower = decoded.toLowerCase();
      const scriptNoise =
        /\.(php|asp|aspx|jsp)$/i.test(rawName) &&
        /^(financial information|download|document|file|view|show|index|default)$/i.test(
          lower,
        );
      if (!scriptNoise) {
        return decoded;
      }
    }

    return "Document";
  } catch {
    return "Document";
  }
}

export const GENERIC_TITLE_PATTERNS = [
  /^document from /i,
  /^untitled/i,
  /^index$/i,
  /^default$/i,
  /^download$/i,
  /^financial information$/i,
  /^document$/i,
  /^[a-f0-9]{16,}\.pdf$/i,
];

/** Page <title> values that describe navigation/sections, not a specific filing. */
export function isNavShellTitle(title: string | undefined): boolean {
  if (!title) {
    return true;
  }
  const t = title.trim();
  if (!t) {
    return true;
  }
  if (t.includes(">")) {
    return true;
  }
  if (t.length > 88) {
    return true;
  }
  if (/\s-\s.+\s-\s/.test(t)) {
    return true;
  }
  if (/^[^|]+ \| [^|]+ \| /i.test(t)) {
    return true;
  }
  if (/investor relations\s*$/i.test(t) && t.length > 35) {
    return true;
  }
  return false;
}

/** Last breadcrumb segment only if it looks like a real document label. */
export function titleFromBreadcrumbTail(pageTitle: string): string | undefined {
  if (!pageTitle.includes(">")) {
    return undefined;
  }
  const tail = pageTitle.split(">").pop()?.trim() ?? "";
  if (tail.length < 4 || tail.length > 100) {
    return undefined;
  }
  const lower = tail.toLowerCase();
  if (
    /^(financial information|investor relations|reports|publications|downloads|documents?)$/i.test(
      lower,
    )
  ) {
    return undefined;
  }
  if (
    /20\d{2}/.test(tail) ||
    /\b(annual|interim|half[- ]?year|quarter|q[1-4]|announcement|circular|results|esg|sustainability)\b/i.test(
      tail,
    )
  ) {
    return tail.replace(/\s+/g, " ").trim();
  }
  return undefined;
}

export function isGenericTitle(title: string | undefined): boolean {
  if (!title) return true;
  const trimmed = title.trim();
  if (!trimmed) return true;
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Pick the best display title for a PDF given optional crawl page <title>. */
export function resolvePdfDisplayTitle(
  pdfUrl: string,
  pageContextTitle?: string,
): string {
  const fromUrl = titleFromUrl(pdfUrl);
  const ctx = pageContextTitle?.trim();

  const fromCrumb = ctx ? titleFromBreadcrumbTail(ctx) : undefined;
  if (fromCrumb) {
    return fromCrumb;
  }

  if (
    ctx &&
    !isGenericTitle(ctx) &&
    !isNavShellTitle(ctx) &&
    ctx.length <= 88
  ) {
    return ctx.replace(/\s+/g, " ").trim();
  }

  if (fromUrl !== "Document") {
    return fromUrl;
  }

  if (ctx && !isGenericTitle(ctx)) {
    const tail = ctx.split(/[-|]/).pop()?.trim();
    if (tail && tail.length >= 4 && tail.length <= 80 && !isNavShellTitle(tail)) {
      return tail;
    }
  }

  return fromUrl;
}

export function filterMapLinks(links: string[]): string[] {
  const pdfLinks = links.filter((link) => {
    if (typeof link !== "string" || !link.trim()) {
      return false;
    }
    const lower = link.toLowerCase();
    return (
      lower.endsWith(".pdf") ||
      lower.includes("report") ||
      lower.includes("announcement") ||
      lower.includes("financial")
    );
  });
  return Array.from(
    new Map(
      pdfLinks
        .map((link) => [normalizeUrl(link), link] as const)
        .filter(([norm]) => norm.length > 0),
    ).values(),
  );
}
