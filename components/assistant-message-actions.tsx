"use client";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { MessageAction, MessageActions } from "@/components/ui/message";
import { Id } from "@/convex/_generated/dataModel";
import { ChatRequestOptions, CreateMessage, Message, UIMessage } from "ai";
import { RefreshCcwIcon } from "lucide-react";

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
};

export function AssistantMessageActions({
  message,
  messages,
  setMessages,
  append,
  chatId,
}: AssistantMessageActionsProps) {
  const handleRegenerate = () => {
    const currentMessageIndex = messages.findIndex(
      (msg) => msg.id === message.id
    );
    if (currentMessageIndex === -1) return;

    const userMessage = messages[currentMessageIndex - 1];
    const truncatedMessages = messages.slice(0, currentMessageIndex - 1);
    setMessages(truncatedMessages);
    append(
      {
        role: "user",
        content: userMessage.content,
      },
      {
        body: {
          chatId,
        },
      }
    );
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
          <RefreshCcwIcon />
        </Button>
      </MessageAction>
    </MessageActions>
  );
}
