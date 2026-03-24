import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/core/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pr-8 py-1 text-sm text-gray-800 outline-none transition-colors focus:border-gray-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
});

Select.displayName = "Select";

export { Select };
