import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  chat: defineTable({
    title: v.string(),
    userId: v.id("users"),
    shareId: v.optional(v.string()),
    lastSharedMessageId: v.optional(v.id("message")),
    branched: v.optional(v.boolean()),
  })
    .index("userId", ["userId"])
    .index("by_shareId", ["shareId"]),
  message: defineTable({
    id: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    chatId: v.id("chat"),
    parts: v.string(),
    userId: v.id("users"),
    attachments: v.optional(
      v.array(
        v.object({
          contentType: v.string(),
          url: v.string(),
          name: v.string(),
        })
      )
    ),
    storageIds: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"])
    .index("by_messageId", ["id"]),
  streamIds: defineTable({
    chatId: v.id("chat"),
    streamId: v.string(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_streamId", ["streamId"]),
});
