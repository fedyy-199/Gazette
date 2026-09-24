import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ArticleWithSimilarity } from "@/lib/supabase/types";

interface RelatedStoriesProps {
  articles: ArticleWithSimilarity[];
}

export function RelatedStories({ articles }: RelatedStoriesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section aria-label="Related Articles" className="space-y-4 pt-8 border-t border-[#E2EBF0] my-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold text-[#191919] tracking-tight">
              Related Stories & Coverage
            </h2>

          </div>

        </div>

        <span className="text-[12px] font-semibold text-[#718096]">
          {articles.length} {articles.length === 1 ? "story" : "stories"} matched
        </span>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((story) => {
          const analysis = story.article_analyses;
          const sourceName = story.sources?.name || "News Source";
          const similarityPct = story.similarity
            ? Math.round(story.similarity * 100)
            : null;

          const formattedDate = new Date(story.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <Link
              key={story.id}
              href={`/article/${story.id}`}
              className="flex flex-col sm:flex-row gap-3.5 p-3 rounded-[12px] border border-[#E2EBF0] bg-white hover:border-[#CBD5E0] hover:shadow-xs transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-28 sm:h-28 aspect-[16/10] sm:aspect-square shrink-0 rounded-[8px] overflow-hidden bg-[#EDF2F7]">
                <Image
                  src={story.image_url}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>

              {/* Story Details */}
              <div className="flex flex-col justify-between space-y-2 min-w-0 flex-1">
                <div className="space-y-1">
                  {/* Source + Similarity Pill */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#718096]">
                    <span className="uppercase tracking-wide truncate max-w-[140px]">
                      {sourceName}
                    </span>
                    {similarityPct !== null && (
                      <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-[#F0FFF4] text-[#2F855A] border border-[#C6F6D5]">
                        {similarityPct}% match
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h3 className="text-[14px] font-bold text-[#191919] group-hover:text-[#3182CE] transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>
                </div>

                {/* Framing bar & Meta */}
                <div className="space-y-1.5 pt-1">
                  {analysis ? (
                    <div className="w-full h-[14px] rounded-full overflow-hidden flex text-[9px] font-bold select-none leading-none shadow-2xs">
                      <div
                        className="bg-[#38A169] text-white flex items-center justify-center truncate"
                        style={{ width: `${analysis.left_percentage}%` }}
                      >
                        {analysis.left_percentage > 15 ? `${analysis.left_percentage}%` : ""}
                      </div>
                      <div
                        className="bg-[#FBBF24] text-[#191919] flex items-center justify-center truncate"
                        style={{ width: `${analysis.center_percentage}%` }}
                      >
                        {analysis.center_percentage > 15 ? `${analysis.center_percentage}%` : ""}
                      </div>
                      <div
                        className="bg-[#3182CE] text-white flex items-center justify-center truncate"
                        style={{ width: `${analysis.right_percentage}%` }}
                      >
                        {analysis.right_percentage > 15 ? `${analysis.right_percentage}%` : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[14px] rounded-full bg-[#EDF2F7] flex items-center justify-center text-[9px] text-[#718096]">
                      Analysis pending
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#718096]">
                    <span>{formattedDate}</span>
                    {analysis?.bias_label && (
                      <span className="capitalize font-medium text-[#4A5566]">
                        Framing: {analysis.bias_label}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
