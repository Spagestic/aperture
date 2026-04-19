"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AnalyzeSpeculativeNotice({ reason }: { reason?: string }) {
  return (
    <Card className="border-amber-500/40">
      <CardContent className="flex items-start gap-3 pt-6">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold">This event looks speculative</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reason ??
              "The classifier judged it not researchable with public sources."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
