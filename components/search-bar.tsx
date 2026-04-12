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
  AutocompleteStatus,
  useAutocompleteFilter,
} from "@/components/ui/autocomplete";
import { Spinner } from "@/components/ui/spinner";
import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import { getEvents, type EventItem } from "@/lib/polymarket-events";
import { InputGroup, InputGroupAddon } from "./ui/input-group";

type SearchEvent = EventItem & { searchText: string };

function buildSearchText(event: EventItem) {
  const marketText = (event.markets ?? [])
    .flatMap((market) => [market.question, market.id])
    .filter(Boolean)
    .join(" ");

  return [event.title, event.category, event.slug, marketText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function Searchbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState<SearchEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { contains } = useAutocompleteFilter({ sensitivity: "base" });

  React.useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const events = await getEvents();
        if (ignore) return;

        const normalizedQuery = value.trim();
        const results = events
          .map((event) => ({ ...event, searchText: buildSearchText(event) }))
          .filter((event) => {
            if (!normalizedQuery) return true;
            return contains(event.searchText, normalizedQuery);
          })
          .slice(0, 12);

        setItems(results);
      } catch {
        if (!ignore) {
          setError("Failed to load Polymarket events.");
          setItems([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [contains, open, value]);

  const status = React.useMemo(() => {
    if (loading) {
      return (
        <span className="flex items-center justify-between gap-2 text-muted-foreground">
          Searching Polymarket events...
          <Spinner className="size-4.5 sm:size-4" />
        </span>
      );
    }

    if (error) {
      return <span className="text-sm text-destructive">{error}</span>;
    }

    if (!value.trim()) {
      return (
        <span className="text-sm text-muted-foreground">
          Search events by title, category, slug, or market question.
        </span>
      );
    }

    return (
      <span className="text-sm text-muted-foreground">
        {items.length} result{items.length === 1 ? "" : "s"} found
      </span>
    );
  }, [error, items.length, loading, value]);

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setValue("");
  }, []);

  const handleSelect = React.useCallback(
    (event: SearchEvent) => {
      const slug = event.slug || event.id;
      setOpen(false);
      setValue("");
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
    <div className="flex flex-col gap-4">
      <Autocomplete
        filter={null}
        items={items}
        itemToStringValue={(item: unknown) => (item as SearchEvent).title || ""}
        onValueChange={handleQueryChange}
        open={open}
        value={value}
        onOpenChange={handleOpenChange}
      >
        <InputGroup>
          <AutocompleteInput
            placeholder="Search Polymarket events, markets, outcomes..."
            onFocus={handleQueryFocus}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <InputGroupAddon align="inline-end">
            {loading ? <Spinner className="size-4" /> : null}
          </InputGroupAddon>
        </InputGroup>
        <AutocompletePopup
          aria-busy={loading || undefined}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
        >
          <div className="border-b border-border/60 px-3 pb-2 pt-1">
            <AutocompleteStatus className="px-0 py-0 text-muted-foreground">
              {status}
            </AutocompleteStatus>
          </div>
          <AutocompleteList className="max-h-[70vh]">
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
                  >
                    <Icon className="mr-2 size-4 text-muted-foreground" />
                    {label}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            ) : null}

            <AutocompleteEmpty className="px-3 py-6">
              No matching Polymarket events found.
            </AutocompleteEmpty>

            <AutocompleteGroup>
              <AutocompleteGroupLabel>Events</AutocompleteGroupLabel>
              {items.map((event) => {
                const totalMarkets = event.markets?.length ?? 0;
                return (
                  <AutocompleteItem
                    key={event.id}
                    value={event}
                    className="rounded-xl border border-border/60 bg-card p-3"
                    onSelect={() => handleSelect(event)}
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                        {event.icon || "🎯"}
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
                          {totalMarkets > 0 ? ` · ${totalMarkets} markets` : ""}
                        </p>
                      </div>
                    </div>
                  </AutocompleteItem>
                );
              })}
            </AutocompleteGroup>
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  );
}
