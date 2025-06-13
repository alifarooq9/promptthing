"use client";

import * as React from "react";
import { NavMain } from "@/components/app-sidebar/nav-main";
import { Chats } from "@/components/app-sidebar/sidebar-chats";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SearchIcon, SettingsIcon, SquarePenIcon } from "lucide-react";

const navMain = [
  {
    title: "New Chat",
    url: "/",
    icon: SquarePenIcon,
  },
  {
    title: "Search",
    url: "#",
    icon: SearchIcon,
  },
  {
    title: "Settings",
    url: "#",
    icon: SettingsIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu className="flex flex-row justify-between items-center gap-2">
          <SidebarMenuItem>
            <p className="flex flex-col w-fit justify-center items p-2 font-bold">
              Promptthing
            </p>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarTrigger className="cursor-pointer" />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavMain items={navMain} />
      </SidebarHeader>
      <SidebarContent>
        <Chats />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
