"use client";

import { useEffect, useRef } from "react";
import type { Message as AIMessage } from "ai";

export type DataStreamDelta = {
  type: "append-message" | "text-delta" | "finish" | string;
  content?: string;
  message?: string;
};

interface DataStreamHandlerProps {
  id: string;
  data?: any[];
  setMessages: (
    messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])
  ) => void;
}

export function DataStreamHandler({
  id,
  data,
  setMessages,
}: DataStreamHandlerProps) {
  const processedDataRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data || data.length === 0) return;

    console.log("DataStreamHandler: Processing stream data:", data);

    // Process all data parts from the resumed stream
    data.forEach((dataPart: DataStreamDelta, index: number) => {
      const dataKey = `${id}-${index}-${dataPart.type}`;

      // Avoid processing the same data twice
      if (processedDataRef.current.has(dataKey)) {
        return;
      }

      console.log("DataStreamHandler: Processing delta:", dataPart);

      if (dataPart.type === "append-message" && dataPart.message) {
        try {
          const message = JSON.parse(dataPart.message) as AIMessage;
          console.log("DataStreamHandler: Appending resumed message:", message);

          setMessages((currentMessages: AIMessage[]) => {
            const exists = currentMessages.some(
              (msg: AIMessage) => msg.id === message.id
            );
            if (exists) {
              console.log(
                "DataStreamHandler: Message already exists, skipping"
              );
              return currentMessages;
            }
            console.log("DataStreamHandler: Adding resumed message");
            return [...currentMessages, message];
          });

          // Mark this data as processed
          processedDataRef.current.add(dataKey);
        } catch (error) {
          console.error("DataStreamHandler: Failed to parse message:", error);
        }
      }

      // Handle other data stream types if needed in the future
      // (text-delta, finish, etc.)
    });
  }, [data, setMessages, id]);

  return null;
}
