"use client";

import {
  PromptInput as PromptInputUi,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowUp, Settings, Globe, Mic } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { ModelId } from "@/config/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { getAvailableModels, getModelConfig } from "@/lib/models";

type PromptInputProps = {
  isLoading?: boolean;
  onSubmit: (prompt: string) => void;
  searchEnabled: boolean;
  setSearchEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  model: ModelId;
  setModel: React.Dispatch<React.SetStateAction<ModelId>>;
};

export function PromptInput({
  isLoading,
  onSubmit,
  searchEnabled,
  setSearchEnabled,
  model,
  setModel,
}: PromptInputProps) {
  const [prompt, setPrompt] = React.useState("");

  const handleOnSubmit = React.useCallback(() => {
    if (!prompt.trim()) {
      return;
    }

    onSubmit(prompt);

    setPrompt("");
  }, [prompt, onSubmit]);

  const availableModels = getAvailableModels();
  const selectedModel = getModelConfig(model);

  return (
    <PromptInputUi
      isLoading={isLoading}
      value={prompt}
      onValueChange={setPrompt}
      onSubmit={handleOnSubmit}
      className="border-border bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
    >
      <div className="flex flex-col">
        <PromptInputTextarea
          placeholder="Ask anything"
          className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
        />

        <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-2">
            <PromptInputAction tooltip="Change model">
              <Select
                value={model}
                onValueChange={(value) => setModel(value as ModelId)}
              >
                <SelectTrigger
                  size="sm"
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "sm",
                    }),
                    "rounded-full cursor-pointer max-w-36 justify-start"
                  )}
                >
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((availableModel) => (
                    <SelectItem
                      key={availableModel}
                      value={availableModel}
                      className="cursor-pointer"
                    >
                      {availableModel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PromptInputAction>

            {selectedModel?.supportsWebSearch && (
              <PromptInputAction tooltip="Search web">
                <Button
                  variant={searchEnabled ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-full cursor-pointer")}
                  onClick={() => setSearchEnabled(!searchEnabled)}
                >
                  <Globe size={18} />
                  Search
                </Button>
              </PromptInputAction>
            )}

            <PromptInputAction tooltip="More actions">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-full"
              >
                <Settings size={18} />
              </Button>
            </PromptInputAction>
          </div>
          <div className="flex items-center gap-2">
            <PromptInputAction tooltip="Voice input">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
              >
                <Mic size={18} />
              </Button>
            </PromptInputAction>

            <Button
              size="icon"
              disabled={!prompt.trim() || isLoading}
              onClick={handleOnSubmit}
              className="size-9 rounded-full"
            >
              {!isLoading ? (
                <ArrowUp size={18} />
              ) : (
                <span className="size-3 rounded-xs" />
              )}
            </Button>
          </div>
        </PromptInputActions>
      </div>
    </PromptInputUi>
  );
}
