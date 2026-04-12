import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  formatDate,
  formatMoney,
  type EventItem,
} from "@/lib/polymarket-events";

export function EventCard({ event }: { event: EventItem }) {
  const cover = event.image || event.icon;
  const slug = event.slug || event.id;

  return (
    <Item
      variant="outline"
      asChild
      className="overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <Link
        href={`/event/${slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ItemGroup className="flex-row gap-3 sm:gap-4">
          <ItemMedia
            variant="image"
            className="relative h-20 w-20 sm:h-24 sm:w-24"
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={event.title || "Polymarket event image"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-primary/40 via-primary/20 to-emerald-400/10" />
            )}
          </ItemMedia>

          <ItemContent>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {event.category || "General"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {event.markets?.length ?? 0} markets
              </span>
            </div>

            <ItemTitle className="line-clamp-1 text-base font-semibold leading-snug sm:text-lg">
              {event.title || "Untitled event"}
            </ItemTitle>
            <ItemDescription className="truncate text-xs sm:text-sm">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </ItemDescription>
            <ItemDescription className="truncate text-xs sm:text-sm">
              {formatMoney(event.volume24hr)} Vol. |{" "}
              {formatMoney(event.liquidity)} Liquidity
            </ItemDescription>
          </ItemContent>
        </ItemGroup>
      </Link>
    </Item>
  );
}
