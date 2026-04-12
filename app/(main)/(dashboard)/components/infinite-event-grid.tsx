"use client";

import { EventCard } from "./event-card";
import { EventCardSkeleton } from "./event-card-skeleton";
import { useInfiniteEvents } from "@/hooks/use-infinite-events";
import type { EventItem } from "@/lib/polymarket-events";

type InfiniteEventGridProps = {
  initialEvents: EventItem[];
  pageSize?: number;
};

export function InfiniteEventGrid({
  initialEvents,
  pageSize = 24,
}: InfiniteEventGridProps) {
  const { events, loading, error, hasMore, sentinelRef } = useInfiniteEvents({
    initialEvents,
    pageSize,
  });

  return (
    <>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 pt-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={`more-${index}`} />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {!hasMore && events.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          You&apos;re all caught up.
        </p>
      ) : null}
    </>
  );
}
