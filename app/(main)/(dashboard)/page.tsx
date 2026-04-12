import { Suspense } from "react";
import { EventCardSkeleton } from "./components/event-card-skeleton";
import { InfiniteEventGrid } from "./components/infinite-event-grid";
import { getEventsPage, type EventItem } from "@/lib/polymarket-events";

const INITIAL_PAGE_SIZE = 24;

export type PolymarketEventsDashboardProps = {
  events: EventItem[];
  loadError: string | null;
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  let events: EventItem[] = [];
  let loadError: string | null = null;

  try {
    events = await getEventsPage({ offset: 0, limit: INITIAL_PAGE_SIZE });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load events.";
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        {loadError ? <p className="text-red-500">{loadError}</p> : null}

        {events.length > 0 ? (
          <InfiniteEventGrid
            initialEvents={events}
            pageSize={INITIAL_PAGE_SIZE}
          />
        ) : null}
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
