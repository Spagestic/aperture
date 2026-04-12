"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@/components/ui/autocomplete";
import { Spinner } from "@/components/ui/spinner";
import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  ClockIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { EventItem } from "@/lib/polymarket-events";
import { InputGroup } from "./ui/input-group";

export function Searchbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const query = value.trim();

  React.useEffect(() => {
    if (!query) {
      setLoading(false);
      setError(null);
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      void (async () => {
        try {
          const params = new URLSearchParams({
            q: query,
            limit: "12",
          });
          const response = await fetch(`/api/polymarket/events?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;

            throw new Error(
              payload?.error || "Failed to load Polymarket events.",
            );
          }

          const nextItems = (await response.json()) as EventItem[];
          setItems(nextItems);
        } catch (fetchError) {
          if (controller.signal.aborted) return;
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load Polymarket events.",
          );
          setItems([]);
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      })();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  const handleSelect = React.useCallback(
    (event: EventItem) => {
      const slug = event.slug || event.id;
      setOpen(false);
      setValue("");
      setItems([]);
      router.push(`/event/${slug}`);
    },
    [router],
  );

  const handleQueryChange = React.useCallback((nextValue: string) => {
    setValue(nextValue);
    setOpen(true);
  }, []);

  const handleQueryFocus = React.useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Autocomplete
        filter={null}
        items={items}
        itemToStringValue={(item: unknown) =>
          typeof item === "string"
            ? item
            : ((item as EventItem).title || "")
        }
        onValueChange={handleQueryChange}
        open={open}
        value={value}
        onOpenChange={handleOpenChange}
      >
        <InputGroup>
          <AutocompleteInput
            placeholder="Search Polymarket events..."
            onFocus={handleQueryFocus}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            startAddon={<SearchIcon />}
          />
        </InputGroup>
        <AutocompletePopup aria-busy={loading || undefined} className="w-full">
          <AutocompleteList className="max-h-[70vh]">
            {query && loading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground text-sm">
                <Spinner className="size-4 shrink-0" />
                Searching…
              </div>
            ) : null}
            {query && error ? (
              <div className="px-3 py-2 text-destructive text-sm">{error}</div>
            ) : null}
            {!value.trim() ? (
              <AutocompleteGroup>
                <AutocompleteGroupLabel>Browse by topic</AutocompleteGroupLabel>
                {[
                  {
                    label: "Trending",
                    query: "trending",
                    icon: TrendingUpIcon,
                  },
                  {
                    label: "Ending soon",
                    query: "ending soon",
                    icon: ClockIcon,
                  },
                  { label: "Featured", query: "featured", icon: SparklesIcon },
                  {
                    label: "Finance",
                    query: "finance",
                    icon: BadgeDollarSignIcon,
                  },
                  { label: "Events", query: "events", icon: CalendarDaysIcon },
                ].map(({ label, query: presetQuery, icon: Icon }) => (
                  <AutocompleteItem
                    key={label}
                    value={presetQuery}
                    className="rounded-lg border border-border/60 bg-card"
                    onSelect={() => {
                      handleQueryChange(presetQuery);
                      queueMicrotask(() => setOpen(true));
                    }}
                  >
                    <Icon className="mr-2 size-4 text-muted-foreground" />
                    {label}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            ) : null}

            {query ? (
              <>
                {!loading && !error && items.length === 0 ? (
                  <AutocompleteEmpty>
                    No matching Polymarket events found.
                  </AutocompleteEmpty>
                ) : null}

                {!loading && !error && items.length > 0 ? (
                  <AutocompleteGroup>
                    {items.map((event) => {
                      const totalMarkets = event.markets?.length ?? 0;
                      const iconUrl =
                        typeof event.icon === "string" &&
                        /^https?:\/\//.test(event.icon)
                          ? event.icon
                          : null;
                      return (
                        <AutocompleteItem
                          key={event.id}
                          value={event}
                          className="rounded-md bg-card p-3"
                          onSelect={() => handleSelect(event)}
                        >
                          <div className="flex w-full items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg">
                              {iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={iconUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>{event.icon || "🎯"}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate font-medium text-sm">
                                  {event.title || "Untitled event"}
                                </span>
                                {event.category ? (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {event.category}
                                  </span>
                                ) : null}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {event.slug || event.id}
                                {totalMarkets > 0
                                  ? ` · ${totalMarkets} markets`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </AutocompleteItem>
                      );
                    })}
                  </AutocompleteGroup>
                ) : null}
              </>
            ) : null}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  );
}
