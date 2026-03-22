"use client";

import Link from "next/link";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CompanyRow } from "./company-columns";

interface CompanyRowActionsProps {
  row: Row<CompanyRow>;
}

export function CompanyRowActions({ row }: CompanyRowActionsProps) {
  const company = row.original;
  const documentsHref = `/company/${encodeURIComponent(company.ticker)}/documents`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-45">
        <DropdownMenuItem asChild>
          <Link href={documentsHref}>View documents</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={company.websiteUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit website
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
