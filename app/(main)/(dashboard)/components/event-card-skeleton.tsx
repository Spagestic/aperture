import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <div className="flex gap-3 p-4 sm:gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24" />

        <div className="min-w-0 flex-1 space-y-3 py-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="h-5 w-full max-w-[18rem]" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    </div>
  );
}
