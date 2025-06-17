import {
  appendResponseMessages,
  smoothStream,
  streamText,
  ToolSet,
  createDataStream,
} from "ai";
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
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after } from "next/server";
import { differenceInSeconds } from "date-fns";

const client = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error) {
      if ((error as Error).message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

function generateUniqueId() {
  return crypto.randomUUID();
}

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

    // Generate a unique stream ID
    const streamId = generateUniqueId();
    console.log("Creating new stream with ID:", streamId);

    // Save the stream ID to the database
    await client.mutation(api.chat.createStreamId, {
      streamId,
      chatId: chatId as Id<"chat">,
    });

    const stream = createDataStream({
      execute: (dataStream) => {
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
          experimental_generateMessageId: generateUniqueId,
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
                attachments: message.experimental_attachments
                  ? message?.experimental_attachments?.map((attachment) => ({
                      url: attachment.url,
                      name: attachment.name || "",
                      contentType: attachment.contentType || "",
                    }))
                  : undefined,
              });
            }
          },
          onFinish: async ({ response }) => {
            const [, assistantMessage] = appendResponseMessages({
              messages: [message],
              responseMessages: response.messages,
            });
            const toolInvocations = assistantMessage.parts?.filter(
              (p) => p.type === "tool-invocation"
            );
            const generateImageToolInvocation = toolInvocations?.filter(
              (p) => p.toolInvocation?.toolName === "generateImage"
            );

            const allStorageIds =
              generateImageToolInvocation?.flatMap(
                // @ts-expect-error
                (p) => p.toolInvocation?.result?.storageIds || []
              ) || [];

            try {
              await client.mutation(api.message.createMessage, {
                chatId: chatId as Id<"chat">,
                content:
                  assistantMessage.content.trim() !== ""
                    ? assistantMessage.content
                    : "Some error occurred during the generation of the response, regenerate the response.",
                role: "assistant",
                parts: JSON.stringify(assistantMessage.parts || []),
                storageIds:
                  allStorageIds.length > 0 ? allStorageIds : undefined,
              });
              console.log("token", token);
            } catch (error) {
              console.error("Error saving message:", error);
              throw new Error(
                error instanceof Error
                  ? error.message
                  : "Failed to save message"
              );
            }
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      console.log("Using resumable stream context for stream:", streamId);
      return new Response(
        await streamContext.resumableStream(streamId, () => stream)
      );
    } else {
      console.log("No stream context available, using regular stream");
      return new Response(stream);
    }
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

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  console.log("GET request for stream resumption", {
    streamContext: !!streamContext,
  });

  if (!streamContext) {
    console.log("No stream context available for resumption");
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new Response("Bad Request: Missing chatId parameter", {
      status: 400,
    });
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  client.setAuth(token);

  try {
    // Get the chat to verify access
    const chatQuery = await client.query(api.chat.getChatById, {
      chatId: chatId as Id<"chat">,
    });

    if (!chatQuery.success || !chatQuery.data) {
      return new Response("Chat not found", { status: 404 });
    }

    // Get stream IDs for this chat
    const streamIdsQuery = await client.query(api.chat.getStreamIdsByChatId, {
      chatId: chatId as Id<"chat">,
    });

    if (
      !streamIdsQuery.success ||
      !streamIdsQuery.data ||
      streamIdsQuery.data.length === 0
    ) {
      return new Response("No streams found", { status: 404 });
    }

    const recentStreamId = streamIdsQuery.data.at(-1);

    if (!recentStreamId) {
      console.log("No recent stream found for chat:", chatId);
      return new Response("No recent stream found", { status: 404 });
    }

    console.log("Attempting to resume stream:", recentStreamId);

    const emptyDataStream = createDataStream({
      execute: () => {},
    });

    const stream = await streamContext.resumableStream(
      recentStreamId,
      () => emptyDataStream
    );

    /*
     * For when the generation is streaming during SSR
     * but the resumable stream has concluded at this point.
     */
    if (!stream) {
      const messagesQuery = await client.query(api.message.getMessages, {
        chatId: chatId as Id<"chat">,
      });

      if (!messagesQuery.success || !messagesQuery.data) {
        return new Response(emptyDataStream, { status: 200 });
      }

      const mostRecentMessage = messagesQuery.data.at(-1);

      if (!mostRecentMessage) {
        return new Response(emptyDataStream, { status: 200 });
      }

      if (mostRecentMessage.role !== "assistant") {
        return new Response(emptyDataStream, { status: 200 });
      }

      const messageCreatedAt = new Date(mostRecentMessage._creationTime);
      const timeDiff = differenceInSeconds(resumeRequestedAt, messageCreatedAt);

      if (timeDiff > 15) {
        return new Response(emptyDataStream, { status: 200 });
      }

      const restoredStream = createDataStream({
        execute: (buffer) => {
          buffer.writeData({
            type: "append-message",
            message: JSON.stringify({
              id: mostRecentMessage._id,
              role: mostRecentMessage.role,
              content: mostRecentMessage.content,
              parts: mostRecentMessage.parts
                ? JSON.parse(mostRecentMessage.parts)
                : [],
              experimental_attachments: mostRecentMessage.attachments || [],
              createdAt: mostRecentMessage._creationTime,
            }),
          });
        },
      });

      return new Response(restoredStream, { status: 200 });
    }

    return new Response(stream, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/chat:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
