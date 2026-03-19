"use client";

import * as React from "react";
import {
  IconCalendarFilled,
  IconChartBar,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconListDetails,
  IconReport,
} from "@tabler/icons-react";
import Image from "next/image";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavDocuments } from "@/components/sidebar/nav-documents";
import { NavHistory } from "@/components/sidebar/nav-history";
import {} from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Watchlist",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Documents",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Screeners",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Calendar",
      url: "#",
      icon: IconCalendarFilled,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
    {
      name: "Earnings Call Summaries",
      url: "#",
      icon: IconReport,
    },
  ],
  history: [
    {
      name: "compare Apple and Microsoft gross margin over 5 years",
      url: "#",
    },
    {
      name: "what changed in NVIDIA’s latest 8-K filing?",
      url: "#",
    },
    {
      name: "summarize the latest TSM transcript",
      url: "#",
    },
    {
      name: "show 2024 filings mentioning tariffs",
      url: "#",
    },
    {
      name: "what are the top holdings in ARKK ETF?",
      url: "#",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible={"icon"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              // tooltip={"Aperture"}
            >
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
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-scroll [&::-webkit-scrollbar]:hidden">
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavHistory items={data.history} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
