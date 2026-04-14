"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useCallback } from "react"
import { ChatComposer } from "./chat-composer"
import { ChatMessage } from "./chat-message"

export function ChatContent() {
  const { messages, sendMessage, setMessages, regenerate, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleEditMessage = useCallback(
    (messageId: string, nextText: string) => {
      const editedMessageIndex = messages.findIndex(
        (message) => message.id === messageId
      )

      if (editedMessageIndex === -1) {
        return
      }

      const editedMessage = messages[editedMessageIndex]
      if (editedMessage.role !== "user") {
        return
      }

      const updatedMessages: UIMessage[] = messages
        .slice(0, editedMessageIndex + 1)
        .map((message) => {
          if (message.id !== messageId) {
            return message
          }

          return {
            ...message,
            parts: [{ type: "text", text: nextText }],
          }
        })

      setMessages(updatedMessages)
      void regenerate({ messageId })
    },
    [messages, regenerate, setMessages]
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-foreground">Project roadmap discussion</div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatContainerRoot className="min-h-0 flex-1">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
                status={status}
                onEditMessage={handleEditMessage}
                onRegenerateMessage={(messageId) =>
                  void regenerate({ messageId })
                }
              />
            ))}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <ChatComposer
        status={status}
        onSend={(prompt) => sendMessage({ text: prompt })}
      />
    </div>
  )
}
