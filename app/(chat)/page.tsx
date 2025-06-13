import { Chat } from "@/components/chat";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await convexAuthNextjsToken();
  console.log("user", user);
  if (!user) redirect("/signin");
  return <Chat />;
}
