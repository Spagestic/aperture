"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Globe,
  Loader2,
  ScanSearch,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import type { SecurityRecord } from "@/app/dashboard/lib/load-securities";
import { hkexSecuritiesPriceUrl } from "@/lib/hkexUrls";

const TYPE_ORDER = [
  "Annual Report",
  "Interim Report",
  "Announcement",
  "Press Release",
  "Other",
] as const;

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-HK", { dateStyle: "medium" }).format(
      new Date(`${iso.slice(0, 10)}T12:00:00`),
    );
  } catch {
    return iso;
  }
}

function statusBadgeVariant(
  status: Doc<"documents">["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

type JobDoc = Doc<"documentDiscoveryJobs">;

function stepRow(
  label: string,
  state: "done" | "active" | "upcoming",
): React.ReactNode {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={
          state === "done"
            ? "text-primary"
            : state === "active"
              ? "text-foreground"
              : "text-muted-foreground"
        }
      >
        {state === "done" ? "✓" : state === "active" ? "●" : "○"}
      </span>
      <span
        className={
          state === "active" ? "font-medium" : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </div>
  );
}

function discoverySteps(job: JobDoc | null | undefined) {
  if (!job) {
    return (
      <>
        {stepRow("Search & crawl", "upcoming")}
        {stepRow("Save PDF links", "upcoming")}
      </>
    );
  }

  if (job.status === "failed") {
    return (
      <>
        {stepRow("Search & crawl", "done")}
        {stepRow("Save PDF links", "upcoming")}
      </>
    );
  }

  const s = job.status;
  const discovering =
    s === "queued" || s === "mapping" || s === "context";
  return (
    <>
      {stepRow("Search & crawl", discovering ? "active" : "done")}
      {stepRow(
        "Save PDF links",
        s === "persisting"
          ? "active"
          : s === "completed"
            ? "done"
            : "upcoming",
      )}
    </>
  );
}

export function TickerWorkspaceClient({
  ticker,
  security,
}: {
  ticker: string;
  security: SecurityRecord | undefined;
}) {
  const [scanBusy, setScanBusy] = useState(false);
  const autoDiscoveryAttempted = useRef(false);

  const listingUrl = useMemo(() => hkexSecuritiesPriceUrl(ticker), [ticker]);

  useEffect(() => {
    autoDiscoveryAttempted.current = false;
  }, [ticker]);

  const company = useQuery(api.companies.getByTicker, { ticker });
  const documents = useQuery(api.documents.listByTicker, { ticker });
  const job = useQuery(api.documentDiscovery.latestJobByTicker, { ticker });

  const createCompany = useMutation(api.companies.create);
  const patchCompany = useMutation(api.companies.patch);
  const requestDiscovery = useMutation(api.documentDiscovery.requestDiscovery);

  const companyLoading = company === undefined;
  const companyRow = companyLoading ? undefined : company;

  const displayName =
    security?.["Name of Securities"] ?? companyRow?.name ?? ticker;
  const listDescription = security
    ? [security.Category, security["Sub-Category"], `Lot ${security["Board Lot"]}`]
        .filter(Boolean)
        .join(" · ")
    : companyRow?.description;

  const grouped = useMemo(() => {
    const map = new Map<string, Doc<"documents">[]>();
    if (!documents) return map;
    for (const t of TYPE_ORDER) {
      map.set(t, []);
    }
    for (const d of documents) {
      const arr = map.get(d.type) ?? [];
      arr.push(d);
      map.set(d.type, arr);
    }
    return map;
  }, [documents]);

  const scanSeedUrl =
    companyRow?.websiteUrl?.trim() || listingUrl;
  const canScan =
    companyRow != null &&
    scanSeedUrl.length > 0 &&
    isValidHttpUrl(scanSeedUrl);

  const jobActive =
    job &&
    (job.status === "queued" ||
      job.status === "mapping" ||
      job.status === "context" ||
      job.status === "persisting");

  const saveProgress =
    job && job.totalCandidates > 0 && job.status === "persisting"
      ? Math.min(
          100,
          ((job.savedCount + job.skippedDuplicateCount) /
            job.totalCandidates) *
            100,
        )
      : job && job.status === "completed" && job.totalCandidates > 0
        ? 100
        : 0;

  useEffect(() => {
    if (companyLoading) return;
    if (!security) return;
    if (companyRow === null) {
      void createCompany({
        ticker,
        name: security["Name of Securities"],
        exchange: security["Sub-Category"] || "HKEX",
        websiteUrl: listingUrl,
        description: listDescription,
        category: security.Category,
        subCategory: security["Sub-Category"],
        boardLot: security["Board Lot"],
        currency: security["Trading Currency"],
        isin: security.ISIN ?? undefined,
        rmbCounter:
          security["RMB Counter"] === null
            ? undefined
            : String(security["RMB Counter"]),
      });
      return;
    }
    if (companyRow && !companyRow.websiteUrl?.trim()) {
      void patchCompany({
        companyId: companyRow._id,
        websiteUrl: listingUrl,
      });
    }
  }, [
    companyLoading,
    companyRow,
    createCompany,
    listingUrl,
    listDescription,
    patchCompany,
    security,
    ticker,
  ]);

  const startDiscovery = useCallback(async () => {
    setScanBusy(true);
    try {
      await requestDiscovery({ ticker });
    } finally {
      setScanBusy(false);
    }
  }, [requestDiscovery, ticker]);

  const onScan = () => void startDiscovery();

  useEffect(() => {
    if (autoDiscoveryAttempted.current) return;
    if (companyLoading) return;
    if (companyRow === null) return;
    if (documents === undefined || job === undefined) return;
    if (documents.length > 0) return;
    if (!canScan) return;
    if (jobActive) return;

    autoDiscoveryAttempted.current = true;
    void startDiscovery().catch(() => {
      autoDiscoveryAttempted.current = false;
    });
  }, [
    canScan,
    companyLoading,
    companyRow,
    documents,
    job,
    jobActive,
    startDiscovery,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to securities
        </Link>

        <header className="mb-10 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {ticker}
            </p>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              {displayName}
            </p>
            {listDescription ? (
              <p className="mt-1 text-sm text-muted-foreground/80">
                {listDescription}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 text-sm md:items-end">
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-sm items-center gap-1.5 text-primary underline-offset-4 hover:underline md:justify-end"
              title={listingUrl}
            >
              <Globe className="size-4 shrink-0" />
              <span className="text-right">
                HKEX listing page
                <span className="block text-xs font-normal text-muted-foreground">
                  Firecrawl map seed (from listings data)
                </span>
              </span>
              <ExternalLink className="size-3.5 shrink-0 opacity-60" />
            </a>
          </div>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="shrink-0 border-l-2 border-primary/40 pl-5 lg:w-72">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Discovery
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Firecrawl <strong className="text-foreground">search</strong> finds
              IR / filing pages from the company name and ticker, then{" "}
              <strong className="text-foreground">crawl</strong> collects PDF
              links. The HKEX listing URL from{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                ListOfSecurities.json
              </code>{" "}
              is only a fallback if search is thin. When there are no PDFs yet,
              a scan starts automatically. You can refresh or leave — the job
              keeps running.
            </p>

            {companyLoading ? (
              <div className="mt-6 h-24 animate-pulse rounded-md bg-muted/40" />
            ) : companyRow === null && security ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Preparing company record…
              </div>
            ) : companyRow === null && !security ? (
              <p className="mt-6 text-sm text-muted-foreground">
                This ticker is not in{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  ListOfSecurities.json
                </code>
                . Add it there or open an existing company record from elsewhere
                to run discovery.
              </p>
            ) : null}

            {!companyLoading && companyRow ? (
              <div className="mt-6 space-y-4">
                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={!canScan || scanBusy || Boolean(jobActive)}
                  onClick={() => void onScan()}
                >
                  {scanBusy || jobActive ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ScanSearch className="size-4" />
                  )}
                  {jobActive ? "Scan in progress…" : "Scan for PDFs"}
                </Button>

                <div className="space-y-2 border-t border-border pt-4">
                  {discoverySteps(job ?? undefined)}
                </div>

                {job?.phaseDetail ? (
                  <p className="text-xs text-muted-foreground">
                    {job.phaseDetail}
                  </p>
                ) : null}

                {job && job.status === "persisting" && job.totalCandidates > 0 ? (
                  <Progress value={saveProgress} className="h-1.5" />
                ) : null}

                {job?.discoverySeedUrl ? (
                  <p className="break-all font-mono text-[10px] text-muted-foreground">
                    Seed: {job.discoverySeedUrl}
                  </p>
                ) : null}

                {job && (job.status === "queued" || job.status === "mapping" || job.status === "context") ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/50" />
                  </div>
                ) : null}

                {job?.status === "failed" && job.errorMessage ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Scan failed</AlertTitle>
                    <AlertDescription>{job.errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {job?.status === "completed" ? (
                  <p className="text-xs text-muted-foreground">
                    Last run saved {job.savedCount} new document
                    {job.savedCount === 1 ? "" : "s"}
                    {job.skippedDuplicateCount > 0
                      ? ` · ${job.skippedDuplicateCount} duplicate(s) skipped`
                      : ""}
                    .
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>

          <main className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Documents
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              PDFs linked from your discovery runs (newest first).
            </p>

            {documents === undefined ? (
              <div className="mt-8 space-y-3">
                <div className="h-12 animate-pulse rounded-md bg-muted/40" />
                <div className="h-12 animate-pulse rounded-md bg-muted/40" />
              </div>
            ) : documents.length === 0 ? (
              <div className="mt-10 rounded-lg border border-border bg-muted/10 px-6 py-12 text-center">
                <p className="text-muted-foreground">
                  No documents yet. Discovery runs from the HKEX listing URL;
                  use{" "}
                  <strong className="text-foreground">Scan for PDFs</strong> in
                  the rail if a scan has not started.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {TYPE_ORDER.map((type) => {
                  const items = grouped.get(type) ?? [];
                  if (items.length === 0) return null;
                  return (
                    <Collapsible key={type} defaultOpen>
                      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left text-sm font-medium hover:bg-muted/50">
                        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                        {type}
                        <Badge variant="secondary" className="ml-auto tabular-nums">
                          {items.length}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="mt-1 space-y-1 border-l border-border/80 pl-4">
                          {items.map((doc) => (
                            <li key={doc._id}>
                              <button
                                type="button"
                                className="group flex w-full flex-col gap-1 rounded-md px-3 py-3 text-left transition-colors hover:bg-muted/40 md:flex-row md:items-center md:gap-4"
                                onClick={() =>
                                  window.open(
                                    doc.pdfUrl,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={statusBadgeVariant(doc.status)}>
                                      {doc.status}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
                                    {doc.title}
                                  </p>
                                  <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                                    {formatDate(doc.publishedDate)}
                                  </p>
                                </div>
                                <span className="shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                  Open PDF →
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
