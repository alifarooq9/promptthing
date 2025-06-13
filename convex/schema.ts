import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  chat: defineTable({
    title: v.string(),
    userId: v.id("users"),
  }).index("userId", ["userId"]),
  message: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    chatId: v.id("chat"),
    reasoning: v.optional(v.string()),
    parts: v.string(),
    userId: v.id("users"),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),
});
