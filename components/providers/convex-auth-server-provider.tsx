import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

export function ConvexAuthServerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
  );
}
