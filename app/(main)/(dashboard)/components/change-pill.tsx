import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Tone } from "./data";

type ChangePillProps = {
  tone: Tone;
  value: string;
};

export function ChangePill({ tone, value }: ChangePillProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-xs",
        tone === "up" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        tone === "down" &&
          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
      )}
    >
      <span className="flex items-center gap-1">
        {tone === "up" && <ArrowUpRight className="size-3" />}
        {tone === "down" && <ArrowDownRight className="size-3" />}
        {value}
      </span>
    </Badge>
  );
}
