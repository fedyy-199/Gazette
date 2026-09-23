import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";

export function extractGuardianLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from Guardian card links
  const selectors = [
    '[data-link-name="article"]',
    "div.fc-item__container a",
    "article a[href]",
    '[data-component="card"] a',
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, "guardian")) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}
