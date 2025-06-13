import { Id } from "@/convex/_generated/dataModel";
import { mutation, query } from "@/convex/_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
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
    await ctx.db.delete(chatId);

    return { success: true, data: true, message: "Chat deleted successfully" };
  },
});
