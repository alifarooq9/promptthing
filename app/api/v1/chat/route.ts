import { smoothStream, streamText, UIMessage } from "ai";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { OpenRouterProviderOptions } from "@openrouter/ai-sdk-provider";
import { getModel } from "@/lib/models";
import { webSearchTool } from "@/lib/tools";
import { ModelId } from "@/config/models";

export async function POST(req: Request) {
  const {
    messages,
    search,
    model,
  }: { messages: UIMessage[]; search: boolean; model: ModelId } =
    await req.json();

  console.log("Received messages:", messages, "Search enabled:", search);

  let tools;

  try {
    const mdlConfig = getModel(model);

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
      experimental_transform: [
        smoothStream({ chunking: "line", delayInMs: 20 }),
      ],
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
