"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Market } from "@/lib/polymarket-events";
import { SIDE_CLASS } from "./constants";

export type MarketPickRow = {
  _id: Id<"researchMarketPicks">;
  marketId: string;
  marketQuestion?: string;
  side: string;
  conviction: number;
  rationale: string;
  keyRisk: string;
};

export function AnalyzeMarketPicks({
  picks,
  markets,
}: {
  picks: MarketPickRow[];
  markets: Market[];
}) {
  const byId = useMemo(() => {
    const m = new Map<string, Market>();
    for (const mkt of markets) m.set(String(mkt.id), mkt);
    return m;
  }, [markets]);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recommended markets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {picks.map((p) => {
          const mkt = byId.get(p.marketId);
          const question = mkt?.question ?? p.marketQuestion ?? p.marketId;
          return (
            <div
              key={p._id}
              className="rounded-lg border border-border/60 bg-background/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="max-w-2xl text-sm font-medium text-foreground">
                  {question}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("border", SIDE_CLASS[p.side])}
                  >
                    {p.side}
                  </Badge>
                  <Badge variant="secondary" className="font-mono">
                    conviction {p.conviction}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Why:</span>{" "}
                {p.rationale}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Risk:</span>{" "}
                {p.keyRisk}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
