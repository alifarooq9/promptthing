"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Icon, IconProps, IconSettings } from "@tabler/icons-react";
import { useSettingsModalStore } from "@/store/use-settings-modal";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ForwardRefExoticComponent<
      IconProps & React.RefAttributes<Icon>
    >;
    isActive?: boolean;
  }[];
}) {
  const openSettings = useSettingsModalStore((state) => state.open);

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      <SidebarMenuItem key="settings">
        <SidebarMenuButton isActive={false} onClick={() => openSettings()}>
          <IconSettings />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
