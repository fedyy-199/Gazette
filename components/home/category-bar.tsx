"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  name: string;
  variant: "green" | "blue" | "neutral" | "active" | "dark";
}

const categories: Category[] = [
  { name: "World Cup", variant: "green" },
  { name: "IPL", variant: "blue" },
  { name: "Social Media", variant: "neutral" },
  { name: "Business & Markets", variant: "neutral" },
  { name: "Health & Medicine", variant: "active" },
  { name: "Soccer", variant: "green" },
  { name: "Artificial Intelligence", variant: "dark" },
  { name: "Weather", variant: "blue" },
  { name: "Extreme Weather and Disasters", variant: "neutral" },
];

export function CategoryBar() {
  const [selectedCategory, setSelectedCategory] = useState("Health & Medicine");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getPillClasses = (cat: Category) => {
    const isSelected = selectedCategory === cat.name;

    if (isSelected || cat.variant === "active") {
      return "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-semibold";
    }

    switch (cat.variant) {
      case "green":
        return "bg-[#38A169] text-white font-medium hover:bg-[#2F855A]";
      case "blue":
        return "bg-[#3182CE] text-white font-medium hover:bg-[#2B6CB0]";
      case "dark":
        return "bg-[#2D3748] text-white font-medium hover:bg-[#1A202C]";
      case "neutral":
      default:
        return "bg-[#E2EBF0] text-[#191919] font-medium hover:bg-[#CBD5E0]";
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E2EBF0] py-3 select-none">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
        
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="shrink-0 w-7 h-7 rounded-[6px] border border-[#E2EBF0] bg-white flex items-center justify-center text-[#718096] hover:text-[#191919] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable Pills */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-none scroll-smooth py-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] transition-all cursor-pointer whitespace-nowrap ${getPillClasses(
                cat
              )}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="shrink-0 w-7 h-7 rounded-[6px] border border-[#E2EBF0] bg-white flex items-center justify-center text-[#718096] hover:text-[#191919] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}
