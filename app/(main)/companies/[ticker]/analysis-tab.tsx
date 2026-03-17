"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, AlertCircle, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AnalysisTab({ ticker }: { ticker: string }) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/analysis/${ticker}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [ticker]);

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h2 className="text-sm font-semibold">AI Analysis</h2>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Bot className="w-3 h-3" />
          Mistral AI
        </Badge>
      </div>

      <Separator />

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Failed to load analysis</AlertTitle>
          <AlertDescription>
            Check your Mistral API key and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Content */}
      {!loading && !error && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Generated analysis for{" "}
              <span className="text-foreground font-semibold">{ticker}</span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-semibold
                prose-headings:text-foreground
                prose-p:text-muted-foreground
                prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-li:text-muted-foreground
              ">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

    </div>
  );
}