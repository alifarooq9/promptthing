import { Chat } from "@/components/chat";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { UIMessage } from "ai";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";

export default async function Share({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await convexAuthNextjsToken();
  const { id } = await params;
  const { success, data } = await fetchQuery(
    api.chat.getSharedChatWithMessages,
    {
      shareId: id,
    },
    {
      token,
    }
  );

  if (!success) {
    return notFound();
  }

  if (data?.isYourChat) {
    return redirect(`/chat/${data.chat._id}`);
  }

  if (!data?.messages || data.messages.length === 0) {
    return notFound();
  }

  const initialMessages = data?.messages?.map(
    (message) =>
      ({
        id: message._id,
        role: message.role,
        content: message.content,
        parts: message.parts ? JSON.parse(message.parts) : [],
        experimental_attachments: message.attachments,
        createdAt: new Date(message._creationTime),
      }) as UIMessage
  );

  return (
    <>
      <Chat initialMessages={initialMessages} sharedChat />
    </>
  );
}
