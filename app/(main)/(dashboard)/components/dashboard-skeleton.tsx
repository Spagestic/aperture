import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left: Market pulse + summary */}
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden rounded-2xl border border-border/50 bg-card/95 pt-4 pb-0"
                >
                  <CardContent className="p-0">
                    <div className="px-4 pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="mt-2 h-4 w-16" />
                        </div>
                        <div className="shrink-0 text-right">
                          <Skeleton className="h-4 w-14" />
                          <Skeleton className="mt-2 h-3 w-12" />
                        </div>
                      </div>
                    </div>
                    <div className="h-18 w-full pt-2">
                      <Skeleton className="h-full w-full rounded-none" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div>
            <div className="pb-2 mx-2 flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Card className="rounded-lg border">
              <div className="space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                  >
                    <Skeleton className="h-4 flex-1 max-w-[85%]" />
                    <Skeleton className="h-4 w-4 shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Watchlist, Upcoming, Filings */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-1 h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-3 w-12" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="mt-1 h-5 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
