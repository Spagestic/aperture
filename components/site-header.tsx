"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import {
  IconShare3,
  IconBell,
  IconMoonStars,
  IconSunHigh,
} from "@tabler/icons-react";
import { Searchbar } from "./search-bar";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <Searchbar />
        <div className=" flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <IconSunHigh />
              ) : (
                <IconMoonStars />
              )
            ) : (
              <span className="size-5" aria-hidden="true" />
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <IconBell />
          </Button>
          <Button variant="ghost" size="sm">
            <IconShare3 />
            <span className="hidden lg:inline">Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
