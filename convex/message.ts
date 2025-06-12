import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chat"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    reasoning: v.optional(v.string()),
    parts: v.string(),
  },
  handler: async (ctx, { content, chatId, role, reasoning, parts }) => {
    const messageId = await ctx.db.insert("message", {
      content,
      chatId,
      role,
      reasoning,
      parts,
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const messages = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    return messages;
  },
});
