"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { Searchbar } from "./search-bar";
import { UserAvatar } from "./user-avatar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
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
