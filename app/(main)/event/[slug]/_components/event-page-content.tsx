import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/polymarket-events";
import { resolveEvent } from "./event-page-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventSummaryCard } from "./event-summary-card";
import { MarketList } from "./market-list";
import { AnalyzePanel } from "./analyze-panel";

export async function EventPageContent({ slug }: { slug: string }) {
  const event = await resolveEvent(slug);

  if (!event) {
    notFound();
  }

  const markets = event.markets ?? [];
  const totalLiquidity = formatMoney(event.liquidity);
  const totalVolume = formatMoney(event.volume24hr);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="shrink-0">
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/">Back to events</Link>
              </Button>
            </div>
            <TabsList variant="default" className="ml-auto w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analyze">Analyze</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <EventSummaryCard
              event={event}
              totalVolume={totalVolume}
              totalLiquidity={totalLiquidity}
            />
            <MarketList markets={markets} />
          </TabsContent>

          <TabsContent value="analyze" className="mt-6">
            <AnalyzePanel event={event} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
