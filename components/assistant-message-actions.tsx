"use client";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { MessageAction, MessageActions } from "@/components/ui/message";
import { Id } from "@/convex/_generated/dataModel";
import { ChatRequestOptions, CreateMessage, Message, UIMessage } from "ai";
import { IconGitBranch, IconReload } from "@tabler/icons-react";
import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

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
  const createChatBranch = useMutation(api.chat.createChat);
  const router = useRouter();

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
        messageIds: messagesToBeDeleted.map((id) => id as string),
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

  const [isCreatingBranch, setIsCreatingBranch] = React.useState(false);

  const handleCreateBranch = async () => {
    setIsCreatingBranch(true);
    try {
      const currentMessageIndex = messages.findIndex(
        (msg) => msg.id === message.id
      );

      if (currentMessageIndex === -1) return;

      const messagesToBrach = messages.slice(0, currentMessageIndex + 1);
      const { success, data: chatId } = await createChatBranch({
        title: message.content.slice(0, 40),
        initialMessages: messagesToBrach.map((msg) => ({
          content: msg.content,
          role: msg.role as "user" | "assistant",
          parts: JSON.stringify(msg.parts),
          attachments: msg?.experimental_attachments
            ? msg?.experimental_attachments?.map((a) => ({
                contentType: a.contentType as string,
                url: a.url as string,
                name: a.name as string,
              }))
            : undefined,
          id: msg.id,
        })),
        branched: true,
      });
      if (success) {
        router.push(`/chat/${chatId}`);
      } else {
        toast.error("Failed to create branch");
      }
    } catch (error) {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch");
    } finally {
      setIsCreatingBranch(false);
    }
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
      <MessageAction tooltip="Create a branch">
        <Button
          onClick={handleCreateBranch}
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
        >
          {isCreatingBranch ? <Icons.loader /> : <IconGitBranch />}
        </Button>
      </MessageAction>
    </MessageActions>
  );
}
