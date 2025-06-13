"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { IconChevronDown } from "@tabler/icons-react";
import { useStickToBottomContext } from "use-stick-to-bottom";

export type ScrollButtonProps = {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function ScrollButton({
  className,
  variant = "secondary",
  size = "icon",
  ...props
}: ScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full border border-border cursor-pointer hover:bg-secondary hover:scale-110 transition-all duration-150 ease-out",
        !isAtBottom
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0",
        className
      )}
      onClick={() => scrollToBottom()}
      {...props}
    >
      <IconChevronDown className="h-5 w-5" />
    </Button>
  );
}

export { ScrollButton };
