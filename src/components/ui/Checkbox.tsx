"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-xl border border-sage-100 bg-white px-4 py-3 cursor-pointer select-none transition",
        checked ? "bg-sage-50 border-sage-300" : "hover:bg-sage-50",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
      />
      <span
        className={cn(
          "w-6 h-6 inline-flex items-center justify-center rounded-md border transition",
          checked ? "bg-sage-600 border-sage-600 text-white" : "border-sage-300 text-transparent",
        )}
        aria-hidden
      >
        ✓
      </span>
      <span className="text-base leading-snug">{label}</span>
    </label>
  );
}
