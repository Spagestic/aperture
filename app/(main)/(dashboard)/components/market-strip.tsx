import { Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

const marketData = [
  { symbol: "S&P 500", price: "6,699.38", change: "1.01%", up: true },
  { symbol: "Nasdaq", price: "22,374.18", change: "1.22%", up: true },
  { symbol: "B500", price: "2,416.29", change: "1.05%", up: true },
  { symbol: "US 10 Yr", price: "4.23", change: "0.00%", up: true, flat: true },
  { symbol: "Crude Oil", price: "97.33", change: "4.10%", up: true },
  { symbol: "FTSE 100", price: "8,234.12", change: "0.50%", up: false },
  {
    symbol: "DAX",
    price: "15,123.45",
    change: "0.75%",
    up: false,
  },
  {
    symbol: "Nikkei 225",
    price: "28,567.89",
    change: "0.30%",
    up: true,
  },
];

export function MarketStrip() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center gap-2">
        {marketData.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium"
          >
            <span className="text-secondary-foreground">{item.symbol}</span>
            <span className="text-secondary-foreground">{item.price}</span>
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
