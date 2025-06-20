import { ImageGenModelId } from "@/config/models";
import { api } from "@/convex/_generated/api";
import { tavily } from "@tavily/core";
import { tool } from "ai";
import { fetchAction } from "convex/nextjs";
import { z } from "zod";

export function webSearchTool() {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  const tvly = tavily({ apiKey: tavilyApiKey });

  return tool({
    description: "Search the web for up-to-date information",
    parameters: z.object({
      query: z.string().min(1).max(100).describe("The search query"),
    }),
    execute: async ({ query }) => {
      try {
        const response = await tvly.search(query, {
          maxResults: 5,
          searchDepth: "advanced",
          includeRawContent: "text",
        });

        return response.results.map((result) => ({
          title: result.title,
          url: result.url,
          description: result.content,
          content: result.content,
          score: result.score,
          rawContent: result.rawContent?.slice(0, 1000) ?? "",
        }));
      } catch (error) {
        console.error("Error during web search:", error);
        throw new Error("Failed to perform web search");
      }
    },
  });
}

export function generateImageTool(
  apiKey: string,
  imageGenModel: ImageGenModelId,
  attachmentUrl: string | undefined = undefined
) {
  return tool({
    description: "Generate and transform an image based on a prompt",
    parameters: z.object({
      prompt: z.string().min(1).describe("The image generation prompt"),
    }),
    execute: async ({ prompt }) => {
      const { success, data, message } = await fetchAction(
        api.image.generateAndStore,
        {
          prompt,
          apiKey,
          imageGenModel,
          attachmentUrl,
        }
      );

      if (!success) {
        console.error("Image generation failed:", data);
        throw new Error(message || "Image generation failed");
      }

      if (!data || !data.imagesUrls || data.imagesUrls.length === 0) {
        throw new Error("No images generated");
      }

      return {
        imagesUrls: data.imagesUrls,
        storageIds: data.storageIds,
        message: "Image generated successfully",
      };
    },
  });
}
