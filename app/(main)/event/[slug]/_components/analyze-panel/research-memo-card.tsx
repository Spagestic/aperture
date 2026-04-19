"use client";
import { Streamdown } from "streamdown";

export function AnalyzeResearchMemoCard({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
      <Streamdown>{markdown}</Streamdown>
    </div>
  );
}
