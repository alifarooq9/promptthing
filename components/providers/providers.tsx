import { ConvexAuthClientProvider } from "@/components/providers/convex-auth-client-provider";
import { ConvexAuthServerProvider } from "@/components/providers/convex-auth-server-provider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthServerProvider>
      <ConvexAuthClientProvider>{children}</ConvexAuthClientProvider>
    </ConvexAuthServerProvider>
  );
}
