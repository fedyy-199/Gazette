import "server-only";

export interface OxylabsScrapeResult {
  content: string;
  statusCode: number;
  url: string;
}

export interface OxylabsApiResponse {
  results?: Array<{
    content?: string;
    status_code?: number;
    url?: string;
  }>;
  errors?: unknown;
}

/**
 * Scrapes a target URL using the Oxylabs Realtime Web Scraper API.
 * Adheres to AGENTS.md Section 9, 16, 21 and .agents/skills/web-scraper-api/SKILL.md
 */
export async function scrapeUrlViaOxylabs(
  targetUrl: string,
  options: { render?: "html"; timeoutMs?: number } = {}
): Promise<OxylabsScrapeResult> {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "[Oxylabs Client] Missing OXY_WSA_USERNAME or OXY_WSA_PASSWORD in environment variables."
    );
  }

  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  const timeoutMs = options.timeoutMs ?? 60000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload: Record<string, unknown> = {
    source: "universal",
    url: targetUrl,
  };

  if (options.render) {
    payload.render = options.render;
  }

  try {
    const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      if (response.status === 401) {
        throw new Error(
          `[Oxylabs Client] 401 Unauthorized: Invalid Oxylabs credentials. Response: ${errorText}`
        );
      }
      if (response.status === 429) {
        throw new Error(
          `[Oxylabs Client] 429 Rate limit exceeded. Response: ${errorText}`
        );
      }
      throw new Error(
        `[Oxylabs Client] Request failed with HTTP ${response.status} (${response.statusText}): ${errorText}`
      );
    }

    const data = (await response.json()) as OxylabsApiResponse;

    const firstResult = data.results?.[0];
    if (!firstResult || !firstResult.content) {
      throw new Error(
        `[Oxylabs Client] No content returned from Oxylabs for URL: ${targetUrl}`
      );
    }

    return {
      content: firstResult.content,
      statusCode: firstResult.status_code || 200,
      url: firstResult.url || targetUrl,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `[Oxylabs Client] Request timed out after ${timeoutMs}ms for URL: ${targetUrl}`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
