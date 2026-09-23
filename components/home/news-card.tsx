"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import type { NewsArticleItem } from "@/types/news";

interface NewsCardProps {
  article: NewsArticleItem;
  showSubtext?: boolean;
}

export function NewsCard({ article, showSubtext = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { leftPercentage, centerPercentage, rightPercentage } = article.framing;

  return (
    <article className="bg-[#FFFFFF] border border-[#E2EBF0] rounded-[12px] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full group">
      
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/10] bg-[#EDF2F7] overflow-hidden">
        {!imageError ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E2EBF0] to-[#CBD5E0] text-[#718096] text-[13px] font-medium">
            {article.category}
          </div>
        )}

        {/* Info Icon Button (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(!showTooltip);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="View framing details"
          >
            <Info size={13} strokeWidth={2.2} />
          </button>

          {/* Tooltip on Hover */}
          {showTooltip && (
            <div className="absolute right-0 mt-1 w-52 p-2.5 bg-[#191919] text-white text-[11px] rounded-[6px] shadow-lg z-20 leading-tight">
              <span className="font-semibold block mb-0.5">AI Political Framing:</span>
              Left: {leftPercentage}% · Center: {centerPercentage}% · Right: {rightPercentage}%
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Category & Location */}
          <div className="text-[12px] font-semibold text-[#718096] uppercase tracking-wide">
            {article.category} · {article.location}
          </div>

          {/* Headline Title */}
          <Link href={`/article/${article.id}`}>
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#191919] leading-[1.35] group-hover:text-[#3182CE] transition-colors cursor-pointer line-clamp-2">
              {article.title}
            </h3>
          </Link>
        </div>

        {/* Political Framing Spectrum Bar */}
        <div className="space-y-1.5 pt-1">
          {article.framing.isPending ? (
            <div className="w-full h-[18px] rounded-full overflow-hidden bg-[#EDF2F7] flex items-center justify-center text-[10.5px] font-bold text-[#718096] select-none leading-none shadow-xs border border-[#E2EBF0]">
              AI Analysis Pending
            </div>
          ) : (
            <div className="w-full h-[18px] rounded-full overflow-hidden flex text-[10.5px] font-bold select-none leading-none shadow-xs">
              {/* Left Segment */}
              <div
                className="bg-[#38A169] text-white flex items-center justify-center px-1 truncate transition-all"
                style={{ width: `${leftPercentage}%` }}
              >
                L {leftPercentage}%
              </div>

              {/* Center Segment */}
              <div
                className="bg-[#FBBF24] text-[#191919] flex items-center justify-center px-1 truncate transition-all"
                style={{ width: `${centerPercentage}%` }}
              >
                Center {centerPercentage}%
              </div>

              {/* Right Segment */}
              <div
                className="bg-[#3182CE] text-white flex items-center justify-center px-1 truncate transition-all"
                style={{ width: `${rightPercentage}%` }}
              >
                Right {rightPercentage}%
              </div>
            </div>
          )}

          {/* Optional Caption labels (as seen on bottom row in design) */}
          {showSubtext && (
            <div className="flex items-center justify-between text-[11px] text-[#718096] px-1 font-normal">
              <span>Body Small</span>
              <span>Text Secondary</span>
            </div>
          )}

          {/* Footer Meta Row */}
          <div className="text-[12px] text-[#718096] font-medium pt-1">
            {article.sourceCount} sources
          </div>
        </div>

      </div>

    </article>
  );
}
