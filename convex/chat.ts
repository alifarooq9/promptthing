import { Id } from "@/convex/_generated/dataModel";
import { mutation, query } from "@/convex/_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    const chatId = await ctx.db.insert("chat", {
      title,
      userId: user._id,
    });

    return chatId;
  },
});

export const getChats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    const chats = await ctx.db
      .query("chat")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    return chats.reverse();
  },
});

export const renameChat = mutation({
  args: { chatId: v.id("chat"), title: v.string() },
  handler: async (ctx, { chatId, title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.userId !== user._id) {
      throw new Error("User does not have permission to rename this chat");
    }
    await ctx.db.patch(chatId, { title });
    return chatId;
  },
});

export const deleteChatAndMessages = mutation({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.userId !== user._id) {
      throw new Error("User does not have permission to delete this chat");
    }
    await ctx.db.delete(chatId);

    return true;
  },
});
