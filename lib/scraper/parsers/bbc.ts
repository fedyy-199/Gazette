import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractBbcLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from BBC headline links and promo cards
  const selectors = [
    '[data-testid="anchor-inner"]',
    '[data-testid="card-headline"] a',
    '[data-testid="internal-link"]',
    'article a',
    '[class*="PromoHeadline"] a',
    '[class*="Headline"] a',
  ];

  $(selectors.join(", ")).each((_, el) => {
    let href = $(el).attr("href");
    if (!href) {
      // If anchor-inner, parent may be the <a> tag
      href = $(el).closest("a").attr("href");
    }
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "bbc")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
