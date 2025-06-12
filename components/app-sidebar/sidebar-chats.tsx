import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Chats() {
  const chats = useQuery(api.chat.getChats);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats && chats.length > 0 ? (
            chats.map((chat) => (
              <SidebarMenuItem key={chat._id}>
                <SidebarMenuButton asChild>
                  <Link href={`/${chat._id}`}>
                    <span className="truncate">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover>
                  <Plus />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem className="p-2 text-sm font-medium">
              No chats yet!
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
