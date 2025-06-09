import { tavily } from "@tavily/core";
import { tool } from "ai";
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
    },
  });
}
