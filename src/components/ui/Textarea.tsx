import { cn } from "@/lib/utils";
import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[140px] w-full rounded-xl border border-sage-200 bg-white p-4 text-base outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-200",
        className,
      )}
      {...props}
    />
  );
});
