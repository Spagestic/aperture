import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/polymarket-events";
import { buildAnalyzePrompt, resolveEvent } from "./event-page-utils";
import { EventSummaryCard } from "./event-summary-card";
import { MarketList } from "./market-list";

export async function EventPageContent({ slug }: { slug: string }) {
  const event = await resolveEvent(slug);

  if (!event) {
    notFound();
  }

  const markets = event.markets ?? [];
  const analyzePrompt = buildAnalyzePrompt(event, markets);
  const totalLiquidity = formatMoney(event.liquidity);
  const totalVolume = formatMoney(event.volume24hr);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex w-full items-center justify-between gap-2">
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/">Back to events</Link>
          </Button>
          <Button asChild className="shrink-0">
            <Link
              href={{
                pathname: "/chat",
                query: { prompt: analyzePrompt },
              }}
            >
              Analyze
            </Link>
          </Button>
        </div>

        <section className="space-y-6">
          <EventSummaryCard
            event={event}
            totalVolume={totalVolume}
            totalLiquidity={totalLiquidity}
          />
          <MarketList markets={markets} />
        </section>
      </div>
    </div>
  );
}
