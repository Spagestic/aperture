"use client";

import * as React from "react";
import type { EventItem } from "@/lib/polymarket-events";

const DEFAULT_PAGE_SIZE = 24;

export type UseInfiniteEventsOptions = {
  initialEvents: EventItem[];
  pageSize?: number;
  feedPath?: string;
  /** Distance below the viewport to start loading the next page */
  rootMargin?: string;
};

function mergeById(existing: EventItem[], batch: EventItem[]): EventItem[] {
  const seen = new Set(existing.map((e) => e.id));
  const next = [...existing];
  for (const item of batch) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

export function useInfiniteEvents({
  initialEvents,
  pageSize = DEFAULT_PAGE_SIZE,
  feedPath = "/api/polymarket/events/feed",
  rootMargin = "320px",
}: UseInfiniteEventsOptions) {
  const [events, setEvents] = React.useState<EventItem[]>(initialEvents);
  const [nextOffset, setNextOffset] = React.useState(() => initialEvents.length);
  const [hasMore, setHasMore] = React.useState(
    () => initialEvents.length === pageSize,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadingLockRef = React.useRef(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const loadMore = React.useCallback(async () => {
    if (!hasMore || loadingLockRef.current) return;
    loadingLockRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: String(nextOffset),
        limit: String(pageSize),
      });
      const response = await fetch(`${feedPath}?${params}`);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          payload?.error || "Failed to load more Polymarket events.",
        );
      }

      const batch = (await response.json()) as EventItem[];

      setEvents((prev) => mergeById(prev, batch));
      setNextOffset((o) => o + batch.length);
      setHasMore(batch.length === pageSize);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load more events.",
      );
    } finally {
      loadingLockRef.current = false;
      setLoading(false);
    }
  }, [feedPath, hasMore, nextOffset, pageSize]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) void loadMore();
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, rootMargin]);

  return {
    events,
    loading,
    error,
    hasMore,
    sentinelRef,
    loadMore,
  };
}
