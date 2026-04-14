"use client"

import { TextShimmerLoader } from "@/components/prompt-kit/loader"
import {
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import { isToolUIPart, type UIMessage } from "ai"
import { Globe, Search } from "lucide-react"
import type { ReactNode } from "react"
import {
  type ToolSource,
  getScrapeInputUrl,
  getScrapePageTitleFromOutput,
  getSearchInputQuery,
  getToolSourceItems,
  safeHostname,
} from "./assistant-chain-of-thought-utils"

function pageFaviconSrc(pageUrl: string) {
  let host = pageUrl
  try {
    host = new URL(pageUrl).hostname
  } catch {
    /* use raw string */
  }
  return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(host)}`
}

function SearchSourceBadges({ items }: { items: ToolSource[] }) {
  return (
    <ChainOfThoughtSearchResults>
      {items.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          title={source.title || source.url}
        >
          <ChainOfThoughtSearchResult>
            {safeHostname(source.url)}
          </ChainOfThoughtSearchResult>
        </a>
      ))}
    </ChainOfThoughtSearchResults>
  )
}

export function renderToolChainSteps(
  part: UIMessage["parts"][number]
): ReactNode {
  if (!isToolUIPart(part)) return null
  const toolName =
    part.type === "dynamic-tool" ? part.toolName : part.type.slice(5)
  if (toolName !== "search" && toolName !== "scrape") return null

  const isLoading =
    part.state === "input-streaming" || part.state === "input-available"

  const sourceItems =
    part.state === "output-available" ? getToolSourceItems(part.output) : []

  const scrapeUrl = getScrapeInputUrl(part.input)

  if (toolName === "search") {
    const searchQuery = getSearchInputQuery(part.input)
    const searchQueryCode = searchQuery ? (
      <code className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-px font-mono text-[0.75rem] text-foreground">
        {searchQuery}
      </code>
    ) : null

    return (
      <ChainOfThoughtStep
        icon={Search}
        label={
          isLoading ? (
            <div className="space-y-1.5">
              {searchQueryCode ? (
                <p className="text-sm text-muted-foreground">
                  Searching for {searchQueryCode}
                </p>
              ) : null}
              <TextShimmerLoader text="Searching across sources" size="md" />
            </div>
          ) : searchQueryCode ? (
            <p className="text-sm text-muted-foreground">
              Searched for {searchQueryCode}
            </p>
          ) : (
            "Web search"
          )
        }
        description={
          part.state === "output-error"
            ? `Tool error: ${part.errorText ?? "Unknown error"}`
            : undefined
        }
        status={isLoading ? "active" : "complete"}
      >
        {part.state === "output-available" && sourceItems.length > 0 ? (
          <SearchSourceBadges items={sourceItems} />
        ) : null}
      </ChainOfThoughtStep>
    )
  }

  const hostname = scrapeUrl ? safeHostname(scrapeUrl) : "Source"
  const pageTitle =
    part.state === "output-available"
      ? getScrapePageTitleFromOutput(part.output)
      : null
  const displayTitle = pageTitle ?? hostname

  const steps: ReactNode[] = [
    <ChainOfThoughtStep
      key={`${part.toolCallId}-fetch`}
      icon={Globe}
      label={
        isLoading ? (
          <TextShimmerLoader text="Fetching page content" size="md" />
        ) : scrapeUrl ? (
          `Scraped ${hostname}`
        ) : (
          "Scraping source"
        )
      }
      description={
        part.state === "output-error"
          ? `Tool error: ${part.errorText ?? "Unknown error"}`
          : undefined
      }
      status={isLoading ? "active" : "complete"}
    >
      {scrapeUrl && part.state === "output-available" ? (
        <ChainOfThoughtSearchResults className="flex-col items-stretch gap-1.5">
          <a
            href={scrapeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full min-w-0"
            title={displayTitle}
          >
            <ChainOfThoughtSearchResult className="h-auto max-w-full min-w-0 justify-start py-1">
              <span className="flex min-w-0 items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- external favicon URLs */}
                <img
                  src={pageFaviconSrc(scrapeUrl)}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0 rounded-sm"
                  loading="lazy"
                  decoding="async"
                />
                <span className="truncate">{displayTitle}</span>
              </span>
            </ChainOfThoughtSearchResult>
          </a>
        </ChainOfThoughtSearchResults>
      ) : scrapeUrl ? (
        <ChainOfThoughtSearchResults>
          <a
            href={scrapeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            title={scrapeUrl}
          >
            <ChainOfThoughtSearchResult>{hostname}</ChainOfThoughtSearchResult>
          </a>
        </ChainOfThoughtSearchResults>
      ) : null}
    </ChainOfThoughtStep>,
  ]

  return <>{steps}</>
}
