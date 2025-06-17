import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { SettingsModal } from "@/components/settings/settings-modal";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "An open-source alternative to t3.chat | Promptthing",
  description:
    "Chat with different AI models, an open-source alternative to t3.chat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased font-sans`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
          <SettingsModal />
        </Providers>
      </body>
    </html>
  );
}
