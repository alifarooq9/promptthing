import { Id } from "@/convex/_generated/dataModel";
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const generateUploadUrls = mutation({
  args: {
    count: v.number(),
  },
  handler: async (ctx, { count }) => {
    try {
      let urls = [];
      for (let i = 0; i < count; i++) {
        const url = await ctx.storage.generateUploadUrl();
        if (url) {
          urls.push(url);
        }
      }
      console.log("Generated upload URLs:", urls);
      return {
        success: true,
        data: {
          urls: urls,
        },
      };
    } catch (error) {
      console.error("Error generating upload URLs:", error);
      return {
        success: false,
        message: "Failed to generate upload URLs",
      };
    }
  },
});

export const getStorageUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    try {
      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        throw new Error("No URL found for the given storage ID");
      }
      return {
        success: true,
        data: { url },
      };
    } catch (error) {
      console.error("Error getting storage URL:", error);
      return {
        success: false,
        message: "Failed to get storage URL",
      };
    }
  },
});
