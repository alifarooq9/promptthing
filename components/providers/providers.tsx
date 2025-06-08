"use client";

import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
