import { Skeleton } from "@/components/ui/skeleton";

export function FinancialDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Skeleton className="h-[460px] rounded-3xl" />
        <Skeleton className="h-[460px] rounded-3xl" />
      </div>
    </div>
  );
}