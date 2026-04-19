"use client";
import { Streamdown } from "streamdown";

function unwrapMarkdownFence(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i);
  return match ? match[1] : input;
}

export function AnalyzeResearchMemoCard({ markdown }: { markdown: string }) {
  const content = unwrapMarkdownFence(markdown);
  return (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
      <Streamdown>{content}</Streamdown>
    </div>
  );
}
