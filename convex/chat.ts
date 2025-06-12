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
