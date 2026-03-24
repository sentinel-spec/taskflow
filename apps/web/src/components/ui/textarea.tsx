import type * as React from "react";

import { cn } from "@/core/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
