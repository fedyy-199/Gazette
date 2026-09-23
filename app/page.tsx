import React from "react";
import { TopUtilityBar } from "@/components/home/top-utility-bar";
import { MainNavbar } from "@/components/home/main-navbar";
import { CategoryBar } from "@/components/home/category-bar";
import { NewsCard } from "@/components/home/news-card";
import { HomeFooter } from "@/components/home/footer";
import { getHomepageArticles } from "@/lib/supabase/queries/articles";
import type { NewsArticleItem } from "@/types/news";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real articles from Supabase database (AGENTS.md Section 5 & 7)
  const articlesFromDb = await getHomepageArticles(24);

  const displayArticles: NewsArticleItem[] = articlesFromDb.map((item) => {
    const analysis = item.article_analyses;
    const isPending = !analysis;

    return {
      id: item.id,
      category: item.sources?.name || "News",
      location: "Global",
      title: item.title,
      imageUrl: item.image_url,
      sourceCount: 1,
      framing: {
        leftPercentage: analysis?.left_percentage ?? 33,
        centerPercentage: analysis?.center_percentage ?? 34,
        rightPercentage: analysis?.right_percentage ?? 33,
        label: analysis?.bias_label ?? "unclear",
        isPending,
      },
      publishedAt: item.published_at,
    };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* 1. Top Utility Header Bar */}
      <TopUtilityBar />

      {/* 2. Main Navigation Header */}
      <MainNavbar />

      {/* 3. Category Horizontal Pills Bar */}
      <CategoryBar />

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        
        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#191919] tracking-tight">
            Top News
          </h1>
          <span className="text-[13px] text-[#718096] font-medium">
            {displayArticles.length} {displayArticles.length === 1 ? "story" : "stories"} from verified sources
          </span>
        </div>

        {/* 3-Column Responsive News Grid */}
        {displayArticles.length > 0 ? (
          <section
            aria-label="Top News Articles"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayArticles.map((article, index) => (
              <NewsCard
                key={article.id}
                article={article}
                showSubtext={index >= 6}
              />
            ))}
          </section>
        ) : (
          <div className="bg-white border border-[#E2EBF0] rounded-[16px] p-12 text-center max-w-lg mx-auto shadow-xs my-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F0F4F8] text-[#4A5566] flex items-center justify-center mx-auto">
              <Newspaper size={28} />
            </div>
            <h2 className="text-[20px] font-bold text-[#191919]">No Articles in Feed Yet</h2>
            <p className="text-[14px] text-[#718096] leading-relaxed">
              Real articles will appear here automatically as Oxylabs scrapes active news sources and AI analysis processes them.
            </p>
          </div>
        )}

      </main>

      {/* 5. Multi-Column Footer */}
      <HomeFooter />

    </div>
  );
}
