"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  IconShare3,
  IconBell,
  IconMoonStars,
  IconSunHigh,
} from "@tabler/icons-react";
import { Searchbar } from "./search-bar";
import { UserAvatar } from "./user-avatar";

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
          {" "}
          <Link href="/" className="flex items-center group">
            <Image
              alt="Logo"
              className="size-6! pixel-crisp object-cover rounded-xs dark:invert"
              height={40}
              src="/logo_.png"
              width={40}
            />
            <span className="font-semibold">Aperture</span>
          </Link>
        </div>
        <Searchbar />
        <div className=" flex items-center gap-2">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
