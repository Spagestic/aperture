import {
  isFileUIPart,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from "ai"

export type ToolSource = {
  url: string
  title: string
  description: string
}

export function firecrawlSearchHitToSource(
  item: Record<string, unknown>
): ToolSource | null {
  const meta =
    item.metadata && typeof item.metadata === "object"
      ? (item.metadata as Record<string, unknown>)
      : null
  const urlFromMeta =
    meta && typeof meta.url === "string"
      ? meta.url
      : meta && typeof meta.sourceURL === "string"
        ? meta.sourceURL
        : null

  const url =
    typeof item.url === "string" && item.url.length > 0 ? item.url : urlFromMeta

  if (!url) return null

  const title =
    typeof item.title === "string"
      ? item.title
      : meta && typeof meta.title === "string"
        ? meta.title
        : url

  const description =
    typeof item.description === "string"
      ? item.description
      : typeof item.snippet === "string"
        ? item.snippet
        : ""

  return { url, title, description }
}

export function getFirecrawlSearchSourceItems(
  result: Record<string, unknown>
): ToolSource[] {
  const keys = ["web", "news", "images"] as const
  const out: ToolSource[] = []
  const seen = new Set<string>()

  for (const key of keys) {
    const arr = result[key]
    if (!Array.isArray(arr)) continue

    for (const raw of arr) {
      if (raw == null) continue

      if (typeof raw === "string") {
        if (!seen.has(raw)) {
          seen.add(raw)
          out.push({ url: raw, title: raw, description: "" })
        }
        continue
      }

      if (typeof raw !== "object") continue
      const obj = raw as Record<string, unknown>

      let source = firecrawlSearchHitToSource(obj)
      if (!source && key === "images") {
        const imgUrl =
          typeof obj.imageUrl === "string"
            ? obj.imageUrl
            : typeof obj.url === "string"
              ? obj.url
              : null
        if (imgUrl) {
          source = {
            url: imgUrl,
            title: typeof obj.title === "string" ? obj.title : imgUrl,
            description: "",
          }
        }
      }
      if (!source) continue
      if (seen.has(source.url)) continue
      seen.add(source.url)
      out.push(source)
    }
  }

  return out
}

export function getToolSourceItems(result: unknown): ToolSource[] {
  if (!result || typeof result !== "object") return []

  const doc = result as Record<string, unknown>

  const fromFirecrawl = getFirecrawlSearchSourceItems(doc)
  if (fromFirecrawl.length > 0) return fromFirecrawl

  const maybeSources = doc.sources ?? doc.data
  if (!Array.isArray(maybeSources)) return []

  return maybeSources
    .flatMap((item) => {
      if (!item || typeof item !== "object") return null

      const source = item as {
        url?: unknown
        title?: unknown
        description?: unknown
      }

      if (typeof source.url !== "string") return null

      return {
        url: source.url,
        title: typeof source.title === "string" ? source.title : source.url,
        description:
          typeof source.description === "string" ? source.description : "",
      }
    })
    .filter((item): item is ToolSource => item !== null)
}

export function safeHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function getScrapeInputUrl(input: unknown): string | undefined {
  if (!input || typeof input !== "object") return undefined
  const url = (input as { url?: unknown }).url
  return typeof url === "string" ? url : undefined
}

export function getSearchInputQuery(input: unknown): string | undefined {
  if (!input || typeof input !== "object") return undefined
  const query = (input as { query?: unknown }).query
  if (typeof query !== "string") return undefined
  const trimmed = query.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function titleFromMetadataRecord(meta: Record<string, unknown>): string | null {
  const candidates = ["title", "ogTitle", "ogSiteName"] as const
  for (const key of candidates) {
    const v = meta[key]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return null
}

/**
 * Title from Firecrawl scrape tool output for compact UI (favicon + title line).
 * Handles nested API shape: `{ success, data: { json, metadata: { title, ogTitle, ... } } }`
 * as well as flatter tool payloads.
 */
export function getScrapePageTitleFromOutput(result: unknown): string | null {
  if (!result || typeof result !== "object") return null
  const doc = result as Record<string, unknown>

  if (typeof doc.title === "string" && doc.title.trim()) {
    return doc.title.trim()
  }

  const metaRoot =
    doc.metadata && typeof doc.metadata === "object"
      ? (doc.metadata as Record<string, unknown>)
      : null
  if (metaRoot) {
    const fromRootMeta = titleFromMetadataRecord(metaRoot)
    if (fromRootMeta) return fromRootMeta
  }

  const dataBlock =
    doc.data && typeof doc.data === "object" && !Array.isArray(doc.data)
      ? (doc.data as Record<string, unknown>)
      : null

  if (dataBlock && typeof dataBlock.title === "string" && dataBlock.title.trim()) {
    return dataBlock.title.trim()
  }

  const metaInData =
    dataBlock?.metadata && typeof dataBlock.metadata === "object"
      ? (dataBlock.metadata as Record<string, unknown>)
      : null
  if (metaInData) {
    const fromDataMeta = titleFromMetadataRecord(metaInData)
    if (fromDataMeta) return fromDataMeta
  }

  return null
}

/** Tools shown in the chain UI (static `tool-*` or `dynamic-tool` by name). */
export function isAssistantChainToolUIPart(
  part: UIMessage["parts"][number]
): boolean {
  if (!isToolUIPart(part)) return false
  if (part.type === "dynamic-tool") {
    return part.toolName === "search" || part.toolName === "scrape"
  }
  const name = part.type.slice(5)
  return name === "search" || name === "scrape"
}

export function isRenderableAssistantChainPart(
  part: UIMessage["parts"][number]
): boolean {
  if (isReasoningUIPart(part)) return true
  if (isAssistantChainToolUIPart(part)) return true
  if (
    isFileUIPart(part) &&
    typeof part.mediaType === "string" &&
    part.mediaType.startsWith("image/")
  ) {
    return true
  }
  return false
}

/** Top-level chain steps shown for reasoning, each chain tool call, and image attachments. */
export function countRenderableChainSteps(
  parts: UIMessage["parts"]
): number {
  let n = 0
  for (const part of parts) {
    if (isReasoningUIPart(part)) {
      n += 1
      continue
    }
    if (isAssistantChainToolUIPart(part)) {
      n += 1
      continue
    }
    if (
      isFileUIPart(part) &&
      typeof part.mediaType === "string" &&
      part.mediaType.startsWith("image/")
    ) {
      n += 1
    }
  }
  return n
}

export type AssistantUIMessageSegment =
  | {
      kind: "text"
      text: string
      isStreaming: boolean
      key: string
    }
  | {
      kind: "chain"
      parts: UIMessage["parts"]
      key: string
    }

/**
 * Splits assistant `parts` in stream order so reasoning / search / scrape / image
 * steps can render between text blocks (see UIMessage `parts` in the AI SDK).
 * Skips `step-start` and other non-text parts that are not shown in the chain UI.
 */
export function buildAssistantUIMessageSegments(
  parts: UIMessage["parts"]
): AssistantUIMessageSegment[] {
  const segments: AssistantUIMessageSegment[] = []

  let textBuffer = ""
  let textStreaming = false
  let textStartIdx: number | null = null

  let chainBuffer: UIMessage["parts"] = []
  let chainStartIdx: number | null = null

  const flushText = () => {
    if (textBuffer.length > 0 && textStartIdx !== null) {
      segments.push({
        kind: "text",
        text: textBuffer,
        isStreaming: textStreaming,
        key: `text-${textStartIdx}`,
      })
    }
    textBuffer = ""
    textStreaming = false
    textStartIdx = null
  }

  const flushChain = () => {
    if (chainBuffer.length > 0 && chainStartIdx !== null) {
      segments.push({
        kind: "chain",
        parts: [...chainBuffer],
        key: `chain-${chainStartIdx}`,
      })
    }
    chainBuffer = []
    chainStartIdx = null
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (part.type === "step-start") {
      continue
    }

    if (isTextUIPart(part)) {
      flushChain()
      if (textStartIdx === null) {
        textStartIdx = i
      }
      textBuffer += part.text
      textStreaming ||= part.state === "streaming"
    } else if (isRenderableAssistantChainPart(part)) {
      flushText()
      if (chainStartIdx === null) {
        chainStartIdx = i
      }
      chainBuffer.push(part)
    } else {
      flushText()
      flushChain()
    }
  }

  flushText()
  flushChain()

  return segments
}
