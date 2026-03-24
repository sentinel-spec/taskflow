import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/core/lib/utils";

const toastVariants = cva(
  "pointer-events-auto flex min-w-[280px] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-gray-900",
        success: "border-green-200 bg-green-50 text-green-900",
        error: "border-red-200 bg-red-50 text-red-900",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
        info: "border-blue-200 bg-blue-50 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastProps = HTMLAttributes<HTMLOutputElement> &
  VariantProps<typeof toastVariants> & {
    title: string;
    description?: string;
    onClose?: () => void;
  };

export function Toast({
  className,
  variant,
  title,
  description,
  onClose,
  ...props
}: ToastProps) {
  return (
    <output
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs opacity-90">{description}</p>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 opacity-70 transition hover:opacity-100"
          aria-label="Close toast"
        >
          <X size={14} />
        </button>
      ) : null}
    </output>
  );
}
