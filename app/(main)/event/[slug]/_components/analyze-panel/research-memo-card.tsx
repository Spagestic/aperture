"use client";

import { Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyzeResearchMemoCard({ markdown }: { markdown: string }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Research memo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
          <Streamdown>{markdown}</Streamdown>
        </div>
      </CardContent>
    </Card>
  );
}
