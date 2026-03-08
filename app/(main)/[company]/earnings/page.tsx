import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function EarningsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>
          Generate and download your detailed reports. Export data in multiple
          formats for analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        You have 5 reports ready and available to export.
      </CardContent>
    </Card>
  );
}
