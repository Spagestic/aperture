import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

import type { SummaryItem } from "./data";

type MarketSummaryCardProps = {
  items: SummaryItem[];
};

export function MarketSummaryCard({ items }: MarketSummaryCardProps) {
  return (
    <div className="">
      <div className="pb-2 mx-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium tracking-wide text-accent-foreground/80">
          Market Summary
        </span>
        <span className="text-xs font-normal tracking-wide text-muted-foreground/80">
          Updated 2 mins ago
        </span>
      </div>
      <Card className="p-0">
        <CardContent className="pt-0 px-4">
          <Accordion
            type="single"
            collapsible
            defaultValue={items[0]?.id}
            className="w-full py-0"
          >
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
