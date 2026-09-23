import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractApLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from AP News headline cards
  const selectors = [
    '[data-key="card-headline"] a',
    ".PagePromo a",
    ".PagePromoContentIcons-text a",
    "article a",
    '[class*="CardHeadline"] a',
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "ap")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
