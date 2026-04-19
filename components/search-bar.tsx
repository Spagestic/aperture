"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  ClockIcon,
  LoaderCircleIcon,
  SearchIcon,
  XIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { EventItem } from "@/lib/polymarket-events";

export function Searchbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const query = value.trim();

  const presets = React.useMemo(
    () => [
      { label: "Trending", query: "trending", icon: TrendingUpIcon },
      { label: "Ending soon", query: "ending soon", icon: ClockIcon },
      { label: "Featured", query: "featured", icon: SparklesIcon },
      { label: "Finance", query: "finance", icon: BadgeDollarSignIcon },
      { label: "Events", query: "events", icon: CalendarDaysIcon },
    ],
    [],
  );

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

  const handleClear = React.useCallback(() => {
    setValue("");
    setItems([]);
    setError(null);
    setOpen(true);
    inputRef.current?.focus();
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <InputGroup className="w-full max-w-xl bg-background shadow-sm">
          <InputGroupInput
            ref={inputRef}
            value={value}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={handleQueryFocus}
            placeholder="Search Polymarket events..."
            aria-label="Search Polymarket events"
            autoComplete="off"
            spellCheck={false}
          />
          <InputGroupAddon align="inline-start" className="pointer-events-none">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {loading ? (
              <Spinner className="size-4" />
            ) : query && !error ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {items.length} result{items.length === 1 ? "" : "s"}
                </span>
                <InputGroupButton
                  aria-label="Clear search"
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleClear}
                >
                  <XIcon />
                </InputGroupButton>
              </div>
            ) : query ? (
              <InputGroupButton
                aria-label="Clear search"
                size="icon-xs"
                variant="ghost"
                onClick={handleClear}
              >
                <XIcon />
              </InputGroupButton>
            ) : (
              <span className="px-2 text-[10px] font-medium tracking-wide text-muted-foreground">
                ⌘K
              </span>
            )}
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={10}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-(--radix-popover-trigger-width) max-w-[min(100vw-2rem,40rem)] p-0"
      >
        <div
          className="max-h-[70vh] overflow-y-auto p-2"
          aria-busy={loading || undefined}
        >
          {query && loading ? (
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Searching…
            </div>
          ) : null}

          {query && error ? (
            <div className="rounded-md px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {!query ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Browse by topic
              </div>
              <div className="grid gap-1">
                {presets.map(({ label, query: presetQuery, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => handleQueryChange(presetQuery)}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {presetQuery}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {query && !loading && !error && items.length === 0 ? (
            <div className="rounded-md px-3 py-3 text-sm text-muted-foreground">
              No matching Polymarket events found.
            </div>
          ) : null}

          {query && !loading && !error && items.length > 0 ? (
            <div className="grid gap-1">
              {items.map((event) => {
                const totalMarkets = event.markets?.length ?? 0;
                const iconUrl =
                  typeof event.icon === "string" &&
                  /^https?:\/\//.test(event.icon)
                    ? event.icon
                    : null;

                return (
                  <button
                    key={event.id}
                    type="button"
                    className="w-full rounded-md border border-border/60 bg-card p-3 text-left transition-colors hover:bg-muted/60"
                    onClick={() => handleSelect(event)}
                  >
                    <div className="flex items-center gap-3">
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

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-4">
                          <span className="line-clamp-2 font-medium text-sm">
                            {event.title || "Untitled event"}
                          </span>
                          {totalMarkets > 0 ? (
                            <span className="hidden sm:block shrink-0 text-xs text-muted-foreground pt-0.5">
                              {totalMarkets} market
                              {totalMarkets === 1 ? "" : "s"}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {event.category ? (
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {event.category}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
