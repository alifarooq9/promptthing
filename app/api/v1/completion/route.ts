import { streamText, UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response("GOOGLE_API_KEY is not set", { status: 500 });
  }

  try {
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
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
