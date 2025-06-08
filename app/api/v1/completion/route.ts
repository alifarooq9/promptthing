import { streamText, UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    const google = createGoogleGenerativeAI({
      // TODO: Replace with env
      apiKey: "AIzaSyDxVTsNHIWjbNPI6Vt2J_T3wUmtxHtdiX8",
    });

    const result = streamText({
      model: google("models/gemini-2.0-flash-exp"),
      system: "You are a helpful assistant.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response(
      error instanceof Error
        ? (error.message ?? "No messages provided")
        : "No messages provided",
      { status: 400 }
    );
  }
}
