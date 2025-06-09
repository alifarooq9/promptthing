import { smoothStream, streamText, tool, UIMessage } from "ai";
import {
  createGoogleGenerativeAI,
  GoogleGenerativeAIProviderOptions,
} from "@ai-sdk/google";
import { z } from "zod";
import { tavily } from "@tavily/core";
import {
  // createOpenRouter,
  OpenRouterProviderOptions,
} from "@openrouter/ai-sdk-provider";

export async function POST(req: Request) {
  const { messages, search }: { messages: UIMessage[]; search: boolean } =
    await req.json();

  console.log("Received messages:", messages, "Search enabled:", search);

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response("GOOGLE_API_KEY is not set", { status: 500 });
  }
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    return new Response("EXA_API_KEY is not set", { status: 500 });
  }
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    return new Response("OPENROUTER_API_KEY is not set", { status: 500 });
  }

  let tools;

  try {
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // const openrouter = createOpenRouter({
    //   apiKey: openRouterApiKey,
    // });

    const tvly = tavily({ apiKey: tavilyApiKey });

    const webSearch = tool({
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

    if (search) {
      tools = { webSearch };
    }

    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp-01-21"),
      system: search
        ? "You are a helpful assistant. your all knowledge is based on the web search results. search it before answering any questions. go with the results with the highest score"
        : "You are a helpful assistant.",
      messages,
      maxTokens: 1024,
      experimental_transform: [smoothStream({ chunking: "word" })],
      tools: tools,
      maxSteps: 2,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 1024,
            includeThoughts: true,
          },
        } satisfies GoogleGenerativeAIProviderOptions,
        openrouter: {
          reasoning: {
            effort: "medium",
            max_tokens: 1024,
          },
        } satisfies OpenRouterProviderOptions,
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      error instanceof Error
        ? (error.message ?? "No messages provided")
        : "No messages provided",
      { status: 400 }
    );
  }
}
