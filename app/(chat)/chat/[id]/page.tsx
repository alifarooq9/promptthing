import { Chat } from "@/components/chat";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { UIMessage } from "ai";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

type ChatIdProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatId({ params }: ChatIdProps) {
  const user = await convexAuthNextjsToken();
  if (!user) redirect("/signin");

  const { id } = await params;

  const { success, data: messages } = await fetchQuery(
    api.message.getMessages,
    {
      chatId: id as Id<"chat">,
    },
    {
      token: user,
    }
  );

  if (!success) {
    redirect("/");
  }

  const initialMessages = messages?.map(
    (message) =>
      ({
        id: message._id,
        role: message.role,
        content: message.content,
        parts: message.parts ? JSON.parse(message.parts) : [],
        experimental_attachments: message.attachments,
      }) as UIMessage
  );

  console.log("Initial messages:", initialMessages);

  return <Chat chatId={id} initialMessages={initialMessages} />;
}
