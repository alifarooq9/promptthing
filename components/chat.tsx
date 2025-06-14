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
import { ModelId } from "@/config/models";
import { useConfigStore } from "@/store/use-config";
import { getModelConfig } from "@/lib/models";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UIMessage } from "ai";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ChatProps = {
  chatId?: string;
  initialMessages?: UIMessage[];
  sharedChat?: boolean;
};

export function Chat({ chatId, initialMessages, sharedChat }: ChatProps) {
  const [id, setId] = React.useState(chatId);
  const isNewChat = !chatId && !id;
  const [searchEnabled, setSearchEnabled] = React.useState(false);
  const [model, setModel] = React.useState<ModelId>("gemini-2.0-flash-lite");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const apiKey = useConfigStore((state) =>
    state.getKey(getModelConfig(model).provider)
  );

  const { messages, append, status, setMessages, error } = useChat({
    id,
    api: "/api/v1/chat",
    experimental_prepareRequestBody(body) {
      const finalChatId =
        (body.requestBody as { chatId?: string }).chatId || id;
      return {
        search: searchEnabled,
        model,
        apiKey,
        message: body.messages.at(-1),
        messages: body.messages,
        chatId: finalChatId,
      };
    },
    initialMessages: initialMessages ?? undefined,
  });

  console.log("Chat component rendered with messages:", messages);

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
                reasoning: msg.reasoning,
                parts: JSON.stringify(msg.parts || []),
              })),
            }),
        });
        if (success) {
          generatedId = newChatId as Id<"chat">;
          setId(newChatId);
          // Update URL without triggering route change or component re-render
          router.replace(`/chat/${newChatId}`);
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
    <div className="flex-1 w-full relative">
      <ChatContainerRoot className="w-full h-dvh flex flex-col">
        <ChatContainerContent className="p-4 relative space-y-14 pt-24 pb-38 w-full max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";

            const webSearchInvoked = message.parts.find(
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
                  <div className="prose prose-neutral max-w-max dark:prose-invert text-foreground overflow-hidden">
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
                    <Markdown>
                      {webSearchInvoked?.toolInvocation.state === "call"
                        ? webSearchInvoked?.toolInvocation?.toolName ===
                          "webSearch"
                          ? "Searching the web..."
                          : "Invoking tool..."
                        : message.content === "" &&
                            !message.parts
                              .flatMap((part) => part.type)
                              .includes("reasoning")
                          ? "Loading..."
                          : message.content}
                    </Markdown>
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
          searchEnabled={searchEnabled}
          setSearchEnabled={setSearchEnabled}
          model={model}
          setModel={setModel}
        />
      </div>
    </div>
  );
}
