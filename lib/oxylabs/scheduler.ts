import "server-only";

export interface OxylabsScheduledJob {
  id: string;
  create_status_code?: number;
  result_status: "pending" | "done" | "faulted" | string;
  created_at?: string;
  result_created_at?: string;
}

export interface OxylabsScheduleRunItem {
  run_id: string | number;
  jobs: OxylabsScheduledJob[];
  success_rate?: number;
}

export interface OxylabsCreateScheduleResponse {
  schedule_id: string;
  active: boolean;
  items_count?: number;
  cron?: string;
  end_time?: string;
  next_run_at?: string;
}

export interface OxylabsJobResult {
  content: string;
  statusCode: number;
  url: string;
}

/**
 * Safely parses JSON strings containing 64-bit integer IDs without JavaScript
 * precision corruption beyond Number.MAX_SAFE_INTEGER.
 * Adheres strictly to AGENTS.md Section 18.
 */
export function parseJsonWithSafeBigInts<T = unknown>(rawJson: string): T {
  // Regex replacement to convert unquoted large integer IDs into string values
  // e.g. "schedule_id": 168110763619310929 -> "schedule_id": "168110763619310929"
  // e.g. "id": 7505291047442843649 -> "id": "7505291047442843649"
  // e.g. "run_id": 105302280 -> "run_id": "105302280"
  const sanitized = rawJson.replace(
    /("(?:schedule_id|id|job_id|run_id)"\s*:\s*)(\d+)/g,
    '$1"$2"'
  );
  return JSON.parse(sanitized) as T;
}

function getOxylabsBasicAuth(): string {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "[Oxylabs Scheduler] Missing OXY_WSA_USERNAME or OXY_WSA_PASSWORD in environment variables."
    );
  }

  return Buffer.from(`${username}:${password}`).toString("base64");
}

/**
 * Create a new daily schedule on Oxylabs for a given homepage URL.
 * Defaults to 00:00 UTC daily ("0 0 * * *").
 */
export async function createOxylabsSchedule(
  url: string,
  cron = "0 0 * * *",
  endTime = "2035-01-01 00:00:00"
): Promise<OxylabsCreateScheduleResponse> {
  const basicAuth = getOxylabsBasicAuth();

  const payload = {
    cron,
    items: [
      {
        source: "universal",
        url,
      },
    ],
    end_time: endTime,
  };

  const response = await fetch("https://data.oxylabs.io/v1/schedules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `[Oxylabs Scheduler] Failed to create schedule (${response.status} ${response.statusText}): ${rawText}`
    );
  }

  // Safe parse to retain exact schedule_id
  const parsed = parseJsonWithSafeBigInts<{
    schedule_id?: string | number;
    active?: boolean;
    items_count?: number;
    cron?: string;
    end_time?: string;
    next_run_at?: string;
  }>(rawText);

  // Direct regex fallback for absolute certainty
  let scheduleIdStr = String(parsed.schedule_id || "");
  const match = rawText.match(/"schedule_id"\s*:\s*"?(\d+)"?/);
  if (match && match[1]) {
    scheduleIdStr = match[1];
  }

  if (!scheduleIdStr) {
    throw new Error(
      `[Oxylabs Scheduler] Could not extract schedule_id from response: ${rawText}`
    );
  }

  return {
    schedule_id: scheduleIdStr,
    active: parsed.active ?? true,
    items_count: parsed.items_count,
    cron: parsed.cron,
    end_time: parsed.end_time,
    next_run_at: parsed.next_run_at,
  };
}

/**
 * Lists all Oxylabs schedule IDs associated with the account.
 */
export async function getAllOxylabsScheduleIds(): Promise<string[]> {
  const basicAuth = getOxylabsBasicAuth();

  const response = await fetch("https://data.oxylabs.io/v1/schedules", {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `[Oxylabs Scheduler] Failed to list schedules (${response.status}): ${rawText}`
    );
  }

  const parsed = parseJsonWithSafeBigInts<{ schedules?: Array<string | number> }>(rawText);
  if (!parsed.schedules || !Array.isArray(parsed.schedules)) {
    return [];
  }

  return parsed.schedules.map((id) => String(id));
}

/**
 * Gets runs information for a schedule.
 * Uses /runs rather than /jobs per AGENTS.md Section 18.
 */
export async function getOxylabsScheduleRuns(
  scheduleId: string
): Promise<OxylabsScheduleRunItem[]> {
  const basicAuth = getOxylabsBasicAuth();

  const response = await fetch(
    `https://data.oxylabs.io/v1/schedules/${scheduleId}/runs`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `[Oxylabs Scheduler] Failed to fetch runs for schedule ${scheduleId} (${response.status}): ${rawText}`
    );
  }

  const parsed = parseJsonWithSafeBigInts<{ runs?: OxylabsScheduleRunItem[] }>(rawText);
  return parsed.runs || [];
}

/**
 * Deactivates or reactivates a schedule on Oxylabs.
 */
export async function setOxylabsScheduleState(
  scheduleId: string,
  active: boolean
): Promise<void> {
  const basicAuth = getOxylabsBasicAuth();

  const response = await fetch(
    `https://data.oxylabs.io/v1/schedules/${scheduleId}/state`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ active }),
    }
  );

  if (!response.ok) {
    const rawText = await response.text().catch(() => "");
    throw new Error(
      `[Oxylabs Scheduler] Failed to set state for schedule ${scheduleId} (${response.status}): ${rawText}`
    );
  }
}

/**
 * Retrieves the scraped content result for a completed Push-Pull/Scheduler job.
 */
export async function getOxylabsJobResult(
  jobId: string
): Promise<OxylabsJobResult> {
  const basicAuth = getOxylabsBasicAuth();

  const response = await fetch(
    `https://data.oxylabs.io/v1/queries/${jobId}/results`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `[Oxylabs Scheduler] Failed to fetch results for job ${jobId} (${response.status}): ${rawText}`
    );
  }

  const parsed = JSON.parse(rawText) as {
    results?: Array<{
      content?: string;
      status_code?: number;
      url?: string;
    }>;
  };

  const firstResult = parsed.results?.[0];
  if (!firstResult || !firstResult.content) {
    throw new Error(
      `[Oxylabs Scheduler] No content found in result for job ${jobId}`
    );
  }

  return {
    content: firstResult.content,
    statusCode: firstResult.status_code || 200,
    url: firstResult.url || "",
  };
}
