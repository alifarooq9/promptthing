import { Id } from "@/convex/_generated/dataModel";
import { mutation, query } from "@/convex/_generated/server";
import {} from "@/convex/_generated/dataModel";
import { auth } from "@/convex/auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import schema from "@/convex/schema";

export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chat"),
    role: schema.tables.message.validator.fields.role,
    parts: v.string(),
    attachments: schema.tables.message.validator.fields.attachments,
    storageIds: v.optional(v.array(v.id("_storage"))),
    id: v.string(),
  },
  handler: async (
    ctx,
    { content, chatId, role, parts, attachments, storageIds, id }
  ) => {
    const userId = await getAuthUserId(ctx);
    console.log("userId", userId);

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return { success: false, message: "Chat not found" };
    }
    if (chat.userId !== userId) {
      return {
        success: false,
        message:
          "User does not have permission to create a message in this chat",
      };
    }
    const messageId = await ctx.db.insert("message", {
      content,
      chatId,
      role,
      parts,
      userId,
      attachments,
      storageIds,
      id,
    });

    return {
      success: true,
      data: messageId,
      message: "Message created successfully",
    };
  },
});

export const getMessages = query({
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
        message:
          "User does not have permission to access messages in this chat",
      };
    }
    const messages = await ctx.db
      .query("message")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    return {
      success: true,
      data: messages,
      message: "Messages retrieved successfully",
    };
  },
});

export const deleteBulkMessages = mutation({
  args: { messageIds: v.array(v.string()) },
  handler: async (ctx, { messageIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    for (const messageId of messageIds) {
      const message = await ctx.db
        .query("message")
        .withIndex("by_messageId", (q) => q.eq("id", messageId))
        .unique();

      if (!message) {
        continue; // Skip if message does not exist
      }
      if (message.userId !== user._id) {
        return {
          success: false,
          message: "User does not have permission to delete this message",
        };
      }
      await ctx.db.delete(message._id);
    }

    return { success: true, message: "Messages deleted successfully" };
  },
});
