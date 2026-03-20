"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function CompanyDocumentsClient({ ticker }: { ticker: string }) {
  const documents = useQuery(api.documents.listByTicker, { ticker });
  const processDocument = useAction(
    api.processDocuments.processPendingDocument,
  );
  const [processingIds, setProcessingIds] = useState<Set<Id<"documents">>>(
    new Set(),
  );

  const handleProcess = async (docId: Id<"documents">) => {
    try {
      setProcessingIds(new Set(processingIds).add(docId));
      toast.info("Extracting document data with Mistral...");
      await processDocument({ documentId: docId });
      toast.success("Document extracted successfully!");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process document",
      );
    } finally {
      const nextIds = new Set(processingIds);
      nextIds.delete(docId);
      setProcessingIds(nextIds);
    }
  };

  if (documents === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Documents Found</CardTitle>
          <CardDescription>
            We couldn&apos;t find any documents for {ticker} in our database.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const isCompleted = doc.status === "completed";
        const isProcessing = doc.status === "processing";
        const isPending = doc.status === "pending";
        return (
          <Card key={doc._id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {doc.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{doc.type}</Badge>
                  {doc.publishedDate && <span>• {doc.publishedDate}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing
                  </Badge>
                )}
                {isPending && <Badge variant="secondary">Pending</Badge>}
                {isCompleted && <Badge variant="default">Parsed</Badge>}
                <Link
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm line-clamp-3 text-muted-foreground">
                {doc.markdownContent
                  ? doc.markdownContent
                  : "Content not yet extracted. Requires parsing."}
              </div>
            </CardContent>{" "}
            {isPending && (
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProcess(doc._id)}
                  disabled={processingIds.has(doc._id)}
                >
                  {processingIds.has(doc._id) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                  )}
                  Extract with Mistral
                </Button>
              </CardFooter>
            )}{" "}
          </Card>
        );
      })}
    </div>
  );
}
