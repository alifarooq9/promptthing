import Signin from "@/components/auth/signin";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function SigninPage() {
  const user = await convexAuthNextjsToken();
  if (user) redirect("/");
  return <Signin />;
}
