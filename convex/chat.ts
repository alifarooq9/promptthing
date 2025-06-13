import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const chatId = await ctx.db.insert("chat", {
      title,
    });

    return chatId;
  },
});

export const getChats = query({
  handler: async (ctx) => {
    const chats = await ctx.db.query("chat").collect();
    return chats;
  },
});

export const renameChat = mutation({
  args: { chatId: v.id("chat"), title: v.string() },
  handler: async (ctx, { chatId, title }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chatId, { title });
    return chatId;
  },
});

export const deleteChatAndMessages = mutation({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const messages = await ctx.db
      .query("message")
      .filter((q) => q.eq(q.field("chatId"), chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(chatId);

    return true;
  },
});
