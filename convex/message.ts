import { Id } from "@/convex/_generated/dataModel";
import { mutation, query } from "@/convex/_generated/server";
import { auth } from "@/convex/auth";
import { getAuthUserId } from "@convex-dev/auth/server";
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
    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.userId !== userId) {
      throw new Error(
        "User does not have permission to create a message in this chat"
      );
    }
    const messageId = await ctx.db.insert("message", {
      content,
      chatId,
      role,
      reasoning,
      parts,
      userId,
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { chatId: v.id("chat") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.userId !== user._id) {
      throw new Error(
        "User does not have permission to access messages in this chat"
      );
    }
    const messages = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    return messages;
  },
});
