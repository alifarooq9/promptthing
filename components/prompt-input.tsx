"use client";

import {
  PromptInput as PromptInputUi,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  IconArrowUp,
  IconMicrophone,
  IconChevronDown,
  IconAdjustmentsHorizontal,
  IconWorld,
  IconPhotoScan,
} from "@tabler/icons-react";
import React from "react";
import { cn } from "@/lib/utils";
import { ModelId } from "@/config/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { getAvailableModelsWithCategories, getModelConfig } from "@/lib/models";
import { arrayIcons } from "@/components/ui/icons";
import { useConfigStore } from "@/store/use-config";
import { ToolsEnabled } from "@/components/chat";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PromptInputProps = {
  isLoading?: boolean;
  onSubmit: (prompt: string) => void | Promise<void>;
  toolsEnabled: ToolsEnabled;
  setToolsEnabled: React.Dispatch<React.SetStateAction<ToolsEnabled>>;
  model: ModelId;
  setModel: React.Dispatch<React.SetStateAction<ModelId>>;
};

export function PromptInput({
  isLoading,
  onSubmit,
  toolsEnabled,
  setToolsEnabled,
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

  const availableModels = getAvailableModelsWithCategories();
  const selectedModel = getModelConfig(model);
  const getKey = useConfigStore((state) => state.getKey);

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
            <Select
              value={model}
              onValueChange={(value) => setModel(value as ModelId)}
            >
              <PromptInputAction tooltip="Change model">
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
                  {(() => {
                    const Icon = arrayIcons.find(
                      (icon) => icon.key === selectedModel.icon
                    )?.Icon;
                    return Icon ? <Icon /> : null;
                  })()}
                </SelectTrigger>
              </PromptInputAction>

              <SelectContent>
                {Object.entries(
                  availableModels.reduce(
                    (groups, availableModel) => {
                      const category = availableModel.category || "Other";
                      if (!groups[category]) {
                        groups[category] = [];
                      }
                      groups[category].push(availableModel);
                      return groups;
                    },
                    {} as Record<string, typeof availableModels>
                  )
                ).map(([category, models]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {models.map((availableModel) => {
                      const mdlConfig = getModelConfig(availableModel.model);
                      const Icon = arrayIcons.find(
                        (icon) => icon.key === mdlConfig.icon
                      )?.Icon;

                      return (
                        <SelectItem
                          key={availableModel.model}
                          value={availableModel.model}
                          className="cursor-pointer"
                          disabled={
                            mdlConfig.availableWhen === "byok" &&
                            !getKey(mdlConfig.provider)
                          }
                        >
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          {availableModel.modelName}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <PromptInputAction tooltip="Configure tools">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full cursor-pointer"
                    )}
                  >
                    <IconAdjustmentsHorizontal size={18} />
                    <IconChevronDown className="opacity-50 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
              </PromptInputAction>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={(e) => {
                    e.preventDefault();
                    setToolsEnabled((prev) => ({
                      ...prev,
                      search: !prev.search,
                    }));
                  }}
                  checked={toolsEnabled.search}
                >
                  <IconWorld />
                  Search the web
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={toolsEnabled.generateImage}
                  onClick={(e) => {
                    e.preventDefault();
                    setToolsEnabled((prev) => ({
                      ...prev,
                      generateImage: !prev.generateImage,
                    }));
                  }}
                >
                  <IconPhotoScan />
                  Create an image
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <PromptInputAction tooltip="Voice input">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
              >
                <IconMicrophone size={18} />
              </Button>
            </PromptInputAction>

            <Button
              size="icon"
              disabled={!prompt.trim() || isLoading}
              onClick={handleOnSubmit}
              className="size-9 rounded-full"
            >
              {!isLoading ? (
                <IconArrowUp size={18} />
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
