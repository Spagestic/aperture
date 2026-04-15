"use client";

import { useState, useEffect, type FormEvent } from "react";
import { type PolymarketEvent } from "@/lib/polymarket-events";
import { EmptyState } from "./_components/empty-state";
import { extractSlugFromInput } from "./_components/helpers";
import { LookupForm } from "./_components/lookup-form";
import testEventData from "@/us-x-iran-permanent-peace-deal-by.json";
import { CompactEventDetails } from "./_components/compact-event-details";

export default function AgentPage() {
  const [inputUrl, setInputUrl] = useState(
    "https://polymarket.com/event/us-x-iran-permanent-peace-deal-by",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("us-x-iran-permanent-peace-deal-by");
  const [event, setEvent] = useState<PolymarketEvent | null>(null);

  // Load local test data on mount
  useEffect(() => {
    setEvent(testEventData as PolymarketEvent);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nextSlug = extractSlugFromInput(inputUrl);
    if (!nextSlug) {
      setError("Please paste a valid Polymarket event URL.");
      setEvent(null);
      setSlug("");
      return;
    }

    setLoading(true);
    setError(null);
    setSlug(nextSlug);
    setEvent(null);

    try {
      // For development: use local test data
      if (nextSlug === "us-x-iran-permanent-peace-deal-by") {
        setEvent(testEventData as PolymarketEvent);
      } else {
        // For other slugs, fall back to API
        const response = await fetch(
          `/api/polymarket/events/slug/${encodeURIComponent(nextSlug)}?include_chat=false&include_template=false`,
        );

        const payload = (await response.json().catch(() => null)) as
          | PolymarketEvent
          | { error?: string }
          | null;

        if (!response.ok) {
          const message =
            response.status === 404
              ? "No Polymarket event was found for that slug."
              : payload && "error" in payload && payload.error
                ? payload.error
                : "Failed to load the Polymarket event.";
          throw new Error(message);
        }

        setEvent(payload as PolymarketEvent);
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load the Polymarket event.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <LookupForm
          inputUrl={inputUrl}
          loading={loading}
          error={error}
          slug={slug}
          onInputChange={setInputUrl}
          onSubmit={handleSubmit}
        />

        {event ? (
          <CompactEventDetails
            event={event}
            slug={slug}
            categories={[]}
            eventMarkets={event?.markets ?? []}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
