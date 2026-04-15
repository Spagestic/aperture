import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur">
      <CardContent className="flex min-h-55 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-medium">Ready when you are.</p>
        <p className="max-w-xl text-sm text-muted-foreground">
          Paste a Polymarket event URL above to load the event details.
        </p>
      </CardContent>
    </Card>
  );
}
