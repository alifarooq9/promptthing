"use client";

import { useChat } from "@ai-sdk/react";
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
import React from "react";

export default function Home() {
  const [searchEnabled, setSearchEnabled] = React.useState(false);

  const { messages, append, status, setMessages } = useChat({
    api: "/api/v1/chat",
    body: {
      search: searchEnabled,
    },
  });

  return (
    <div className="flex-1 w-full relative">
      <ChatContainerRoot className="w-full h-svh flex flex-col">
        <ChatContainerContent className="p-4 relative space-y-14 pt-16 pb-38 w-full max-w-3xl mx-auto">
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
                    <Markdown>
                      {webSearchInvoked?.toolInvocation.state === "call"
                        ? "Searching the web..."
                        : message.content === ""
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
          {status === "submitted" && (
            <Message className="prose prose-neutral max-w-max dark:prose-invert text-foreground overflow-hidden">
              <Markdown>Loading...</Markdown>
            </Message>
          )}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
        <div className="absolute w-fit max-w-2xl mx-auto inset-x-0 h-fit bottom-40">
          <ScrollButton className="shadow-sm" />
        </div>
      </ChatContainerRoot>

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-3 pb-3 md:px-4 md:pb-4">
        <PromptInput
          isLoading={status === "streaming"}
          onSubmit={(prompt) => {
            append({ role: "user", content: prompt });
          }}
          searchEnabled={searchEnabled}
          setSearchEnabled={setSearchEnabled}
        />
      </div>
    </div>
  );
}
