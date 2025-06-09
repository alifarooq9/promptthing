"use client";

import * as React from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "motion/react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type CopyButtonProps = Omit<HTMLMotionProps<"button">, "children" | "onCopy"> &
  VariantProps<typeof buttonVariants> & {
    content?: string;
    delay?: number;
    onCopy?: (content: string) => void;
    isCopied?: boolean;
    onCopyChange?: (isCopied: boolean) => void;
  };

function CopyButton({
  content,
  className,
  size = "icon",
  variant = "ghost",
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  ...props
}: CopyButtonProps) {
  const [localIsCopied, setLocalIsCopied] = React.useState(isCopied ?? false);
  const Icon = localIsCopied ? CheckIcon : CopyIcon;

  React.useEffect(() => {
    setLocalIsCopied(isCopied ?? false);
  }, [isCopied]);

  const handleIsCopied = React.useCallback(
    (isCopied: boolean) => {
      setLocalIsCopied(isCopied);
      onCopyChange?.(isCopied);
    },
    [onCopyChange]
  );

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isCopied) return;
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            handleIsCopied(true);
            setTimeout(() => handleIsCopied(false), delay);
            onCopy?.(content);
          })
          .catch((error) => {
            console.error("Error copying command", error);
          });
      }
      onClick?.(e);
    },
    [isCopied, content, delay, onClick, onCopy, handleIsCopied]
  );

  return (
    <motion.button
      data-slot="copy-button"
      whileTap={{ scale: 0.95 }}
      className={cn(
        buttonVariants({ variant, size }),
        "cursor-pointer h-8 w-8",
        className
      )}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={localIsCopied ? "check" : "copy"}
          data-slot="copy-button-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export { CopyButton, buttonVariants, type CopyButtonProps };
