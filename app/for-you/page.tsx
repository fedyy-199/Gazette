import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TopUtilityBar } from "@/components/home/top-utility-bar";
import { MainNavbar } from "@/components/home/main-navbar";
import { HomeFooter } from "@/components/home/footer";
import { getArticlesWithRelatedClusters } from "@/lib/supabase/queries/articles";
import { Sparkles, ArrowRight, Layers, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ForYouPage() {
  const clusters = await getArticlesWithRelatedClusters(12);

  // Clusters with at least 1 related story (semantic multi-perspective cluster)
  const multiPerspectiveClusters = clusters.filter((c) => c.related.length > 0);
  const standaloneStories = clusters.filter((c) => c.related.length === 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* 1. Top Utility Header Bar */}
      <TopUtilityBar />

      {/* 2. Main Navigation */}
      <MainNavbar />

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#EBF8FF] text-[#2B6CB0] border border-[#BEE3F8]">
                  <Sparkles size={13} className="text-[#3182CE]" />
                  Personalized AI Semantic Intelligence
                </span>
              </div>
              <h1 className="text-[28px] sm:text-[34px] font-bold text-[#191919] tracking-tight">
                For You: Multi-Angle Perspectives
              </h1>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#718096] bg-white border border-[#E2EBF0] px-3.5 py-2 rounded-[10px] shadow-2xs">
              <Layers size={16} className="text-[#3182CE]" />
              <span>
                <strong>{clusters.length}</strong> developing stories tracked with pgvector similarity
              </span>
            </div>
          </div>

          <p className="text-[14px] sm:text-[15px] text-[#718096] max-w-3xl leading-relaxed">
            Gazette groups related stories using 1536-dimensional vector embeddings so you can instantly compare how left, center, and right publications cover the exact same developing event.
          </p>
        </div>

        {/* Section 1: Semantic Story Clusters with Related Articles */}
        {multiPerspectiveClusters.length > 0 && (
          <section className="space-y-6 mb-12" aria-label="Story Clusters with Related Perspectives">
            <div className="flex items-center justify-between border-b border-[#E2EBF0] pb-3">
              <h2 className="text-[20px] font-bold text-[#191919] flex items-center gap-2">
                Developing Events & Related Coverage
              </h2>
              <span className="text-[12px] font-medium text-[#718096]">
                {multiPerspectiveClusters.length} semantic clusters
              </span>
            </div>

            <div className="space-y-6">
              {multiPerspectiveClusters.map((cluster) => {
                const { primary, related } = cluster;
                const primaryAnalysis = primary.article_analyses;
                const primarySource = primary.sources?.name || "News Source";
                const primaryDate = new Date(primary.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={primary.id}
                    className="bg-white border border-[#E2EBF0] rounded-[14px] p-5 sm:p-6 shadow-xs hover:border-[#CBD5E0] transition-all"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Primary Anchor Story (lg:col-span-7) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between text-[12px] font-semibold text-[#718096]">
                          <span className="uppercase tracking-wide text-[#3182CE]">
                            Anchor Story · {primarySource}
                          </span>
                          <span>{primaryDate}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative w-full sm:w-44 aspect-[16/10] sm:aspect-square shrink-0 rounded-[10px] overflow-hidden bg-[#EDF2F7]">
                            <Image
                              src={primary.image_url}
                              alt={primary.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 176px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="space-y-2 flex-1 min-w-0">
                            <Link href={`/article/${primary.id}`}>
                              <h3 className="text-[17px] sm:text-[19px] font-bold text-[#191919] hover:text-[#3182CE] transition-colors line-clamp-2 leading-snug">
                                {primary.title}
                              </h3>
                            </Link>

                            <p className="text-[13px] text-[#4A5566] line-clamp-2 leading-relaxed">
                              {primaryAnalysis?.summary || primary.raw_text.slice(0, 160)}...
                            </p>

                            <Link
                              href={`/article/${primary.id}`}
                              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#3182CE] hover:underline pt-1"
                            >
                              Read Full Analysis <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>

                        {/* Anchor Story Framing Bar */}
                        {primaryAnalysis && (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#718096]">
                              <span>Editorial Framing: {primaryAnalysis.bias_label}</span>
                              <span className="capitalize">Sentiment: {primaryAnalysis.sentiment_label}</span>
                            </div>
                            <div className="w-full h-[16px] rounded-full overflow-hidden flex text-[10px] font-bold select-none leading-none shadow-2xs">
                              <div
                                className="bg-[#38A169] text-white flex items-center justify-center truncate"
                                style={{ width: `${primaryAnalysis.left_percentage}%` }}
                              >
                                {primaryAnalysis.left_percentage > 15 ? `L ${primaryAnalysis.left_percentage}%` : ""}
                              </div>
                              <div
                                className="bg-[#FBBF24] text-[#191919] flex items-center justify-center truncate"
                                style={{ width: `${primaryAnalysis.center_percentage}%` }}
                              >
                                {primaryAnalysis.center_percentage > 15 ? `C ${primaryAnalysis.center_percentage}%` : ""}
                              </div>
                              <div
                                className="bg-[#3182CE] text-white flex items-center justify-center truncate"
                                style={{ width: `${primaryAnalysis.right_percentage}%` }}
                              >
                                {primaryAnalysis.right_percentage > 15 ? `R ${primaryAnalysis.right_percentage}%` : ""}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Semantically Related Multi-Angle Coverage (lg:col-span-5) */}
                      <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2EBF0] rounded-[12px] p-4 space-y-3">
                        <div className="flex items-center justify-between text-[12px] font-bold text-[#191919]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-[#3182CE]" />
                            Related Perspectives
                          </span>
                          <span className="text-[11px] text-[#718096] font-normal">
                            Vector Cosine Match
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {related.map((rel) => {
                            const relAnalysis = rel.article_analyses;
                            const relSource = rel.sources?.name || "News Source";
                            const matchPct = rel.similarity
                              ? Math.round(rel.similarity * 100)
                              : null;

                            return (
                              <Link
                                key={rel.id}
                                href={`/article/${rel.id}`}
                                className="block p-3 rounded-[9px] bg-white border border-[#E2EBF0] hover:border-[#CBD5E0] hover:shadow-2xs transition-all group"
                              >
                                <div className="flex items-center justify-between text-[11px] font-semibold text-[#718096] mb-1">
                                  <span className="uppercase tracking-wide truncate max-w-[130px]">
                                    {relSource}
                                  </span>
                                  {matchPct !== null && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F0FFF4] text-[#2F855A] border border-[#C6F6D5]">
                                      {matchPct}% match
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-[13px] font-bold text-[#191919] group-hover:text-[#3182CE] transition-colors line-clamp-2 leading-snug">
                                  {rel.title}
                                </h4>

                                {relAnalysis && (
                                  <div className="mt-2 w-full h-[10px] rounded-full overflow-hidden flex select-none leading-none shadow-2xs">
                                    <div
                                      className="bg-[#38A169]"
                                      style={{ width: `${relAnalysis.left_percentage}%` }}
                                    />
                                    <div
                                      className="bg-[#FBBF24]"
                                      style={{ width: `${relAnalysis.center_percentage}%` }}
                                    />
                                    <div
                                      className="bg-[#3182CE]"
                                      style={{ width: `${relAnalysis.right_percentage}%` }}
                                    />
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: Standalone & Additional Stories */}
        {standaloneStories.length > 0 && (
          <section className="space-y-4" aria-label="More Stories For You">
            <h2 className="text-[20px] font-bold text-[#191919] border-b border-[#E2EBF0] pb-3">
              More Curated Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standaloneStories.map(({ primary }) => {
                const analysis = primary.article_analyses;
                const source = primary.sources?.name || "News Source";
                const date = new Date(primary.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <article
                    key={primary.id}
                    className="bg-white border border-[#E2EBF0] rounded-[12px] overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-[16/10] bg-[#EDF2F7]">
                      <Image
                        src={primary.image_url}
                        alt={primary.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#718096]">
                          <span className="uppercase tracking-wide">{source}</span>
                          <span>{date}</span>
                        </div>

                        <Link href={`/article/${primary.id}`}>
                          <h3 className="text-[15px] font-bold text-[#191919] hover:text-[#3182CE] transition-colors line-clamp-2 leading-snug">
                            {primary.title}
                          </h3>
                        </Link>
                      </div>

                      {analysis && (
                        <div className="space-y-1 pt-1">
                          <div className="w-full h-[14px] rounded-full overflow-hidden flex text-[9px] font-bold select-none leading-none shadow-2xs">
                            <div
                              className="bg-[#38A169] text-white flex items-center justify-center truncate"
                              style={{ width: `${analysis.left_percentage}%` }}
                            >
                              {analysis.left_percentage > 15 ? `L ${analysis.left_percentage}%` : ""}
                            </div>
                            <div
                              className="bg-[#FBBF24] text-[#191919] flex items-center justify-center truncate"
                              style={{ width: `${analysis.center_percentage}%` }}
                            >
                              {analysis.center_percentage > 15 ? `C ${analysis.center_percentage}%` : ""}
                            </div>
                            <div
                              className="bg-[#3182CE] text-white flex items-center justify-center truncate"
                              style={{ width: `${analysis.right_percentage}%` }}
                            >
                              {analysis.right_percentage > 15 ? `R ${analysis.right_percentage}%` : ""}
                            </div>
                          </div>
                          <div className="text-[10.5px] text-[#718096] capitalize">
                            Framing: {analysis.bias_label}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {clusters.length === 0 && (
          <div className="bg-white border border-[#E2EBF0] rounded-[16px] p-12 text-center max-w-md mx-auto shadow-xs my-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F0F4F8] text-[#4A5566] flex items-center justify-center mx-auto">
              <Newspaper size={28} />
            </div>
            <h2 className="text-[20px] font-bold text-[#191919]">No Stories Yet</h2>
            <p className="text-[14px] text-[#718096] leading-relaxed">
              Once articles are scraped and analyzed with AI embeddings, semantically clustered stories will appear here automatically.
            </p>
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <HomeFooter />
    </div>
  );
}
