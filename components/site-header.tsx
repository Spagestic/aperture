import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconShare3, IconBell } from "@tabler/icons-react";
import { Searchbar } from "./search-bar";

export function SiteHeader() {
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
