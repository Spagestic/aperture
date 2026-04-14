"use client";

import Link from "next/link";
import Image from "next/image";

import { Searchbar } from "./search-bar";
import { UserAvatar } from "./user-avatar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <div className="flex shrink-0 items-center gap-1">
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
        <div className="min-w-0 flex-1 justify-center px-2 sm:flex">
          <Searchbar />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
