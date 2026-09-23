/**
 * Canonical URL filtering and Non-Article Reject List.
 * Strictly adheres to AGENTS.md Sections 9, 11, 12.
 */

// Canonical non-article reject path fragments/keywords (Section 9)
const NON_ARTICLE_REJECT_PATTERNS = [
  // Categories, sections, topics, tags
  /\/category\//i,
  /\/sections?\//i,
  /\/topics?\//i,
  /\/tag\//i,
  /\/tags\//i,
  /\/author\//i,
  /\/authors\//i,
  /\/by\//i,
  /\/profile\//i,
  /\/search/i,
  
  // Shows, programs, podcasts, audio, radio
  /\/shows?\//i,
  /\/programs?\//i,
  /\/podcasts?\//i,
  /\/audio\//i,
  /\/radio\//i,
  /\/series\//i,
  
  // Live feeds, games, quizzes
  /\/live\//i,
  /\/live-news\//i,
  /\/live-updates\//i,
  /\/games?\//i,
  /\/crosswords?\//i,
  /\/quiz\//i,
  /\/puzzles?\//i,
  
  // Shopping, products, reviews
  /\/shopping\//i,
  /\/product\//i,
  /\/products\//i,
  /\/reviews?\//i,
  /\/thefilter-us/i,
  /\/recommends\//i,
  /\/best-/i,
  /\/deals\//i,
  
  // Corporate, support, legal, about, policies
  /\/about\b/i,
  /\/contact\b/i,
  /\/privacy\b/i,
  /\/terms\b/i,
  /\/careers\b/i,
  /\/help\b/i,
  /\/support\b/i,
  /\/accessibility\b/i,
  /\/cookie-policy\b/i,
  /\/guidelines\b/i,
  /\/press\b/i,
  /\/advertise\b/i,
  /\/sitemap\b/i,
  /\/feedback\b/i,
  
  // Newsletters, subscriptions, account, login
  /\/newsletters?\//i,
  /\/subscription/i,
  /\/subscribe/i,
  /\/sign-in/i,
  /\/signup/i,
  /\/login/i,
  /\/register/i,
  /\/account/i,
  
  // Video-only
  /\/video\//i,
  /\/videos\//i,
  /\/watch\//i,
  /\/galleries\//i,
  /\/gallery\//i,
  /\/photos?\//i,
];

/**
 * Clean and normalize a candidate URL.
 * Strips hash, tracking parameters, trailing slashes, and resolves relative paths.
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const parsed = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);
    
    // Only accept http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Strip common tracking query parameters
    const paramsToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (
        key.startsWith("utm_") ||
        key === "fbclid" ||
        key === "gclid" ||
        key === "ref" ||
        key === "source" ||
        key === "taid" ||
        key === "ncid"
      ) {
        paramsToDelete.push(key);
      }
    });
    paramsToDelete.forEach((param) => parsed.searchParams.delete(param));

    // Remove hash/fragment
    parsed.hash = "";

    let clean = parsed.toString();
    // Normalize trailing slash (remove unless path is just "/")
    if (parsed.pathname !== "/" && clean.endsWith("/")) {
      clean = clean.slice(0, -1);
    }

    return clean;
  } catch {
    return null;
  }
}

/**
 * Checks if a candidate URL matches anything on the canonical non-article reject list (Section 9).
 */
export function isNonArticleReject(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    // Homepage URLs are rejected as candidate article detail pages
    if (path === "" || path === "/") {
      return true;
    }

    // Check non-article path patterns
    for (const pattern of NON_ARTICLE_REJECT_PATTERNS) {
      if (pattern.test(path)) {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Source-specific candidate URL validator (AGENTS.md Section 11 & 12).
 * Strictly requires recognized article detail URL structures.
 */
export function isSourceArticleUrl(url: string, strategy?: string | null): boolean {
  if (isNonArticleReject(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    switch (strategy?.toLowerCase()) {
      case "reuters":
        // Reuters articles: /[category]/[slug]-[YYYY-MM-DD]/ or contain date/unique id
        // Example: /world/us/biden-signs-bill-2026-03-15/ or /business/...-202...
        if (/^\/(world|business|markets|sustainability|legal|lifestyle|technology)\/[a-z0-9-]+-\d{4}-\d{2}-\d{2}\/?$/i.test(pathname)) {
          return true;
        }
        // General Reuters slug with date pattern:
        return /\/\d{4}-\d{2}-\d{2}\/?$/i.test(pathname) || (pathname.split("/").filter(Boolean).length >= 2 && /\d{4}-\d{2}-\d{2}/.test(pathname));

      case "npr":
        // NPR articles: /YYYY/MM/DD/[id]/[slug]
        // Example: /2026/09/18/1234567890/election-update
        return /^\/\d{4}\/\d{2}\/\d{2}\/\d+\/[a-z0-9-]+/i.test(pathname);

      case "bbc":
        // BBC News articles: /news/articles/[id] or /news/[topic]-[id] (where id is digits)
        if (/^\/news\/articles\/[a-z0-9]+/i.test(pathname)) return true;
        if (/^\/news\/[a-z0-9-]+-\d+$/i.test(pathname)) return true;
        // Global BBC news articles: /article/[id]
        return /^\/article\/[a-z0-9]+/i.test(pathname);

      case "guardian":
        // The Guardian articles: /[section]/YYYY/[mon]/DD/[slug]
        // Example: /us-news/2026/sep/18/headline-story
        return /^\/[a-z0-9-]+\/\d{4}\/[a-z]{3}\/\d{2}\/[a-z0-9-]+/i.test(pathname);

      case "ap":
        // AP News articles: /article/[slug-or-id]
        // Example: /article/biden-signs-bill-1234567890abcdef
        return /^\/article\/[a-z0-9-]+/i.test(pathname);

      case "fox":
        // Fox News articles: /[category]/[slug]
        // Example: /politics/senate-passes-defense-act
        // Reject show pages, category listings, etc.
        if (pathname.startsWith("/shows/") || pathname.startsWith("/video/") || pathname.startsWith("/radio/")) {
          return false;
        }
        const foxSegments = pathname.split("/").filter(Boolean);
        // Valid Fox article has category + long slug (at least 2 segments and slug > 15 chars)
        return foxSegments.length === 2 && foxSegments[1].length > 15;

      default:
        // Generic strict check:
        // Must have at least 2 path segments and either:
        // 1. A date pattern (YYYY/MM/DD or YYYY-MM-DD)
        // 2. A long slug (> 20 chars with hyphens)
        // 3. An article/story prefix
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length < 1) return false;

        const lastSegment = segments[segments.length - 1];
        const hasDate = /\d{4}[/-]\d{2}[/-]\d{2}/.test(pathname);
        const hasArticlePrefix = pathname.includes("/article") || pathname.includes("/story");
        const hasLongSlug = lastSegment.length >= 20 && lastSegment.includes("-");

        return hasDate || hasArticlePrefix || hasLongSlug;
    }
  } catch {
    return false;
  }
}
