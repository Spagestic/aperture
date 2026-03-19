import { Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

const marketData = [
  {
    symbol: "S&P 500",
    price: "6,699.38",
    change: "1.01%",
    up: true,
    sparkline: [18, 17, 19, 16, 20, 21, 19, 22],
  },
  {
    symbol: "Nasdaq",
    price: "22,374.18",
    change: "1.22%",
    up: true,
    sparkline: [14, 15, 14, 16, 17, 18, 19, 21],
  },
  {
    symbol: "Russell 2000",
    price: "2,416.29",
    change: "1.05%",
    up: true,
    sparkline: [12, 12, 13, 12, 14, 15, 14, 16],
  },
  {
    symbol: "US 10Y",
    price: "4.23",
    change: "0.00%",
    up: true,
    flat: true,
    sparkline: [15, 15, 15, 15, 15, 15, 15, 15],
  },
  {
    symbol: "DXY",
    price: "104.12",
    change: "0.18%",
    up: false,
    sparkline: [20, 19, 20, 18, 19, 17, 18, 16],
  },
  {
    symbol: "WTI / Brent",
    price: "83.44 / 87.31",
    change: "1.24%",
    up: true,
    sparkline: [13, 14, 13, 15, 16, 18, 17, 19],
  },
  {
    symbol: "Gold",
    price: "2,347.90",
    change: "0.62%",
    up: true,
    sparkline: [16, 15, 16, 17, 17, 18, 19, 20],
  },
  {
    symbol: "BTC",
    price: "67,842.15",
    change: "2.05%",
    up: true,
    sparkline: [11, 13, 12, 14, 15, 16, 18, 21],
  },
  {
    symbol: "VIX",
    price: "14.88",
    change: "3.11%",
    up: false,
    sparkline: [19, 20, 19, 21, 20, 22, 23, 24],
  },
];

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const width = 44;
  const height = 16;
  const range = Math.max(max - min, 1);

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 2) - 1;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className={cn(
        "h-4 w-11 shrink-0",
        up ? "text-emerald-500" : "text-rose-500",
      )}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketStrip() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center gap-2">
        {marketData.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center gap-2 rounded-md bg-secondary px-2 py-2 text-xs font-medium"
          >
            <span className="text-secondary-foreground/90">{item.symbol}</span>
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
            <Sparkline
              points={item.sparkline}
              up={item.flat ? true : item.up}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
