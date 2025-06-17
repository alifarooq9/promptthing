"use client";

import { useEffect } from "react";
import type { Message as AIMessage } from "ai";

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: AIMessage[];
  experimental_resume: () => void;
  data: any;
  setMessages: (
    messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])
  ) => void;
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);
    console.log("Auto-resume: checking if resume needed", {
      mostRecentMessage,
    });

    if (mostRecentMessage?.role === "user") {
      console.log("Auto-resume: resuming stream for user message");
      experimental_resume();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.length === 0) return;

    console.log("Auto-resume: processing data stream", { data });

    // Process all data parts, not just the first one
    data.forEach((dataPart: any) => {
      if (dataPart.type === "append-message") {
        try {
          const message = JSON.parse(dataPart.message) as AIMessage;
          console.log("Auto-resume: appending message from stream", {
            message,
          });
          // Only append if the message doesn't already exist
          setMessages((currentMessages: AIMessage[]) => {
            const exists = currentMessages.some(
              (msg: AIMessage) => msg.id === message.id
            );
            if (exists) {
              console.log("Auto-resume: message already exists, skipping", {
                messageId: message.id,
              });
              return currentMessages;
            }
            console.log("Auto-resume: adding new message", {
              messageId: message.id,
            });
            return [...currentMessages, message];
          });
        } catch (error) {
          console.error("Failed to parse append-message data:", error);
        }
      }
    });
  }, [data, setMessages]);
}
