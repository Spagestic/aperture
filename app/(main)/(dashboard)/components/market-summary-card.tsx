import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { SummaryItem } from "./data";

type MarketSummaryCardProps = {
  items: SummaryItem[];
};

export function MarketSummaryCard({ items }: MarketSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market summary</CardTitle>
        <CardDescription>
          The main stories moving prices across your research universe.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <Accordion
          type="single"
          collapsible
          defaultValue={items[0]?.id}
          className="w-full"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base font-medium">
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
  );
}
