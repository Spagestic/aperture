export const STATUS_LABEL: Record<string, string> = {
  pending: "Starting",
  classifying: "Classifying",
  planning: "Planning questions",
  researching: "Researching",
  consolidating: "Consolidating",
  recommending: "Picking markets",
  synthesizing: "Writing report",
  completed: "Completed",
  stopped_speculative: "Stopped (speculative)",
  failed: "Failed",
};

export const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  classifying: "secondary",
  planning: "secondary",
  researching: "secondary",
  consolidating: "secondary",
  recommending: "secondary",
  synthesizing: "secondary",
  completed: "default",
  stopped_speculative: "outline",
  failed: "destructive",
};

export const SIDE_CLASS: Record<string, string> = {
  YES: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  NO: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  AVOID: "bg-muted text-muted-foreground border-border",
  WATCH: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

export function isActiveStatus(status?: string) {
  if (!status) return false;
  return [
    "pending",
    "classifying",
    "planning",
    "researching",
    "consolidating",
    "recommending",
    "synthesizing",
  ].includes(status);
}
