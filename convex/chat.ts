import { Id } from "@/convex/_generated/dataModel";
import { mutation, query } from "@/convex/_generated/server";
import schema from "@/convex/schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: {
    title: v.string(),
    initialMessages: v.optional(
      v.array(
        v.object({
          content: schema.tables.message.validator.fields.content,
          role: schema.tables.message.validator.fields.role,
          parts: schema.tables.message.validator.fields.parts,
        })
      )
    ),
  },
  handler: async (ctx, { title, initialMessages }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const chatId = await ctx.db.insert("chat", {
      title,
      userId: user._id,
    });

    if (!chatId) {
      return { success: false, message: "Failed to create chat" };
    }

    if (initialMessages && initialMessages.length > 0) {
      for (const message of initialMessages) {
        await ctx.db.insert("message", {
          content: message.content,
          role: message.role,
          chatId: chatId,
          parts: message.parts,
          userId: user._id,
        });
      }
    }

    return {
      success: true,
      data: chatId,
      message: "Chat created successfully",
    };
  },
});

export const getChats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const chats = await ctx.db
      .query("chat")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    return {
      success: true,
      data: chats.reverse(),
      message: "Chats retrieved successfully",
    };
  },
});

export const renameChat = mutation({
  args: { chatId: v.id("chat"), title: v.string() },
  handler: async (ctx, { chatId, title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return { success: false, message: "Chat not found" };
    }
    if (chat.userId !== user._id) {
      return {
        success: false,
        message: "User does not have permission to rename this chat",
      };
    }
    await ctx.db.patch(chatId, { title });
    return {
      success: true,
      data: chatId,
      message: "Chat renamed successfully",
    };
  },
});

export const deleteChatAndMessages = mutation({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return { success: false, message: "Chat not found" };
    }
    if (chat.userId !== user._id) {
      return {
        success: false,
        message: "User does not have permission to delete this chat",
      };
    }

    // Delete all messages associated with the chat
    const messages = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .collect();
    for (const message of messages) {
      if (message.storageIds) {
        for (const storageId of message.storageIds) {
          try {
            await ctx.storage.delete(storageId);
          } catch (error) {
            console.error(`Failed to delete storage ID ${storageId}:`, error);
          }
        }
      }

      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(chatId);

    return { success: true, data: true, message: "Chat deleted successfully" };
  },
});

export const createShareChat = mutation({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return { success: false, message: "Chat not found" };
    }
    if (chat.userId !== user._id) {
      return {
        success: false,
        message: "User does not have permission to share this chat",
      };
    }
    const lastMessage = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .order("desc")
      .first();

    if (!lastMessage) {
      return {
        success: false,
        message: "Chat has no messages to share",
      };
    }

    await ctx.db.patch(chatId, {
      lastSharedMessageId: lastMessage._id,
    });

    const shareId = crypto.randomUUID();
    await ctx.db.patch(chatId, { shareId });
    return {
      success: true,
      data: {
        chatId: chat._id,
        shareId: shareId,
      },
      message: "Chat shared successfully",
    };
  },
});

export const getSharedChatWithMessages = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    const userId = await getAuthUserId(ctx);

    const chat = await ctx.db
      .query("chat")
      .withIndex("by_shareId", (q) => q.eq("shareId", shareId))
      .first();

    if (!chat) {
      return { success: false, message: "Shared chat not found" };
    }

    if (chat.userId === userId) {
      return {
        success: true,
        data: { chat, messages: [], isYourChat: true },
      };
    }

    const message = await ctx.db.get(chat.lastSharedMessageId as Id<"message">);

    if (!message) {
      return { success: false, message: "No messages found for this chat" };
    }

    const messages = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) =>
        q.eq("chatId", chat._id).lte("_creationTime", message._creationTime)
      )
      .order("asc")
      .collect();
    return {
      success: true,
      data: { chat, messages },
      message: "Shared chat retrieved",
    };
  },
});
