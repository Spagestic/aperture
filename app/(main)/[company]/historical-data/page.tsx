import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function HistoricalDataPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
        <CardDescription>
          Access and analyze historical data to identify trends and make
          informed decisions. Dive deep into past performance metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Explore historical trends and patterns in your data.
      </CardContent>
    </Card>
  );
}
