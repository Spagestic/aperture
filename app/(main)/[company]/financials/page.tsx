import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function FinancialsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Track performance and user engagement metrics. Monitor trends and
          identify growth opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Page views are up 25% compared to last month.
      </CardContent>
    </Card>
  );
}
