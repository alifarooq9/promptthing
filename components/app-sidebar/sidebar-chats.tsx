"use client";

import {
  IconEdit,
  IconDots,
  IconTrash,
  IconShare,
  IconGitBranch,
} from "@tabler/icons-react";
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
import React, { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";

const renameFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export function Chats() {
  const chatsQuery = useQuery(api.chat.getChats)!;

  const groupedChats = React.useMemo(() => {
    if (!chatsQuery || chatsQuery.data?.length === 0) return [];

    const groups: { date: string; chats: Doc<"chat">[] }[] = [];
    chatsQuery.data?.forEach((chat) => {
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
  }, [chatsQuery]);

  if (!chatsQuery) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent" />
            <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent" />
            <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent" />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!chatsQuery?.data) {
    return null;
  }

  if (chatsQuery.data.length === 0) {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("Generate the link");

  const { isMobile } = useSidebar();
  const [loading, setLoading] = useState(false);
  const deleteChatsAndMessages = useMutation(api.chat.deleteChatAndMessages);
  const renameChat = useMutation(api.chat.renameChat);
  const createShareChat = useMutation(api.chat.createShareChat);

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

  const handleShareChat = async () => {
    setLoading(true);
    try {
      const { success, data } = await createShareChat({ chatId: chat._id });
      if (!success || !data?.shareId) {
        throw new Error("Failed to create share link");
      }
      setShareLink(`${window.location.origin}/share/${data?.shareId}`);
      // Here you can handle the share link, e.g., copy to clipboard or display it
      console.log("Share link:", shareLink);
    } catch (error) {
      toast.error("Failed to create share link. Please try again.");
      console.error("Error creating share link:", error);
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
          <Link href={`/chat/${chat._id}`}>
            {chat.branched && <IconGitBranch />}
            <span className="truncate">{chat.title}</span>
          </Link>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <IconDots />
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
                setShareDialogOpen(true);
              }}
            >
              <IconShare className="text-muted-foreground" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                renameForm.reset({
                  title: chat.title,
                });
                setRenameDialogOpen(true);
              }}
            >
              <IconEdit className="text-muted-foreground" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash className="text-muted-foreground" />
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

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Chat with link</DialogTitle>
            <DialogDescription>
              Any messages you add after this will not be included in the
              shared, to share the latest messages, you will need to click on
              &quot;Generate&quot; again.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="relative w-full">
              <Input type="text" className="pe-9" readOnly value={shareLink} />

              <CopyButton
                className="absolute top-1/2 right-0.5 h-8 w-8 -translate-y-1/2 cursor-pointer"
                content={shareLink}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleShareChat}>
              {loading ? <Icons.loader /> : null}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
