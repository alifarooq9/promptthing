import {
  appendResponseMessages,
  smoothStream,
  streamText,
  UIMessage,
} from "ai";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { OpenRouterProviderOptions } from "@openrouter/ai-sdk-provider";
import { getModel } from "@/lib/models";
import { webSearchTool } from "@/lib/tools";
import { ModelId } from "@/config/models";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const client = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export async function POST(req: Request) {
  const {
    messages,
    search,
    model,
    apiKey,
    chatId,
    message,
  }: {
    messages: UIMessage[];
    search: boolean;
    model: ModelId;
    apiKey?: string;
    chatId: string;
    message: UIMessage;
  } = await req.json();

  console.log(message, "Chat ID received in POST request");

  console.log("Received messages:", messages, "Search enabled:", search);

  let tools;

  try {
    const mdlConfig = getModel(model, apiKey);

    if (!mdlConfig) {
      console.error("Model configuration not found for model:", model);
      return new Response("Model not found", { status: 404 });
    }

    if (search && mdlConfig.supportsWebSearch) {
      tools = {
        webSearch: webSearchTool(),
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
      `,
      messages,
      maxTokens: 2048,
      experimental_transform: [smoothStream({ chunking: "line" })],
      tools: tools,
      maxSteps: 2,
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
          console.log("Stream finished:", assistantMessage);
          await client.mutation(api.message.createMessage, {
            chatId: chatId as Id<"chat">,
            content: assistantMessage.content,
            role: "assistant",
            parts: JSON.stringify(assistantMessage.parts || []),
          });
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
