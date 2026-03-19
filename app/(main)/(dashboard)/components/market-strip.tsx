import { getMarketStrip } from "@/lib/providers/yahoo";
import { Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

export async function MarketStrip() {
  const marketData = await getMarketStrip();

  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center gap-2">
        {marketData.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-md bg-secondary px-2 py-2 text-xs font-medium"
          >
            <span className="text-secondary-foreground/90">{item.label}</span>
            <span className="text-secondary-foreground/80">{item.price}</span>
            <span
              className={cn(
                "flex items-center gap-0.5",
                item.flat
                  ? "text-muted-foreground"
                  : item.up
                    ? "text-emerald-500"
                    : "text-rose-500",
              )}
            >
              <Triangle
                className={cn(
                  "h-3 w-3 fill-current",
                  !item.up && !item.flat && "rotate-180",
                )}
              />
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
