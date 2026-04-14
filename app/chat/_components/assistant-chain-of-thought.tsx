"use client"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import { isFileUIPart, isReasoningUIPart, isToolUIPart, type UIMessage } from "ai"
import { Brain, Image as LucideImageIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { Streamdown } from "streamdown"
import { cjk } from "@streamdown/cjk"
import { code } from "@streamdown/code"
import { math } from "@streamdown/math"
import { mermaid } from "@streamdown/mermaid"
import {
  countRenderableChainSteps,
  isAssistantChainToolUIPart,
  isRenderableAssistantChainPart,
  type AssistantUIMessageSegment,
  buildAssistantUIMessageSegments,
} from "./assistant-chain-of-thought-utils"
import { renderToolChainSteps } from "./assistant-chain-of-thought-tools"

export {
  type AssistantUIMessageSegment,
  buildAssistantUIMessageSegments,
}

const streamdownPlugins = {
  cjk,
  code,
  math,
  mermaid,
}

export function AssistantChainOfThought({
  parts,
  isStreaming,
}: {
  parts: UIMessage["parts"]
  isStreaming: boolean
}) {
  const [openWhenIdle, setOpenWhenIdle] = useState(true)
  const open = isStreaming ? true : openWhenIdle
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isStreaming) {
        setOpenWhenIdle(next)
      }
    },
    [isStreaming]
  )

  if (!parts.some(isRenderableAssistantChainPart)) {
    return null
  }

  const stepCount = countRenderableChainSteps(parts)
  const completedStepsLabel =
    stepCount === 1
      ? "Completed 1 Step"
      : `Completed ${stepCount} Steps`

  return (
    <ChainOfThought
      className="mb-3"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <ChainOfThoughtHeader>
        {isStreaming ? "Chain of Thought" : completedStepsLabel}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {parts.map((part, index) => {
          if (isReasoningUIPart(part)) {
            // Reasoning parts should flip to `done` after `reasoning-end` (see stream protocol). In
            // multi-step tool flows, a part can remain `streaming` in state while the chat is already
            // finished — gate "active" on the message-level stream so the UI does not freeze.
            const reasoningActive = isStreaming && part.state === "streaming"
            return (
              <ChainOfThoughtStep
                key={`reasoning-${index}`}
                icon={Brain}
                label="Reasoning"
                status={reasoningActive ? "active" : "complete"}
              >
                <div className="not-prose text-muted-foreground">
                  <Streamdown
                    plugins={streamdownPlugins}
                    isAnimating={reasoningActive}
                  >
                    {part.text}
                  </Streamdown>
                </div>
              </ChainOfThoughtStep>
            )
          }

          if (isToolUIPart(part) && isAssistantChainToolUIPart(part)) {
            return (
              <div key={part.toolCallId} className="space-y-3">
                {renderToolChainSteps(part)}
              </div>
            )
          }

          if (isFileUIPart(part) && part.mediaType.startsWith("image/")) {
            return (
              <ChainOfThoughtStep
                key={`file-${part.url}-${index}`}
                icon={LucideImageIcon}
                label={part.filename ?? "Image"}
                status="complete"
              >
                <ChainOfThoughtImage
                  caption={part.filename ?? part.mediaType ?? "Attached image"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URLs and arbitrary attachment hosts */}
                  <img
                    src={part.url}
                    alt={part.filename ?? "Attached image"}
                    className="aspect-square max-h-50 border object-contain"
                  />
                </ChainOfThoughtImage>
              </ChainOfThoughtStep>
            )
          }

          return null
        })}
      </ChainOfThoughtContent>
    </ChainOfThought>
  )
}
