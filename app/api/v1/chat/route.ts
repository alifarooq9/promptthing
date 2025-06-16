import { appendResponseMessages, smoothStream, streamText, ToolSet } from "ai";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { OpenRouterProviderOptions } from "@openrouter/ai-sdk-provider";
import { getModel } from "@/lib/models";
import { generateImageTool, webSearchTool } from "@/lib/tools";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { BodyRequest } from "@/components/chat";

const client = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export async function POST(req: Request) {
  const {
    messages,
    search,
    model,
    generateImage,
    apiKey,
    toolsApiKey,
    chatId,
    message,
    imageGenModel,
  }: BodyRequest = await req.json();

  const token = await convexAuthNextjsToken();
  if (!token) {
    console.error("No authentication token found");
    return new Response("Unauthorized", { status: 401 });
  }

  client.setAuth(token);

  let tools: ToolSet = {};

  try {
    const mdlConfig = getModel(model, apiKey);

    if (!mdlConfig) {
      console.error("Model configuration not found for model:", model);
      return new Response("Model not found", { status: 404 });
    }

    if (search && mdlConfig.supportsWebSearch) {
      tools = {
        ...tools,
        webSearch: webSearchTool(),
      };
    }

    console.log(generateImage, toolsApiKey);

    if (generateImage) {
      tools = {
        ...tools,
        generateImage: generateImageTool(
          toolsApiKey?.runware as string,
          imageGenModel
        ),
      };
    }

    const result = streamText({
      model: mdlConfig.model,
      system: `
      You are Promptthing, an ai assistant that can answer questions and help with tasks.
      Be helpful and provide relevant information
      Be respectful and polite in all interactions.
      Be engaging and maintain a conversational tone.
      Your answers will be used in a chat application.
      Your responses should be always in markdown format.
      ${search ? "You can search the web for up-to-date information. use in if necessary." : ""}
      ${generateImage ? "You can create/generate an image based on a prompt. NOTES: YOU DON'T NEED TO SHOW THE IMAGE WITH THE URL, WE ALREADY HAVE COMPONENT WHICH WILL SHOW THE IMAGE ABOVE YOUR TEXT" : ""}`,
      messages,
      maxTokens: 2048,
      experimental_transform: [smoothStream({ chunking: "line" })],
      tools: tools,
      maxSteps: 3,
      providerOptions: {
        ...(mdlConfig.canReason && {
          google: {
            thinkingConfig: {
              thinkingBudget: 1024,
              includeThoughts: true,
            },
          } satisfies GoogleGenerativeAIProviderOptions,

          openrouter: {
            reasoning: {
              effort: "medium",
            },
          } satisfies OpenRouterProviderOptions,

          anthropic: {
            thinking: {
              type: "enabled",
              budgetTokens: 1024,
            },
          } satisfies AnthropicProviderOptions,

          openai: {
            reasoningSummary: "detailed",
            reasoningEffort: "medium",
          } satisfies OpenAIResponsesProviderOptions,
        }),
      },
      headers: {
        ...(mdlConfig.canReason && {
          "anthropic-beta": "interleaved-thinking-2025-05-14",
        }),
      },
      onStepFinish: async ({ stepType }) => {
        if (stepType === "initial") {
          await client.mutation(api.message.createMessage, {
            chatId: chatId as Id<"chat">,
            content: message?.content as string,
            role: "user",
            parts: JSON.stringify(message?.parts || []),
          });
        }
      },
      onFinish: async ({ response }) => {
        const [, assistantMessage] = appendResponseMessages({
          messages: [message],
          responseMessages: response.messages,
        });

        try {
          await client.mutation(api.message.createMessage, {
            chatId: chatId as Id<"chat">,
            content:
              assistantMessage.content.trim() !== ""
                ? assistantMessage.content
                : "Some error occurred during the generation of the response, regenerate the response.",
            role: "assistant",
            parts: JSON.stringify(assistantMessage.parts || []),
          });
          console.log("token", token);
        } catch (error) {
          console.error("Error saving message:", error);
          throw new Error(
            error instanceof Error ? error.message : "Failed to save message"
          );
        }
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (error) => {
        console.log("Error in processing request:", error);
        return error instanceof Error
          ? (error.message ?? "No messages provided")
          : "No messages provided";
      },
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
