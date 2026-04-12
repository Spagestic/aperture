"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ClockIcon,
  DropletIcon,
  FlameIcon,
  SearchIcon,
  SparklesIcon,
  SwordsIcon,
  TrendingUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Searchbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className={cn(
          "relative h-9 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg justify-between px-3 py-2",
          "text-sm sm:text-base",
        )}
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="md:hidden truncate font-normal text-sm text-muted-foreground">
          Search events...
        </span>
        <span className="hidden md:inline-flex text-sm truncate font-normal text-muted-foreground">
          Search Polymarket events, markets, outcomes and more...
        </span>
        <span className="sr-only">
          Search Polymarket events, markets, outcomes and more...
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search Polymarket events or type a command..." />
        <CommandList className="max-h-[80vh] overflow-y-auto">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="HOW TO BROWSE" className="px-2 py-4">
            <div className="flex flex-wrap gap-2">
              <CommandItem
                value="New"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <SparklesIcon className="mr-2 size-4" />
                New
              </CommandItem>
              <CommandItem
                value="Trending"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <TrendingUpIcon className="mr-2 size-4" />
                Trending
              </CommandItem>
              <CommandItem
                value="Popular"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FlameIcon className="mr-2 size-4" />
                Popular
              </CommandItem>
              <CommandItem
                value="Liquid"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <DropletIcon className="mr-2 size-4" />
                Liquid
              </CommandItem>
              <CommandItem
                value="Ending Soon"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <ClockIcon className="mr-2 size-4" />
                Ending Soon
              </CommandItem>
              <CommandItem
                value="Competitive"
                className="h-9 rounded-full border border-muted-foreground/20 bg-card hover:bg-accent hover:text-accent-foreground text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <SwordsIcon className="mr-2 size-4" />
                Competitive
              </CommandItem>
            </div>
          </CommandGroup>

          <CommandGroup heading="TOPICS" className="px-2 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CommandItem
                value="Live Crypto"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  📈
                </div>
                <span className="font-semibold text-sm">Live Crypto</span>
              </CommandItem>
              <CommandItem
                value="Politics"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  🏛️
                </div>
                <span className="font-semibold text-sm">Politics</span>
              </CommandItem>
              <CommandItem
                value="Middle East"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  🌍
                </div>
                <span className="font-semibold text-sm">Middle East</span>
              </CommandItem>
              <CommandItem
                value="Crypto"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  ₿
                </div>
                <span className="font-semibold text-sm">Crypto</span>
              </CommandItem>
              <CommandItem
                value="Sports"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  🏀
                </div>
                <span className="font-semibold text-sm">Sports</span>
              </CommandItem>
              <CommandItem
                value="Pop Culture"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  🎬
                </div>
                <span className="font-semibold text-sm">Pop Culture</span>
              </CommandItem>
              <CommandItem
                value="Tech"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  💻
                </div>
                <span className="font-semibold text-sm">Tech</span>
              </CommandItem>
              <CommandItem
                value="AI"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-lg">
                  🤖
                </div>
                <span className="font-semibold text-sm">AI</span>
              </CommandItem>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
