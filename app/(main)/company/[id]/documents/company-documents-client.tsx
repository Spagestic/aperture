"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function CompanyDocumentsClient({ ticker }: { ticker: string }) {
  const documents = useQuery(api.documents.listByTicker, { ticker });

  if (documents === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Documents Found</CardTitle>
          <CardDescription>
            We couldn&apos;t find any documents for {ticker} in our database.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-140 rounded-md border">
        <Table>
          <TableBody>
            {documents.map((doc) => {
              return (
                <TableRow
                  key={doc._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    window.open(doc.pdfUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-fit">
                        {doc.type}
                      </Badge>
                      <span className="line-clamp-2">{doc.title}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
