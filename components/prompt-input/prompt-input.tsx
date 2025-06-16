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
  IconAdjustmentsHorizontal,
  IconWorld,
  IconPhotoScan,
  IconPaperclip,
  IconX,
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
} from "@/components/ui/select";
import {
  getAvailableImageGenModelsWithCategories,
  getAvailableModelsWithCategories,
  getImageGenModelConfig,
  getModelConfig,
} from "@/lib/models";
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
import { Attachments } from "@/components/prompt-input/attachments";
import { SelectTrigger } from "@radix-ui/react-select";

type PromptInputProps = {
  isLoading?: boolean;
  onSubmit: (
    prompt: string,
    files?: File[],
    handleRemoveAllFiles?: () => void
  ) => void | Promise<void>;
  toolsEnabled: ToolsEnabled;
  setToolsEnabled: React.Dispatch<React.SetStateAction<ToolsEnabled>>;
};

export function PromptInput({
  isLoading,
  onSubmit,
  toolsEnabled,
  setToolsEnabled,
}: PromptInputProps) {
  const [prompt, setPrompt] = React.useState("");

  const removeAllFiles = React.useCallback(() => {
    setFiles([]);
  }, []);

  const handleOnSubmit = React.useCallback(() => {
    if (!prompt.trim()) {
      return;
    }
    onSubmit(prompt, files, removeAllFiles);
    setPrompt("");
  }, [prompt, onSubmit]);

  const {
    selectedModel: model,
    setSelectedModel: setModel,
    selectedImageGenModel: imageGenModel,
    setSelectedImageGenModel: setImageGenModel,
  } = useConfigStore();

  const availableModels = getAvailableModelsWithCategories();
  const availableImageGenModels = getAvailableImageGenModelsWithCategories();
  const selectedImageGenModel = getImageGenModelConfig(imageGenModel);
  const selectedModel = getModelConfig(model);
  const getKey = useConfigStore((state) => state.getKey);

  const [files, setFiles] = React.useState<File[]>([]);

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PromptInputUi
      isLoading={isLoading}
      value={prompt}
      onValueChange={setPrompt}
      onSubmit={handleOnSubmit}
      className="border-border bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
    >
      <div className="flex flex-col">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 px-3 pt-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-muted border border-border flex items-center gap-2 rounded-lg p-0.5 text-sm"
              >
                {file.type.startsWith("image/") ? (
                  <div className="relative size-14">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-14 object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="bg-white rounded-full cursor-pointer absolute top-1 p-px right-1 z-50"
                    >
                      <IconX className="size-3.5 text-black" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3">
                    <IconPaperclip className="size-4" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="bg-white rounded-full cursor-pointer p-px"
                    >
                      <IconX className="size-3.5 text-black" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <PromptInputTextarea
          placeholder="Ask anything"
          className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
        />

        <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <Attachments files={files} setFiles={setFiles} />

            <Select
              value={model}
              onValueChange={(value) => setModel(value as ModelId)}
            >
              <SelectTrigger
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "icon",
                  }),
                  "rounded-full cursor-pointer"
                )}
              >
                {(() => {
                  const Icon = arrayIcons.find(
                    (icon) => icon.key === selectedModel.icon
                  )?.Icon;
                  return Icon ? <Icon /> : null;
                })()}
              </SelectTrigger>

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

            <Select
              value={imageGenModel}
              onValueChange={(value) => setImageGenModel(value as ModelId)}
            >
              <SelectTrigger
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "icon",
                  }),
                  "rounded-full cursor-pointer"
                )}
              >
                {(() => {
                  const Icon = arrayIcons.find(
                    (icon) => icon.key === selectedImageGenModel.icon
                  )?.Icon;
                  return Icon ? <Icon /> : null;
                })()}
              </SelectTrigger>

              <SelectContent>
                {Object.entries(
                  availableImageGenModels.reduce(
                    (groups, availableModel) => {
                      const category = availableModel.category || "Other";
                      if (!groups[category]) {
                        groups[category] = [];
                      }
                      groups[category].push(availableModel);
                      return groups;
                    },
                    {} as Record<string, typeof availableImageGenModels>
                  )
                ).map(([category, models]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {models.map((availableModel) => {
                      const mdlConfig = getImageGenModelConfig(
                        availableModel.model
                      );
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
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("rounded-full cursor-pointer")}
                >
                  <IconAdjustmentsHorizontal />
                </Button>
              </DropdownMenuTrigger>

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
