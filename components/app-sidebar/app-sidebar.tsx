"use client";

import * as React from "react";
import { NavMain } from "@/components/app-sidebar/nav-main";
import { Chats } from "@/components/app-sidebar/sidebar-chats";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { IconSearch, IconSquareRoundedPlus } from "@tabler/icons-react";
import { NavUser } from "@/components/app-sidebar/nav-user";

const navMain = [
  {
    title: "New Chat",
    url: "/",
    icon: IconSquareRoundedPlus,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
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
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
