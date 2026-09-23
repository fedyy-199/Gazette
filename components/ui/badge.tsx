import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "blue" | "teal" | "dark" | "neutral" | "amber";
  children: React.ReactNode;
}

export function Badge({
  children,
  className,
  variant = "green",
  ...props
}: BadgeProps) {
  const variantStyles = {
    green: "bg-[#38A169] text-white",
    blue: "bg-[#3182CE] text-white",
    teal: "bg-[#2C7A7B] text-white",
    dark: "bg-[#2D3748] text-white",
    neutral: "bg-[#E2EBF0] text-[#4A5566]",
    amber: "bg-[#FBBF24] text-[#191919] font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none select-none tracking-normal transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
