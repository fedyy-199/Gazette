import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function H1({ children, className, as: Component = "h1", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[32px] font-bold leading-[1.2] text-[#191919] tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H2({ children, className, as: Component = "h2", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[24px] font-semibold leading-[1.3] text-[#191919]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H3({ children, className, as: Component = "h3", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[20px] font-semibold leading-[1.3] text-[#191919]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H4({ children, className, as: Component = "h4", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[16px] font-medium leading-[1.4] text-[#191919]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function BodyLarge({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[18px] font-normal leading-[1.6] text-[#4A5566]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function BodyMedium({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[14px] font-normal leading-[1.6] text-[#4A5566]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function BodySmall({ children, className, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[13px] font-normal leading-[1.6] text-[#4A5566]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Caption({ children, className, as: Component = "span", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-[11px] font-normal leading-[1.4] text-[#4A5566]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
