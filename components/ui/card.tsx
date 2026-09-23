import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shadow?: "none" | "sm" | "md";
}

export function Card({
  children,
  className,
  shadow = "sm",
  ...props
}: CardProps) {
  const shadowStyles = {
    none: "shadow-none",
    sm: "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
    md: "shadow-[0_4px_8px_rgba(0,0,0,0.08)]",
  };

  return (
    <div
      className={cn(
        "bg-[#FFFFFF] border border-[#E2EBF0] rounded-[12px] p-6 transition-shadow",
        shadowStyles[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-4 border-t border-[#E2EBF0]", className)} {...props}>
      {children}
    </div>
  );
}
