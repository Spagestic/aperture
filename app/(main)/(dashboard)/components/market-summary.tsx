import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { SummaryItem } from "./data";

type MarketSummaryProps = {
  items: SummaryItem[];
};

export function MarketSummary({ items }: MarketSummaryProps) {
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

      <Accordion
        type="single"
        collapsible
        defaultValue={items[0]?.id}
        className="w-full rounded-lg border"
      >
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border-b px-4 last:border-b-0"
          >
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">
              {item.summary}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
