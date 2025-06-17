"use client";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { MessageAction, MessageActions } from "@/components/ui/message";
import { Id } from "@/convex/_generated/dataModel";
import { ChatRequestOptions, CreateMessage, Message, UIMessage } from "ai";
import { IconReload } from "@tabler/icons-react";
import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type AssistantMessageActionsProps = {
  message: UIMessage;
  messages: UIMessage[];
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  chatId: Id<"chat">;
  setIsLoading: React.Dispatch<React.SetStateAction<string | null>>;
};

export function AssistantMessageActions({
  message,
  messages,
  setMessages,
  append,
  chatId,
  setIsLoading,
}: AssistantMessageActionsProps) {
  const deleteBulkMessage = useMutation(api.message.deleteBulkMessages);

  const handleRegenerate = async () => {
    setIsLoading("Preparing for regenerate...");
    const currentMessageIndex = messages.findIndex(
      (msg) => msg.id === message.id
    );
    if (currentMessageIndex === -1) return;

    const userMessage = messages[currentMessageIndex - 1];
    const truncatedMessages = messages.slice(0, currentMessageIndex - 1);
    setMessages(truncatedMessages);

    const messagesToBeDeleted = messages
      .slice(currentMessageIndex - 1)
      .map((msg) => msg.id);

    console.log(
      "Messages to be deleted:",
      messagesToBeDeleted,
      truncatedMessages
    );

    if (messagesToBeDeleted.length > 0) {
      await deleteBulkMessage({
        messageIds: messagesToBeDeleted as Id<"message">[],
      });
    }

    setIsLoading("Regenerating response...");

    await append(userMessage, {
      body: {
        chatId,
      },
    });

    setIsLoading(null);
  };

  return (
    <MessageActions>
      <MessageAction tooltip="Copy message">
        <CopyButton content={message.content} />
      </MessageAction>
      <MessageAction tooltip="Regenerate response">
        <Button
          onClick={handleRegenerate}
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
        >
          <IconReload />
        </Button>
      </MessageAction>
    </MessageActions>
  );
}
