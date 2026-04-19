import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-6 w-20" />
    </div>
  );
}

function MarketCardSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-3/4 max-w-[18rem]" />
          <Skeleton className="mt-2 h-3 w-1/3 max-w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-start justify-between gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventPageSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        <section className="space-y-6">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
                <Skeleton className="aspect-4/3 w-full rounded-lg" />
                <div className="min-w-0 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-9 w-3/4 max-w-160" />
                    <Skeleton className="h-5 w-1/2 max-w-[24rem]" />
                    <Skeleton className="h-5 w-2/3 max-w-120" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                  </div>
                </div>
              </div>
              <Skeleton className="h-5 w-full max-w-240" />
              <Skeleton className="h-5 w-5/6 max-w-220" />
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <MarketCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
