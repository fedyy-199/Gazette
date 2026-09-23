import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  // Dimensions tailored for UI proportion and crisp rendering
  const iconDimensions = {
    sm: { width: 28, height: 28, className: "w-7 h-7" },
    md: { width: 38, height: 38, className: "w-9 h-9" },
    lg: { width: 52, height: 52, className: "w-13 h-13" },
  };

  const titleSizes = {
    sm: "text-lg font-bold",
    md: "text-2xl font-bold tracking-tight",
    lg: "text-3xl font-bold tracking-tight",
  };

  const currentIcon = iconDimensions[size];

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Official Gazette Logo Graphic */}
      <div className={cn("relative flex items-center justify-center shrink-0 drop-shadow-sm hidden", currentIcon.className)}>
        <Image
          src="/logo.png"
          alt="Gazette Logo"
          width={currentIcon.width}
          height={currentIcon.height}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={cn("text-[#191919] font-serif leading-none max-sm:text-2xl", titleSizes[size])}>
          GAZETTE
        </span>
        {showTagline && (
          <span className="text-[#4A5566] text-[13px] font-normal mt-1 leading-normal">
            Insight chronicle for product teams.
          </span>
        )}
      </div>
    </div>
  );
}
