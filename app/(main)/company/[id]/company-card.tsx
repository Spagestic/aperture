import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { CompanyProfile } from "@/lib/financial-dashboard";
import { Separator } from "@/components/ui/separator";

type CompanyCardProps = {
  profile?: CompanyProfile;
};

const UNKNOWN = "—";

export default function CompanyCard({ profile }: CompanyCardProps) {
  const resolvedProfile: CompanyProfile = profile ?? {
    slug: "unknown",
    name: "Company",
    ticker: UNKNOWN,
    exchange: UNKNOWN,
    sector: UNKNOWN,
    sourceLabel: UNKNOWN,
  };

  const description = `${resolvedProfile.name} (${resolvedProfile.ticker}) is a ${resolvedProfile.sector.toLowerCase()} company listed on ${resolvedProfile.exchange}${resolvedProfile.country ? ` and headquartered in ${resolvedProfile.country}` : ""}.`;

  const rows = [
    { label: "Symbol", value: resolvedProfile.ticker },
    { label: "IPO Date", value: UNKNOWN },
    { label: "CEO", value: UNKNOWN },
    { label: "Fulltime Employees", value: UNKNOWN },
    { label: "Sector", value: resolvedProfile.sector },
    { label: "Industry", value: UNKNOWN },
    { label: "Country", value: resolvedProfile.country ?? UNKNOWN },
    { label: "Exchange", value: resolvedProfile.exchange },
  ];

  return (
    <Card
      size="sm"
      className="mx-auto w-full max-w-xs border-border/60 bg-card/95 shadow-sm"
    >
      <CardContent className="px-0 pt-0">
        <Table className="table-fixed">
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.label}
                className="border-border/60 hover:bg-transparent"
              >
                <TableCell className="w-[48%] py-2 align-middle text-xs font-medium leading-4 text-muted-foreground whitespace-normal wrap-break-word">
                  {row.label}
                </TableCell>
                <TableCell className="w-[52%] py-2 text-right text-xs font-medium leading-4 whitespace-normal wrap-break-word text-foreground">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-2" />
        <div className="px-2 py-2">
          <p className="line-clamp-4 text-xs leading-5 text-foreground/90">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
