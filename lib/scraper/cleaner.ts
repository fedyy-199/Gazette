import * as cheerio from "cheerio";
import type { ArticleValidationResult, ExtractedArticleData } from "./types";
import { isNonArticleReject, normalizeUrl } from "./url-filter";

// Generic / Section titles that should be rejected
const GENERIC_TITLE_PATTERNS = [
  /^news$/i,
  /^home$/i,
  /^latest news$/i,
  /^breaking news$/i,
  /^politics$/i,
  /^world news$/i,
  /^business$/i,
  /^opinion$/i,
  /^entertainment$/i,
  /^sports$/i,
  /^lifestyle$/i,
  /^tech$/i,
  /^science$/i,
  /^health$/i,
  /^shows$/i,
  /^podcasts$/i,
  /^videos$/i,
  /^live updates$/i,
];

/**
 * Strips known media site suffixes from article titles.
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*[|\-–—]\s*(Reuters|NPR|BBC News|BBC|The Guardian|AP News|Associated Press|Fox News|Fox).*$/i, "")
    .trim();
}

/**
 * Extracts published date from DOM or JSON-LD metadata.
 */
function extractPublishedDate($: cheerio.CheerioAPI): string | null {
  // 1. Meta article:published_time
  const metaPublished = $('meta[property="article:published_time"]').attr("content");
  if (metaPublished && isValidDate(metaPublished)) {
    return new Date(metaPublished).toISOString();
  }

  // 2. Other common meta date tags
  const otherDateMeta =
    $('meta[name="date"]').attr("content") ||
    $('meta[name="pubdate"]').attr("content") ||
    $('meta[name="publish-date"]').attr("content") ||
    $('meta[property="og:published_time"]').attr("content") ||
    $('meta[name="parsely-pub-date"]').attr("content");
  if (otherDateMeta && isValidDate(otherDateMeta)) {
    return new Date(otherDateMeta).toISOString();
  }

  // 3. <time> tags
  let timeTagDate: string | null = null;
  $("time").each((_, el) => {
    const dt = $(el).attr("datetime");
    if (dt && isValidDate(dt) && !timeTagDate) {
      timeTagDate = new Date(dt).toISOString();
    }
  });
  if (timeTagDate) return timeTagDate;

  // 4. JSON-LD scripts
  let jsonLdDate: string | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLdDate) return;
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const candidate = item.datePublished || item.dateCreated || item.dateModified;
        if (candidate && isValidDate(candidate)) {
          jsonLdDate = new Date(candidate).toISOString();
          return;
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  });

  return jsonLdDate;
}

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Extracts a high quality image URL for the article.
 */
function extractImageUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // 1. OpenGraph / Twitter meta image
  const metaImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[name="twitter:image:src"]').attr("content");

  if (metaImage) {
    const normalized = normalizeUrl(metaImage, baseUrl);
    if (normalized) return normalized;
  }

  // 2. JSON-LD image
  let jsonLdImage: string | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLdImage) return;
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item.image) {
          const img = typeof item.image === "string" ? item.image : item.image.url;
          if (img) {
            jsonLdImage = normalizeUrl(img, baseUrl);
            return;
          }
        }
      }
    } catch {
      // Ignore
    }
  });
  if (jsonLdImage) return jsonLdImage;

  // 3. Article hero image in DOM
  const domImage = $(
    "article img[src], main img[src], figure img[src], .article-body img[src]"
  ).first().attr("src");

  if (domImage) {
    return normalizeUrl(domImage, baseUrl);
  }

  return null;
}

/**
 * Cleans the DOM and extracts meaningful, clean article text.
 * Strictly adheres to AGENTS.md Section 13.
 */
function extractCleanArticleBody($: cheerio.CheerioAPI): { rawText: string; paragraphCount: number } {
  // Remove scripts, styles, ad placeholders, navigation, social share, newsletters, and class dumps
  const elementsToRemove = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "nav",
    "header",
    "footer",
    "aside",
    ".ad",
    ".ads",
    ".advertisement",
    ".ad-container",
    ".social-share",
    ".share-buttons",
    ".newsletter",
    ".newsletter-signup",
    ".subscribe-prompt",
    ".related-content",
    ".more-stories",
    ".most-popular",
    ".most-read",
    ".comments",
    ".comment-section",
    ".author-bio",
    ".byline-container",
    ".tags",
    ".breadcrumbs",
    '[role="dialog"]',
    '[role="alert"]',
    '[aria-hidden="true"]',
  ];

  elementsToRemove.forEach((sel) => $(sel).remove());

  // Target the article body container if available
  const bodyContainer = $(
    "article, [itemprop='articleBody'], main, .article-body, .story-body, .article__content"
  ).first();

  const container = bodyContainer.length > 0 ? bodyContainer : $("body");

  // Collect paragraphs
  const rawParagraphs: string[] = [];
  container.find("p").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    // Exclude captions, photo credits, copyright, short disclaimers
    if (
      text.length > 25 &&
      !/^photo:/i.test(text) &&
      !/^image credit/i.test(text) &&
      !/^all rights reserved/i.test(text) &&
      !/^follow us on/i.test(text) &&
      !/^sign up for/i.test(text) &&
      !/^read more:/i.test(text) &&
      !/^advertisement/i.test(text)
    ) {
      rawParagraphs.push(text);
    }
  });

  // If text extraction returned one large paragraph or no explicit <p>, split by line breaks or sentences
  let paragraphs = rawParagraphs;
  if (paragraphs.length === 1 && paragraphs[0].length > 400) {
    const splitSentences = paragraphs[0]
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
      .reduce<string[]>((acc, sentence) => {
        if (acc.length === 0 || acc[acc.length - 1].length > 300) {
          acc.push(sentence);
        } else {
          acc[acc.length - 1] += " " + sentence;
        }
        return acc;
      }, []);
    if (splitSentences.length >= 2) {
      paragraphs = splitSentences;
    }
  }

  const rawText = paragraphs.join("\n\n").trim();
  return {
    rawText,
    paragraphCount: paragraphs.length,
  };
}

/**
 * Validates scraped detail page HTML and extracts clean article data.
 * Must pass the Article Content Gate (AGENTS.md Section 9 & 13).
 */
export function validateAndCleanArticle(
  html: string,
  targetUrl: string,
  sourceId: string
): ArticleValidationResult {
  const $ = cheerio.load(html);

  // 1. Canonical URL check
  const rawCanonical = $('link[rel="canonical"]').attr("href") || $('meta[property="og:url"]').attr("content");
  const canonicalUrl = rawCanonical ? normalizeUrl(rawCanonical, targetUrl) : null;
  if (canonicalUrl && isNonArticleReject(canonicalUrl)) {
    return {
      isValid: false,
      rejectionReason: "canonical_url_is_non_article_page",
    };
  }

  // 2. Title extraction & check
  let title =
    $('meta[property="og:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim();

  if (!title || title.length < 10) {
    return {
      isValid: false,
      rejectionReason: "missing_or_short_title",
    };
  }

  title = cleanTitle(title);

  // Reject generic or category titles
  for (const pattern of GENERIC_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      return {
        isValid: false,
        rejectionReason: `generic_title_rejected: ${title}`,
      };
    }
  }

  // 3. Published date check (STRICT GATE: Required!)
  const publishedAt = extractPublishedDate($);
  if (!publishedAt) {
    return {
      isValid: false,
      rejectionReason: "missing_published_date",
    };
  }

  // 4. Image URL check (STRICT GATE: Required!)
  const imageUrl = extractImageUrl($, targetUrl);
  if (!imageUrl) {
    return {
      isValid: false,
      rejectionReason: "missing_image_url",
    };
  }

  // 5. Body cleanup and quality check (STRICT GATE)
  const { rawText, paragraphCount } = extractCleanArticleBody($);

  // Body quality must pass either:
  // - 3 or more meaningful paragraphs, OR
  // - 900 or more meaningful characters after cleanup
  const passesQuality = paragraphCount >= 3 || rawText.length >= 900;
  if (!passesQuality || rawText.length < 250) {
    return {
      isValid: false,
      rejectionReason: `insufficient_body_content (paragraphs: ${paragraphCount}, chars: ${rawText.length})`,
    };
  }

  const data: ExtractedArticleData = {
    sourceId,
    originalUrl: targetUrl,
    canonicalUrl,
    title,
    imageUrl,
    publishedAt,
    rawText,
  };

  return {
    isValid: true,
    data,
  };
}
