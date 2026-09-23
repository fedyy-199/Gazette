import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractNprLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from visible story wraps and article cards
  const selectors = [
    ".story-wrap a",
    "article.item a",
    ".story-text a",
    '[class*="story-card"] a',
    "main article h3 a",
    "main article h2 a",
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "npr")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
