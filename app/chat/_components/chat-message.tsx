"use client"

import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ai-elements/message"
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
  InlineCitationText,
} from "@/components/ai-elements/inline-citation"
import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"
import {
  Copy,
  Pencil,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Check,
  X,
} from "lucide-react"
import { Streamdown, type ExtraProps } from "streamdown"
import { cjk } from "@streamdown/cjk"
import { code } from "@streamdown/code"
import { math } from "@streamdown/math"
import { mermaid } from "@streamdown/mermaid"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { type ComponentProps, useMemo, useState } from "react"
import {
  AssistantChainOfThought,
  buildAssistantUIMessageSegments,
} from "./assistant-chain-of-thought"

const streamdownPlugins = {
  cjk,
  code,
  math,
  mermaid,
}

type CitationSourceEntry = {
  url: string
  title?: string
  description?: string
}

function parseCitationDataSources(raw: unknown): CitationSourceEntry[] {
  if (raw == null || raw === "") return []
  const str = typeof raw === "string" ? raw : String(raw)
  try {
    const v = JSON.parse(str) as unknown
    if (!Array.isArray(v)) return []
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return []
      const o = item as Record<string, unknown>
      const url = o.url
      if (typeof url !== "string" || url.length === 0) return []
      return [
        {
          url,
          title: typeof o.title === "string" ? o.title : undefined,
          description:
            typeof o.description === "string" ? o.description : undefined,
        },
      ]
    })
  } catch {
    return []
  }
}

/**
 * Renders `<citation data-sources='[{"url":"…","title":"…"}]'>…</citation>` from
 * assistant markdown through Streamdown (`allowedTags` + `components`).
 */
function StreamdownCitation(
  props: ComponentProps<"span"> &
    ExtraProps & {
      "data-sources"?: string
      dataSources?: string
    }
) {
  const {
    children,
    className,
    "data-sources": dataSourcesKebab,
    dataSources,
    node: _node,
    ...rest
  } = props

  const entries = parseCitationDataSources(
    dataSourcesKebab ?? dataSources
  )
  const urls = entries.map((e) => e.url)

  if (urls.length === 0) {
    return (
      <span className={cn("inline", className)} {...rest}>
        {children}
      </span>
    )
  }

  return (
    <InlineCitation className={cn("inline", className)}>
      <InlineCitationText>{children}</InlineCitationText>
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={urls} />
        <InlineCitationCardBody>
          <InlineCitationCarousel className="py-0">
            <InlineCitationCarouselHeader>
              <div className="flex gap-1 pl-2">
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselNext />
              </div>
              <InlineCitationCarouselIndex />
            </InlineCitationCarouselHeader>
            <InlineCitationCarouselContent>
              {entries.map((entry, i) => (
                <InlineCitationCarouselItem key={`${entry.url}-${i}`}>
                  <InlineCitationSource
                    title={entry.title}
                    url={entry.url}
                    description={entry.description}
                  />
                </InlineCitationCarouselItem>
              ))}
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>
  )
}

const assistantStreamdownExtras = {
  allowedTags: { citation: ["data-sources"] },
  components: {
    citation: StreamdownCitation,
  },
}

export function ChatMessage({
  message,
  isLastMessage,
  status,
  onEditMessage,
  onRegenerateMessage,
}: {
  message: UIMessage
  isLastMessage: boolean
  status: string
  onEditMessage?: (messageId: string, nextText: string) => void
  onRegenerateMessage?: (messageId: string) => void
}) {
  const isAssistant = message.role === "assistant"
  const isStreamingMessage =
    isAssistant &&
    isLastMessage &&
    (status === "submitted" || status === "streaming")
  const content = message.parts
    .map((part) => (part.type === "text" ? part.text : null))
    .join("")
  const assistantSegments = useMemo(
    () =>
      isAssistant ? buildAssistantUIMessageSegments(message.parts) : [],
    [isAssistant, message.parts]
  )
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(content)
  const editorKey = useMemo(
    () => `${message.id}-${content}`,
    [message.id, content]
  )

  const resizeEditor = (element: HTMLTextAreaElement | null) => {
    if (!element) return

    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
  }

  const commitEdit = () => {
    const nextText = draft.trim()
    if (!nextText || nextText === content || !onEditMessage) {
      setIsEditing(false)
      setDraft(content)
      return
    }

    onEditMessage(message.id, nextText)
    setIsEditing(false)
  }

  return (
    <Message
      from={isAssistant ? "assistant" : "user"}
      className="mx-auto w-full max-w-3xl px-6"
    >
      {isAssistant ? (
        <div className="group flex w-full flex-col gap-3">
          {assistantSegments.map((seg) =>
            seg.kind === "text" ? (
              <MessageContent
                key={seg.key}
                className="prose flex-1 rounded-lg bg-transparent p-0 text-foreground"
              >
                <Streamdown
                  plugins={streamdownPlugins}
                  isAnimating={isStreamingMessage && seg.isStreaming}
                  allowedTags={assistantStreamdownExtras.allowedTags}
                  components={assistantStreamdownExtras.components}
                >
                  {seg.text}
                </Streamdown>
              </MessageContent>
            ) : (
              <AssistantChainOfThought
                key={seg.key}
                parts={seg.parts}
                isStreaming={isStreamingMessage}
              />
            )
          )}
          <MessageActions
            className={cn(
              "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
              isLastMessage && "opacity-100"
            )}
          >
            <MessageAction
              tooltip="Copy"
              aria-label="Copy"
              onClick={() => copyToClipboard(content)}
            >
              {isCopied ? <Check /> : <Copy />}
            </MessageAction>
            <MessageAction tooltip="Upvote" aria-label="Upvote">
              <ThumbsUp />
            </MessageAction>
            <MessageAction tooltip="Downvote" aria-label="Downvote">
              <ThumbsDown />
            </MessageAction>
            <MessageAction
              tooltip="Regenerate"
              aria-label="Regenerate response"
              onClick={() => onRegenerateMessage?.(message.id)}
            >
              <RotateCcw />
            </MessageAction>
          </MessageActions>
        </div>
      ) : (
        <div className="group flex flex-col items-end gap-1">
          {isEditing ? (
            <div
              key={editorKey}
              className="w-full max-w-[85%] rounded-3xl bg-muted p-3 sm:max-w-[75%]"
            >
              <textarea
                autoFocus
                className="min-h-4 w-full resize-none overflow-hidden px-4 py-3 text-sm text-foreground outline-none"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  resizeEditor(event.target)
                }}
                onFocus={(event) => resizeEditor(event.target)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    commitEdit()
                  }
                }}
              />
              <div className="mt-2 flex justify-end gap-1">
                <MessageAction
                  tooltip="Cancel"
                  aria-label="Cancel edit"
                  onClick={() => {
                    setIsEditing(false)
                    setDraft(content)
                  }}
                >
                  <X />
                </MessageAction>
                <MessageAction
                  tooltip="Save"
                  aria-label="Save edit"
                  onClick={commitEdit}
                >
                  <Check />
                </MessageAction>
              </div>
            </div>
          ) : (
            <MessageContent className="max-w-[85%] rounded-3xl bg-muted px-5 py-2.5 text-primary sm:max-w-[75%]">
              {content}
            </MessageContent>
          )}
          <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <MessageAction
              tooltip="Edit"
              aria-label="Edit"
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
            </MessageAction>
            <MessageAction tooltip="Delete" aria-label="Delete">
              <Trash />
            </MessageAction>
            <MessageAction
              tooltip="Copy"
              aria-label="Copy"
              onClick={() => copyToClipboard(content)}
            >
              {isCopied ? <Check /> : <Copy />}
            </MessageAction>
          </MessageActions>
        </div>
      )}
    </Message>
  )
}
