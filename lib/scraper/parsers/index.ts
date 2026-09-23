import * as cheerio from "cheerio";
import { normalizeUrl, isSourceArticleUrl } from "../url-filter";
import { extractReutersLinks } from "./reuters";
import { extractNprLinks } from "./npr";
import { extractBbcLinks } from "./bbc";
import { extractGuardianLinks } from "./guardian";
import { extractApLinks } from "./ap";
import { extractFoxLinks } from "./fox";

/**
 * Generic homepage card link extractor for any news source.
 * Collects visible story/article cards and validates candidate URLs.
 */
function extractGenericCardLinks(html: string, baseUrl: string, strategy?: string | null): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  // Extract from article cards, headlines, and main content links
  const selectors = [
    "main article a",
    "article a",
    '[class*="story"] a',
    '[class*="card"] a',
    '[class*="headline"] a',
    "main h2 a",
    "main h3 a",
  ];

  $(selectors.join(", ")).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isSourceArticleUrl(normalized, strategy)) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}

/**
 * Strategy router for extracting homepage card links based on parser strategy.
 */
export function extractHomepageArticleLinks(
  html: string,
  baseUrl: string,
  strategy?: string | null
): string[] {
  switch (strategy?.toLowerCase()) {
    case "reuters":
      return extractReutersLinks(html, baseUrl);
    case "npr":
      return extractNprLinks(html, baseUrl);
    case "bbc":
      return extractBbcLinks(html, baseUrl);
    case "guardian":
      return extractGuardianLinks(html, baseUrl);
    case "ap":
      return extractApLinks(html, baseUrl);
    case "fox":
      return extractFoxLinks(html, baseUrl);
    default:
      return extractGenericCardLinks(html, baseUrl, strategy);
  }
}
