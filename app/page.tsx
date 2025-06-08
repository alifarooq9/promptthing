"use client";

import { useChat } from "@ai-sdk/react";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import { Markdown } from "@/components/ui/markdown";
import { ScrollButton } from "@/components/ui/scroll-button";
import { PromptInput } from "@/components/prompt-input";
import { CopyButton } from "@/components/ui/copy-button";

export default function Home() {
  const { messages, append, error, status } = useChat({
    api: "/api/v1/completion",
  });

  return (
    <div className="container mx-auto max-w-3xl flex flex-col">
      <div className="flex-1 w-full pt-14 pb-56">
        <ChatContainerRoot className="h-full w-full flex flex-col">
          <ChatContainerContent className="p-4 space-y-14 w-full">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";

              return (
                <Message
                  key={message.id}
                  className={
                    message.role === "user" ? "justify-end" : "justify-start"
                  }
                >
                  {isAssistant ? (
                    <div className="prose prose-neutral max-w-max dark:prose-invert text-foreground overflow-hidden">
                      <Markdown>{message.content}</Markdown>
                      <MessageActions>
                        <MessageAction tooltip="Copy message">
                          <CopyButton
                            content={message.content}
                            size="icon"
                            className="h-8 w-8"
                            variant="ghost"
                          />
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : (
                    <MessageContent className="bg-muted text-foreground px-4">
                      {message.content}
                    </MessageContent>
                  )}
                </Message>
              );
            })}
          </ChatContainerContent>
          <ChatContainerScrollAnchor />
          <div className="absolute right-4 bottom-4">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-3xl px-3 pb-3 md:px-5 md:pb-5">
        <PromptInput
          isLoading={status === "streaming"}
          onSubmit={(prompt) => {
            append({ role: "user", content: prompt });
          }}
        />
      </div>
    </div>
  );
}
