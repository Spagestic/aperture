"use client";

import { useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, Link2, TriangleAlert } from "lucide-react";

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

function statusTone(status: string) {
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

export function CompanyDocumentsClient({ ticker }: { ticker: string }) {
  const [isBusy, setIsBusy] = useState(false);
  const documents = useQuery(api.documents.listByTicker, { ticker });
  const company = useQuery(api.companies.getByTicker, { ticker });
  const startDiscovery = useAction(api.discoverDocuments.mapCompanyDocuments);
  const retryFailed = useAction(api.processDocuments.retryFailedDocuments);

  const counts = useMemo(() => {
    const base = { pending: 0, processing: 0, completed: 0, failed: 0 };
    for (const doc of documents ?? []) {
      if (doc.status in base) {
        base[doc.status as keyof typeof base] += 1;
      }
    }
    return base;
  }, [documents]);

  const onDiscover = async () => {
    setIsBusy(true);
    try {
      await startDiscovery({ ticker });
    } finally {
      setIsBusy(false);
    }
  };

  const onRetryFailed = async () => {
    setIsBusy(true);
    try {
      await retryFailed({ ticker });
    } finally {
      setIsBusy(false);
    }
  };

  if (documents === undefined || company === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company not found</CardTitle>
          <CardDescription>
            We couldn&apos;t find a Convex company record for {ticker} yet. The
            dashboard entry may need to seed this company first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasDocuments = documents.length > 0;
  const hasFailed = counts.failed > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total", value: documents.length },
          { label: "Pending", value: counts.pending },
          { label: "Processing", value: counts.processing },
          { label: "Completed", value: counts.completed },
          { label: "Failed", value: counts.failed },
        ].map((item) => (
          <Card key={item.label} size="sm">
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Financial document workspace</CardTitle>
              <CardDescription>
                Discover HKEX filings from Firecrawl, retry failed OCR jobs, and
                keep browsing this page while Convex finishes extracting titles
                and PDF links.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={onDiscover} disabled={isBusy}>
                <RefreshCw className={isBusy ? "animate-spin" : ""} />
                {isBusy ? "Working…" : "Run discovery"}
              </Button>
              <Button
                variant="outline"
                onClick={onRetryFailed}
                disabled={isBusy || !hasFailed}
              >
                <TriangleAlert />
                Retry failed
              </Button>
              {company.websiteUrl ? (
                <Button variant="outline" asChild>
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                    <Link2 />
                    Company website
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {!company.websiteUrl ? (
            <Card>
              <CardHeader>
                <CardTitle>Discovery unavailable</CardTitle>
                <CardDescription>
                  This company does not yet have a websiteUrl in Convex, so
                  Firecrawl cannot start until that field is added.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : !hasDocuments ? (
            <Card>
              <CardHeader>
                <CardTitle>No documents discovered yet</CardTitle>
                <CardDescription>
                  Click <strong>Run discovery</strong> to scan {ticker} for
                  annual reports, interim reports, announcements, and other
                  PDFs.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {hasFailed ? (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <TriangleAlert className="size-4" />
                  Some documents failed to process
                </CardTitle>
                <CardDescription>
                  Use <strong>Retry failed</strong> to run OCR again for the
                  failed items.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {hasDocuments ? (
            <div className="rounded-md border">
              <ScrollArea className="max-h-152 rounded-md">
                <Table>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow
                        key={doc._id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() =>
                          window.open(
                            doc.pdfUrl,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <TableCell className="w-md align-top font-medium">
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={statusTone(doc.status)}>
                                {doc.status}
                              </Badge>
                              <Badge variant="outline">{doc.type}</Badge>
                            </div>
                            <span className="line-clamp-2">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-muted-foreground">
                          {formatDate(doc.publishedDate)}
                        </TableCell>
                        <TableCell className="align-top text-muted-foreground">
                          {doc.pdfUrl}
                        </TableCell>
                        <TableCell className="align-top text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={doc.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open PDF
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
