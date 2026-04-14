"use client";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { ArrowUp, Mic, Plus } from "lucide-react";
import { useState } from "react";

export function ChatComposer({
  status,
  onSend,
}: {
  status: string;
  onSend: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    onSend(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="z-10 shrink-0 bg-background px-3 pb-3 md:px-5 md:pb-5">
      <div className="mx-auto max-w-3xl">
        <PromptInput
          isLoading={status !== "ready"}
          value={prompt}
          onValueChange={setPrompt}
          onSubmit={handleSubmit}
          className="relative z-10 w-full rounded-3xl border border-input bg-popover p-0 pt-1 shadow-xs"
        >
          <div className="flex flex-col">
            <PromptInputTextarea
              placeholder="Ask anything"
              className="min-h-11 pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            />

            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-2">
                {/* <PromptInputAction tooltip="Add files or tools">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full"
                  >
                    <Plus size={18} />
                  </Button>
                </PromptInputAction> */}
              </div>
              <div className="flex items-center gap-2">
                {/* <PromptInputAction tooltip="Voice input">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full"
                  >
                    <Mic size={18} />
                  </Button>
                </PromptInputAction> */}

                <Button
                  size="icon"
                  disabled={!prompt.trim() || status !== "ready"}
                  onClick={handleSubmit}
                  className="size-9 rounded-full"
                >
                  {status === "ready" ? (
                    <ArrowUp size={18} />
                  ) : (
                    <span className="size-3 rounded-xs bg-white" />
                  )}
                </Button>
              </div>
            </PromptInputActions>
          </div>
        </PromptInput>
      </div>
    </div>
  );
}
