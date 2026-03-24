import * as React from "react";

import { cn } from "@/core/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-md border border-border-subtle bg-bg-surface-1 px-3 py-2 text-sm text-txt-primary placeholder:text-txt-placeholder outline-none transition-all hover:border-border-accent-strong focus:border-border-accent-strong disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-bg-surface-2 disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
export { Input };
