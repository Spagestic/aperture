"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink, TrendingUp, Zap } from "lucide-react";
import {
  formatDate,
  formatMoney,
  topOutcome,
  type Market,
  type PolymarketEvent,
} from "@/lib/polymarket-events";
import { marketTitle, normalizeSlug } from "./helpers";

type CompactEventDetailsProps = {
  event: PolymarketEvent;
  slug: string;
  categories: string[];
  eventMarkets: Market[];
};

// Separate component to avoid render issues
interface CompactSectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

function CompactSection({
  id,
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
}: CompactSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={() => onToggle(id)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between rounded-b-none px-4 py-3 font-normal hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{title}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border">
          <div className="space-y-4 p-4">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function CompactEventDetails({
  event,
  slug,
  eventMarkets,
}: CompactEventDetailsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    stats: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const topEventOutcome = eventMarkets[0] ? topOutcome(eventMarkets[0]) : null;

  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <CompactSection
        id="overview"
        title="Event Overview"
        icon={ExternalLink}
        isOpen={openSections.overview ?? true}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(event.startDate)} — {formatDate(event.endDate)}
            </p>
          </div>

          {event.description && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge>{event.category || "General"}</Badge>
            {event.active && <Badge variant="default">Active</Badge>}
            {event.closed && <Badge variant="outline">Closed</Badge>}
            {event.featured && <Badge variant="secondary">Featured</Badge>}
          </div>
        </div>
      </CompactSection>

      {/* Stats Section */}
      <CompactSection
        id="stats"
        title="Market Statistics"
        icon={TrendingUp}
        isOpen={openSections.stats ?? true}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Liquidity" value={formatMoney(event.liquidity)} />
          <StatItem
            label="Volume"
            value={formatMoney(event.volume ?? event.volume24hr)}
          />
          <StatItem
            label="Open Interest"
            value={formatMoney(event.openInterest)}
          />
          <StatItem label="Markets" value={eventMarkets.length} />
        </div>

        {topEventOutcome && (
          <div className="rounded-md border border-border/60 bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Top Outcome
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {topEventOutcome.name} · {topEventOutcome.probability}
            </p>
          </div>
        )}
      </CompactSection>

      {/* Details Section */}
      <CompactSection
        id="details"
        title="Details"
        icon={Zap}
        isOpen={openSections.details ?? false}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Event ID
            </p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">
              {event.id}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Slug
            </p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">
              {slug || event.slug || normalizeSlug(event.title)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Resolution Source
            </p>
            <p className="mt-1 text-sm text-foreground">
              {event.resolutionSource || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Last Updated
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatDate(event.updatedAt || event.creationDate)}
            </p>
          </div>

          <Button asChild className="w-full" variant="outline" size="sm">
            <Link
              href={`https://polymarket.com/event/${encodeURIComponent(slug || event.slug || normalizeSlug(event.title))}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on Polymarket
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CompactSection>

      {/* Markets Section */}
      {eventMarkets.length > 0 && (
        <CompactSection
          id="markets"
          title={`Markets (${eventMarkets.length})`}
          icon={TrendingUp}
          isOpen={openSections.markets ?? false}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            {eventMarkets.map((market, index) => {
              const outcome = topOutcome(market);
              return (
                <div
                  key={market.id}
                  className="flex items-start justify-between rounded-md border border-border/60 bg-muted/30 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {marketTitle(market, index)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {market.id}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {outcome ? outcome.probability : "N/A"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CompactSection>
      )}
    </div>
  );
}
