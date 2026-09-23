import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractFoxLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from Fox News story cards and headers
  const selectors = [
    ".info-header a",
    "article a",
    ".title a",
    '[class*="article-card"] a',
    "main h3 a",
    "main h2 a",
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "fox")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
