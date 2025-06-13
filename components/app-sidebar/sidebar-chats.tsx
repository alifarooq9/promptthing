"use client";

import { FolderPenIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const renameFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export function Chats() {
  const chats = useQuery(api.chat.getChats);

  const groupedChats = React.useMemo(() => {
    if (!chats || chats.length === 0) return [];

    const groups: { date: string; chats: Doc<"chat">[] }[] = [];
    chats.forEach((chat) => {
      let date = format(chat._creationTime, "PPP");
      //if today or yesterday, use "Today" or "Yesterday"
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (
        new Date(chat._creationTime).toDateString() === today.toDateString()
      ) {
        date = "Today";
      } else if (
        new Date(chat._creationTime).toDateString() === yesterday.toDateString()
      ) {
        date = "Yesterday";
      }
      const existingGroup = groups.find((g) => g.date === date);
      if (existingGroup) {
        existingGroup.chats.push(chat);
      } else {
        groups.push({ date, chats: [chat] });
      }
    });

    // Sort groups by date (most recent first)
    return groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [chats]);

  if (!chats) {
    return null;
  }

  if (chats.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="p-2 text-sm font-medium text-muted-foreground">
              No chats yet!
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {groupedChats.map((groupChat) => (
        <SidebarGroup key={groupChat.date}>
          <SidebarGroupLabel>{groupChat.date}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupChat.chats.map((chat) => (
                <ChatItem key={chat._id} chat={chat} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

type ChatItemProps = {
  chat: Doc<"chat">;
};

function ChatItem({ chat }: ChatItemProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);

  console.log(chat);

  const { isMobile } = useSidebar();
  const [loading, setLoading] = React.useState(false);
  const deleteChatsAndMessages = useMutation(api.chat.deleteChatAndMessages);
  const renameChat = useMutation(api.chat.renameChat);

  const renameForm = useForm<z.infer<typeof renameFormSchema>>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleDeleteChat = async () => {
    setLoading(true);
    try {
      console.log("Deleting chat:", chat._id);
      await deleteChatsAndMessages({ chatId: chat._id });
      if (params.id === chat._id) {
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to delete chat. Please try again.");
      console.error("Error deleting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameChat = async () => {
    setLoading(true);
    console.log("Renaming chat:", chat._id);
    try {
      await renameChat({
        chatId: chat._id,
        title: renameForm.getValues("title").trim(),
      });
      setRenameDialogOpen(false);
      toast.success("Chat renamed successfully!");
    } catch (error) {
      toast.error("Failed to rename chat. Please try again.");
      console.error("Error renaming chat:", error);
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit() {
    await handleRenameChat();
  }
  return (
    <>
      <SidebarMenuItem key={chat._id}>
        <SidebarMenuButton
          asChild
          className={cn(
            params.id === chat._id &&
              "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Link href={`/${chat._id}`}>
            <span className="truncate">{chat.title}</span>
          </Link>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem
              onClick={() => {
                renameForm.reset({
                  title: chat.title,
                });
                setRenameDialogOpen(true);
              }}
            >
              <FolderPenIcon className="text-muted-foreground" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2Icon className="text-muted-foreground" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and all associated messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  if (chat._id) {
                    await handleDeleteChat();
                  }
                  setDeleteDialogOpen(false);
                } catch (error) {
                  toast.error("Failed to delete chat. Please try again.");
                  console.error("Error deleting chat:", error);
                }
              }}
            >
              {loading ? <Icons.loader /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Make changes to your chat title here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>

          <Form {...renameForm}>
            <form
              onSubmit={renameForm.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={renameForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="New chat title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Icons.loader /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
