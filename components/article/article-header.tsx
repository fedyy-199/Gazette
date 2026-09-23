"use client";

import React, { useState } from "react";
import { Bookmark, Share2, MoreHorizontal, Check } from "lucide-react";

interface ArticleHeaderProps {
  category: string;
  region: string;
  title: string;
  author: string;
  publishedDate: string;
  readTime: string;
}

export function ArticleHeader({
  category,
  region,
  title,
  author,
  publishedDate,
  readTime,
}: ArticleHeaderProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E2EBF0] text-[#4A5566]">
          {category}
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E2EBF0] text-[#4A5566]">
          {region}
        </span>
      </div>

      {/* Article Headline */}
      <h1 className="text-[28px] sm:text-[36px] font-bold text-[#191919] leading-[1.25] tracking-tight">
        {title}
      </h1>

      {/* Metadata & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[#E2EBF0] text-[13px] text-[#718096]">
        {/* Left: Author, Date, Read Time */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#191919]">{author}</span>
          <span>·</span>
          <span>{publishedDate}</span>
          <span>·</span>
          <span>{readTime}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 text-[#4A5566]">
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 hover:text-[#191919] transition-colors cursor-pointer ${
              isSaved ? "text-[#38A169] font-medium" : ""
            }`}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-[#191919] transition-colors cursor-pointer relative"
          >
            {copied ? (
              <>
                <Check size={16} className="text-[#38A169]" />
                <span className="text-[#38A169]">Copied</span>
              </>
            ) : (
              <>
                <Share2 size={16} />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="hover:text-[#191919] transition-colors cursor-pointer p-1"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
