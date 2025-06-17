// Custom stream resume utility to handle ERR_INCOMPLETE_CHUNKED_ENCODING
export async function customStreamResume(chatId: string): Promise<boolean> {
  try {
    console.log(
      "🔄 Custom resume: Attempting to fetch last message for chat:",
      chatId
    );

    const response = await fetch(`/api/v1/chat?chatId=${chatId}`, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.log("❌ Custom resume: Response not OK:", response.status);
      return false;
    }

    // Check if we got a proper response
    const contentType = response.headers.get("content-type");
    console.log("📄 Custom resume: Response content-type:", contentType);

    // If we get a stream response, that means resume worked
    if (response.body) {
      console.log("✅ Custom resume: Got stream response");

      // Read the stream to trigger any data events
      const reader = response.body.getReader();

      try {
        const { done, value } = await reader.read();
        if (!done && value) {
          console.log("✅ Custom resume: Stream has data");
          return true;
        }
      } finally {
        reader.releaseLock();
      }
    }

    return false;
  } catch (error) {
    console.error("❌ Custom resume failed:", error);
    return false;
  }
}
