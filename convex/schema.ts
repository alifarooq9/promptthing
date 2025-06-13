import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  chat: defineTable({
    title: v.string(),
  }),
  message: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    chatId: v.id("chat"),
    reasoning: v.optional(v.string()),
    parts: v.string(),
  }).index("by_chatId", ["chatId"]),
});
