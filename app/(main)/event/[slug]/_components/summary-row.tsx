export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 wrap-break-word text-right font-medium">
        {value}
      </span>
    </div>
  );
}
