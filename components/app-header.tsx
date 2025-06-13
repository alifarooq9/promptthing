"use client";

import { buttonVariants } from "@/components/copy-button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SquarePenIcon } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { isMobile, open } = useSidebar();

  if (open && !isMobile) {
    return null;
  }

  return (
    <header
      className={cn(
        "absolute z-50 top-0 right-0 w-full p-4 flex gap-2 border-b bg-background lg:border-0 lg:bg-transparent transition-all justify-between lg:justify-start"
      )}
    >
      <SidebarTrigger className="cursor-pointer" />
      <Link
        href="/"
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon",
          }),
          "size-7"
        )}
      >
        <SquarePenIcon />
      </Link>
    </header>
  );
}
