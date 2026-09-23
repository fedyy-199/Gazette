import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text" | "primary-hover";
  size?: "sm" | "md" | "lg" | "full";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium transition-colors duration-150 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

  const variantStyles = {
    primary:
      "bg-[#F59E0B] text-[#191919] font-semibold hover:bg-[#D97706] active:bg-[#B45309] shadow-sm",
    "primary-hover":
      "bg-[#D97706] text-[#191919] font-semibold",
    secondary:
      "bg-[#E2EBF0] text-[#191919] hover:bg-[#CBD5E0] active:bg-[#94A3B8]",
    text:
      "bg-transparent text-[#191919] hover:text-[#3182CE] hover:underline px-2 py-1",
  };

  const sizeStyles = {
    sm: "text-[13px] px-3 py-1.5 h-8",
    md: "text-[14px] px-4 py-2 h-10",
    lg: "text-[16px] px-6 py-2.5 h-12",
    full: "w-full text-[14px] font-semibold uppercase tracking-wider py-3 px-4",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
