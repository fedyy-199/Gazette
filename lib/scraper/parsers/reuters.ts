import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractReutersLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from story cards and headings only
  const selectors = [
    '[data-testid="Heading"] a',
    '[data-testid="Feed"] a',
    'article a',
    '[class*="story-card"] a',
    'main [data-testid="Link"]',
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "reuters")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
