import { cn } from "@/lib/utils";
import * as React from "react";

type Variant = "primary" | "ghost" | "danger";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-base",
    lg: "h-14 px-6 text-lg",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-sage-600 text-white hover:bg-sage-700",
    ghost: "bg-transparent text-sage-700 hover:bg-sage-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}
