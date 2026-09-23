import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopUtilityBar } from "@/components/home/top-utility-bar";
import { MainNavbar } from "@/components/home/main-navbar";
import { ArticleHeader } from "@/components/article/article-header";
import { BiasDistributionCard } from "@/components/article/bias-distribution-card";
import { BiasAnalysisSidebar } from "@/components/article/bias-analysis-sidebar";
import { StayInformedBar } from "@/components/article/stay-informed-bar";
import { RelatedStories } from "@/components/article/related-stories";
import { getArticleById, getRelatedArticles } from "@/lib/supabase/queries/articles";

export const dynamic = "force-dynamic";

export default async function ArticleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await dynamic route params in Next.js App Router
  const { id } = await params;

  // Fetch real article with analysis from Supabase database (AGENTS.md Section 5, 7, 19)
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const analysis = article.article_analyses;
  const isPending = !analysis;

  // Fetch pgvector related articles if current article has an embedding (AGENTS.md Section 20)
  const relatedArticles = analysis?.embedding
    ? await getRelatedArticles(article.id, analysis.embedding, 5)
    : [];

  // Split raw text into clean paragraphs
  const paragraphs = article.raw_text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Format published date
  const publishedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate estimated read time
  const wordCount = article.raw_text.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const sourceName = article.sources?.name || "News Source";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">

      {/* 1. Top Utility Bar */}
      <TopUtilityBar />

      {/* 2. Main Navigation */}
      <MainNavbar />

      {/* 3. Main Content Article Layout */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* MAIN ARTICLE COLUMN (Left: Cols 1-8) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Header: Categories, Headline, Byline, Save/Share */}
            <ArticleHeader
              category={sourceName}
              region="Global"
              title={article.title}
              author={`Published by ${sourceName}`}
              publishedDate={publishedDate}
              readTime={readTime}
            />

            {/* Featured Image */}
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/10] rounded-[12px] overflow-hidden bg-[#EDF2F7] shadow-xs">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Source attribution caption */}
              <p className="text-[12px] text-[#718096] leading-relaxed">
                Source: {sourceName} · Original story:{" "}
                <a
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3182CE] hover:underline"
                >
                  View original publication
                </a>
              </p>
            </div>

            {/* Article Body */}
            <div className="space-y-4 text-[16px] text-[#2D3748] leading-[1.7]">
              {paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>

            {/* Bias Distribution Card */}
            <BiasDistributionCard
              leftPercentage={analysis?.left_percentage ?? 33}
              centerPercentage={analysis?.center_percentage ?? 34}
              rightPercentage={analysis?.right_percentage ?? 33}
              sourceCount={1}
            />

            {/* Related Articles Section (pgvector cosine similarity match, AGENTS.md Section 20) */}
            {analysis?.embedding && relatedArticles.length > 0 && (
              <RelatedStories articles={relatedArticles} />
            )}

          </div>

          {/* SIDEBAR COLUMN (Right: Cols 9-12) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BiasAnalysisSidebar
                summary={analysis?.summary}
                biasLabel={analysis?.bias_label}
                leftPercentage={analysis?.left_percentage}
                centerPercentage={analysis?.center_percentage}
                rightPercentage={analysis?.right_percentage}
                confidence={analysis?.confidence}
                framingNotes={analysis?.framing_notes}
                loadedTerms={analysis?.loaded_terms}
                disclaimer={analysis?.disclaimer}
                isPending={isPending}
              />
            </div>
          </div>

        </div>

      </main>

      {/* 4. Pre-Footer Stay Informed Bar & Footer */}
      <StayInformedBar />

    </div>
  );
}
