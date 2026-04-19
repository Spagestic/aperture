"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function HistoryDropdown() {
  const user = useQuery(api.users.getCurrentUser);
  const history = useQuery(
    api.research.queries.getUserHistory,
    user ? {} : "skip",
  );

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <History className="h-5 w-5" />
          <span className="sr-only">Research history</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-75">
        <DropdownMenuLabel>Research History</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!history ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No history found.
          </div>
        ) : (
          <div className="max-h-75 overflow-y-auto">
            {history.map((run) => (
              <DropdownMenuItem
                key={run._id}
                asChild
                className="cursor-pointer"
              >
                <Link
                  href={`/event/${run.eventSlug}`}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <span className="line-clamp-2 text-sm font-medium leading-none">
                    {run.eventTitle || run.eventSlug}
                  </span>
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">
                      {run.status.replace("_", " ")}
                    </span>
                    <span>
                      {formatDistanceToNow(run.startedAt, { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
