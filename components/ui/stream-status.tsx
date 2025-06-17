"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StreamStatusProps {
  isStreaming: boolean;
  isResuming?: boolean;
}

export function StreamStatus({ isStreaming, isResuming }: StreamStatusProps) {
  const [showResumeNotification, setShowResumeNotification] = useState(false);

  useEffect(() => {
    if (isResuming && !showResumeNotification) {
      setShowResumeNotification(true);
      toast.success("Stream resumed successfully", {
        duration: 3000,
        id: "stream-resumed",
      });
    }
  }, [isResuming, showResumeNotification]);

  if (!isStreaming && !isResuming) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      {isResuming ? "Resuming stream..." : "Streaming..."}
    </div>
  );
}
