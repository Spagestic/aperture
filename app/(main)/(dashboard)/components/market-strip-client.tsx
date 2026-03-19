"use client";

import useSWR from "swr";
import { Triangle } from "lucide-react";
import type { MarketStripItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const fetcher = async (url: string): Promise<MarketStripItem[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load market strip");
  }

  return response.json();
};

type MarketStripClientProps = {
  initialData: MarketStripItem[];
};

export function MarketStripClient({ initialData }: MarketStripClientProps) {
  const { data = initialData } = useSWR(
    "/api/dashboard/market-strip",
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 30000,
      revalidateOnFocus: false,
    },
  );

  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center gap-2">
        {data.map((item) => {
          const flat = Math.abs(item.change) < 0.0001;
          const up = flat ? true : item.change >= 0;

          return (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md bg-secondary px-2 py-2 text-xs font-medium"
            >
              <span className="text-secondary-foreground/90">{item.label}</span>
              <span className="text-secondary-foreground/80">
                {new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.price)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5",
                  flat
                    ? "text-muted-foreground"
                    : up
                      ? "text-emerald-500"
                      : "text-rose-500",
                )}
              >
                <Triangle
                  className={cn(
                    "h-3 w-3 fill-current",
                    !up && !flat && "rotate-180",
                  )}
                />
                {new Intl.NumberFormat("en-US", {
                  signDisplay: "exceptZero",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.change)}
                %
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
