"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
  code: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, code, ...props }: CodeBlockProps) {
  return (
    <div className="w-full relative">
      <div
        className={cn(
          "not-prose flex w-full min-w-0 flex-col overflow-hidden border",
          "border-border bg-card text-card-foreground rounded-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>

      <div className="flex items-center justify-between py-2 absolute top-1 right-3">
        <CopyButton
          content={code}
          size="icon"
          className="h-8 w-8"
          variant="ghost"
        />
      </div>
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-dark",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });
      setHighlightedHtml(html);
    }
    highlight();
  }, [code, language, theme]);

  const classNames = cn(
    "min-w-0 overflow-x-auto text-[13px] bg-inherit font-mono [&>pre]:px-4 [&>pre]:py-4 [&>pre]:!bg-transparent [&>pre]:m-0",
    "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full",
    "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50",
    className
  );

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
