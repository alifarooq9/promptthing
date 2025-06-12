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
        <SidebarMenu>
          <SidebarMenuItem>
            <p className="flex flex-col justify-center items p-2 font-bold">
              Promptthing
            </p>
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
