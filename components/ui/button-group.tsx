"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonGroupOption<T> {
  value: T;
  label: string;
  description?: string;
}

interface ButtonGroupProps<T> {
  options: readonly ButtonGroupOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onValueChange,
  size = "sm",
  variant = "outline",
  className,
}: ButtonGroupProps<T>) {
  return (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      {options.map((option) => (
        <Button
          key={String(option.value)}
          variant={value === option.value ? "default" : variant}
          size={size}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "transition-all duration-200 min-w-[50px] text-xs sm:text-sm",
            value === option.value && "shadow-sm"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}