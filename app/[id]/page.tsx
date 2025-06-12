import { Chat } from "@/components/chat";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UIMessage } from "ai";
import { fetchQuery } from "convex/nextjs";

type ChatIdProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatId({ params }: ChatIdProps) {
  const { id } = await params;

  const messages = await fetchQuery(api.message.getMessages, {
    chatId: id as Id<"chat">,
  });

  const initialMessages = messages.map(
    (message) =>
      ({
        id: message._id,
        role: message.role,
        content: message.content,
        parts: message.parts ? JSON.parse(message.parts) : [],
      }) as UIMessage
  );

  return <Chat chatId={id} initialMessages={initialMessages} />;
}
