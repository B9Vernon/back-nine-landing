import { recordToJob } from "./ingestion.js";
import type { JobSignalInput } from "./types.js";
import type { SafeWebClient } from "./web.js";

export async function discoverFromApprovedSearchApi(query: string, client: SafeWebClient): Promise<JobSignalInput[]> {
  const endpoint = process.env.B9_SEARCH_API_URL?.trim();
  if (!endpoint) throw new Error("B9_SEARCH_API_URL is not configured. Import search-result HTML/CSV/JSON instead.");
  const url = new URL(endpoint);
  url.searchParams.set("q", query);
  const headers: Record<string, string> = {};
  if (process.env.B9_SEARCH_API_KEY) headers.authorization = `Bearer ${process.env.B9_SEARCH_API_KEY}`;
  const response = await client.fetchJson(url.toString(), headers);
  const object = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const records = (Array.isArray(response) ? response : object.jobs ?? object.results ?? object.items ?? []) as Record<string, unknown>[];
  return records
    .map((record) => recordToJob({
      ...record,
      company: record.company ?? record.companyName ?? record.employer,
      job_title: record.job_title ?? record.jobTitle ?? record.title,
      source_url: record.source_url ?? record.url ?? record.link,
      description: record.description ?? record.snippet,
      source: record.source ?? "search-results",
    }))
    .filter((job) => job.companyName && job.jobTitle);
}
