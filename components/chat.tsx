"use client";

import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageContent } from "@/components/ui/message";
import { Markdown } from "@/components/ui/markdown";
import { ScrollButton } from "@/components/ui/scroll-button";
import { PromptInput } from "@/components/prompt-input";
import { AssistantMessageActions } from "@/components/assistant-message-actions";
import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/ui/reasoning";
import { useChat } from "@ai-sdk/react";
import React from "react";
import { ImageGenModelId, ModelId } from "@/config/models";
import { useConfigStore } from "@/store/use-config";
import { getImageGenModelConfig, getModelConfig } from "@/lib/models";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UIMessage } from "ai";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Link from "next/link";

type ChatProps = {
  chatId?: string;
  initialMessages?: UIMessage[];
  sharedChat?: boolean;
};

export type ToolsEnabled = {
  search: boolean;
  generateImage: boolean;
};

export type BodyRequest = {
  messages: UIMessage[];
  search: boolean;
  generateImage: boolean;
  model: ModelId;
  imageGenModel: ImageGenModelId;
  apiKey?: string;
  chatId: string;
  toolsApiKey?: {
    runware?: string;
  };
  message: UIMessage;
};

export function Chat({ chatId, initialMessages, sharedChat }: ChatProps) {
  const [id, setId] = React.useState(chatId);
  const isNewChat = !chatId && !id;
  const [toolsEnabled, setToolsEnabled] = React.useState<ToolsEnabled>({
    search: false,
    generateImage: false,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const { selectedModel: model, selectedImageGenModel: imageGenModel } =
    useConfigStore();

  const apiKey = useConfigStore((state) =>
    state.getKey(getModelConfig(model).provider)
  );
  const runwareApiKey = useConfigStore((state) =>
    state.getKey(getImageGenModelConfig(imageGenModel).provider)
  );

  const { messages, append, status, setMessages, error } = useChat({
    id,
    api: "/api/v1/chat",
    experimental_prepareRequestBody(body) {
      const finalChatId =
        (body.requestBody as { chatId?: string }).chatId || id;
      return {
        search: toolsEnabled.search,
        generateImage: toolsEnabled.generateImage,
        model,
        apiKey,
        message: body.messages.at(-1),
        messages: body.messages,
        chatId: finalChatId,
        toolsApiKey: {
          runware: runwareApiKey,
        },
        imageGenModel,
      } as BodyRequest;
    },
    initialMessages: initialMessages ?? undefined,
  });

  const handleCreateNewChat = useMutation(api.chat.createChat);

  const handleOnSubmit = async (prompt: string) => {
    let generatedId = id;
    setIsLoading(true);
    if (isNewChat && !chatId && !id) {
      try {
        const { success, data: newChatId } = await handleCreateNewChat({
          title: prompt.trim().slice(0, 40) || "New Chat",
          ...(initialMessages &&
            initialMessages.length > 0 && {
              initialMessages: initialMessages.map((msg) => ({
                content: msg.content,
                role: msg.role as "user" | "assistant",
                parts: JSON.stringify(msg.parts || []),
              })),
            }),
        });
        if (success) {
          generatedId = newChatId as Id<"chat">;
          setId(newChatId);
          // Update URL without triggering route change or component re-render
          window.history.replaceState({}, "", `/chat/${newChatId}`);
        }

        console.log("Appending message:", prompt);
      } catch (error) {
        toast.error("Failed to create new chat. Please try again.");
        console.error("Error creating new chat:", error);
        setIsLoading(false);
      }
    }

    setIsLoading(false);

    try {
      append(
        { role: "user", content: prompt.trim() },
        { body: { chatId: generatedId } }
      );
    } catch (error) {
      console.error("Error appending message:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while sending your message."
      );
    }
  };

  return (
    <div className="h-svh relative">
      <ChatContainerRoot className="w-full h-full flex flex-1 flex-col">
        <ChatContainerContent className="p-4 relative space-y-14 pt-24 pb-38 w-full max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";

            const toolInvoked = message.parts.find(
              (part) => part.type === "tool-invocation"
            );

            return (
              <Message
                key={message.id}
                className={
                  message.role === "user" ? "justify-end" : "justify-start"
                }
              >
                {isAssistant ? (
                  <div className="prose prose-neutral w-full max-w-none dark:prose-invert text-foreground overflow-hidden">
                    {message.parts.filter((part) => part.type === "reasoning")
                      .length > 0 && (
                      <Reasoning>
                        <ReasoningTrigger>Show reasoning</ReasoningTrigger>
                        <ReasoningContent className="ml-2 border-l-2 px-2">
                          {message.parts
                            .filter((part) => part.type === "reasoning")
                            .map((part, index) => (
                              <ReasoningResponse
                                key={index}
                                text={part.reasoning}
                              />
                            ))}
                        </ReasoningContent>
                      </Reasoning>
                    )}
                    {(() => {
                      const imageResults = message.parts
                        .filter(
                          (part) =>
                            part.type === "tool-invocation" &&
                            part.toolInvocation?.toolName === "generateImage" &&
                            part.toolInvocation.state === "result"
                        )
                        .flatMap((part) =>
                          part.type === "tool-invocation" &&
                          // @ts-expect-error
                          part.toolInvocation.result
                            ? // @ts-expect-error
                              Array.isArray(part.toolInvocation.result)
                              ? // @ts-expect-error
                                part.toolInvocation.result
                              : // @ts-expect-error
                                [part.toolInvocation.result]
                            : []
                        );

                      return imageResults.length > 0 ? (
                        <div className="w-full space-y-4">
                          <PreviewImages images={imageResults} />
                          {message.content && (
                            <Markdown>{message.content}</Markdown>
                          )}
                        </div>
                      ) : (
                        <Markdown>
                          {toolInvoked?.toolInvocation.state === "call"
                            ? toolInvoked?.toolInvocation?.toolName ===
                              "webSearch"
                              ? "Searching the web..."
                              : toolInvoked?.toolInvocation?.toolName ===
                                  "generateImage"
                                ? "Generating image..."
                                : "Invoking tool..."
                            : message.content === "" &&
                                !message.parts
                                  .flatMap((part) => part.type)
                                  .includes("reasoning")
                              ? "Loading..."
                              : message.content}
                        </Markdown>
                      );
                    })()}
                    {(index === messages.length - 1
                      ? status !== "streaming"
                      : true) && (
                      <AssistantMessageActions
                        message={message}
                        messages={messages}
                        setMessages={setMessages}
                        append={append}
                        chatId={id as Id<"chat">}
                      />
                    )}
                  </div>
                ) : (
                  <MessageContent className="bg-muted text-foreground px-4">
                    {message.content}
                  </MessageContent>
                )}
              </Message>
            );
          })}
          {isLoading ? (
            <Message className="prose my-[1.25em] prose-neutral max-w-max dark:prose-invert text-foreground overflow-hidden">
              Creating chat...
            </Message>
          ) : null}
          {status === "submitted" ? (
            <Message className="prose prose-neutral my-[1.25em] max-w-max dark:prose-invert text-foreground overflow-hidden">
              Loading...
            </Message>
          ) : null}
          {error && (
            <Message>
              <Markdown>
                {error.message ||
                  "An error occurred while processing your request."}
              </Markdown>
            </Message>
          )}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
        <div className="absolute w-fit max-w-2xl mx-auto inset-x-0 h-fit bottom-40">
          <ScrollButton className="shadow-sm" />
        </div>
      </ChatContainerRoot>
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-3 pb-3 md:px-4 md:pb-4">
        {sharedChat && (
          <p className="text-center text-sm mb-1">
            After you send a message, it will be visible to you only.
          </p>
        )}
        <PromptInput
          isLoading={status === "streaming"}
          onSubmit={handleOnSubmit}
          toolsEnabled={toolsEnabled}
          setToolsEnabled={setToolsEnabled}
        />
      </div>
    </div>
  );
}

function PreviewImages({ images }: { images: string[] }) {
  const handleDownload = async (src: string, index: number) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="w-full relative flex flex-wrap gap-4">
      {images.map((src, index) => (
        <div className="relative aspect-square lg:w-1/2" key={index}>
          <img
            src={src}
            alt={`Generated image ${index}`}
            className="aspect-square relative"
          />

          <div className="flex items-center gap-2">
            <Link
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sm"
            >
              View Full
            </Link>

            <button
              onClick={() => handleDownload(src, index)}
              className="underline text-sm cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
