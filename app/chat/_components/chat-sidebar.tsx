"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

const conversationHistory = [
  {
    period: "Today",
    conversations: [
      { id: "t1", title: "Project roadmap discussion" },
      { id: "t2", title: "API Documentation Review" },
      { id: "t3", title: "Frontend Bug Analysis" },
    ],
  },
  {
    period: "Yesterday",
    conversations: [
      { id: "y1", title: "Database Schema Design" },
      { id: "y2", title: "Performance Optimization" },
    ],
  },
  {
    period: "Last 7 days",
    conversations: [
      { id: "w1", title: "Authentication Flow" },
      { id: "w2", title: "Component Library" },
      { id: "w3", title: "UI/UX Feedback" },
    ],
  },
  {
    period: "Last month",
    conversations: [{ id: "m1", title: "Initial Project Setup" }],
  },
];

export function ChatSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="hidden items-start px-5 pt-8 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 pl-2 text-xl font-medium tracking-tighter"
        >
          <NextImage
            alt="Logo"
            className="pixel-crisp h-6 w-6 dark:invert"
            height={40}
            src="/logo_.png"
            width={40}
          />
          <h1 className="leading-none">Aperture</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button
            variant="outline"
            className="mb-4 flex w-full items-center gap-2"
          >
            <PlusIcon className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>
        {conversationHistory.map((group) => (
          <SidebarGroup key={group.period}>
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
            <SidebarMenu>
              {group.conversations.map((conversation) => (
                <SidebarMenuButton key={conversation.id}>
                  <span>{conversation.title}</span>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
