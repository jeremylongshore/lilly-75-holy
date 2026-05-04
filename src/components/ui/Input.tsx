import { cn } from "@/lib/utils";
import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-sage-200 bg-white px-4 text-base outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-200",
        className,
      )}
      {...props}
    />
  );
});
