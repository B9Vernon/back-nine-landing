import { readFileSync } from "node:fs";
import { extname, basename } from "node:path";
import * as cheerio from "cheerio";
import { parse as parseCsv } from "csv-parse/sync";
import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { identifySource } from "./adapters.js";
import { logAudit } from "./audit.js";
import { cleanText, domainFromUrl, normalizeCompanyName, normalizeJobSignal } from "./normalize.js";
import type { JobSignalInput, NormalizedJobSignal } from "./types.js";

type FetchPage = (url: string) => Promise<{ url: string; html: string }>;

const FIELD_ALIASES: Record<string, string[]> = {
  companyName: ["company", "company_name", "companyname", "employer", "organization", "hiring_organization"],
  jobTitle: ["job_title", "jobtitle", "title", "role", "position"],
  jobLocation: ["job_location", "joblocation", "location", "work_location"],
  city: ["city", "locality"],
  postalCode: ["postal_code", "postalcode", "postcode", "zip"],
  source: ["source", "job_source", "platform"],
  sourceUrl: ["source_url", "sourceurl", "job_url", "joburl", "posting_url", "url"],
  postingDate: ["posting_date", "postingdate", "date_posted", "dateposted", "date"],
  rawText: ["raw_text", "rawtext", "description", "job_description", "snippet"],
  website: ["website", "company_website", "companywebsite", "official_website"],
  companyDescription: ["company_description", "companydescription", "about", "business_description"],
  publicEmail: ["public_email", "publicemail", "business_email", "email"],
  contactUrl: ["contact_url", "contacturl", "contact_form", "contactform"],
  phone: ["phone", "business_phone"],
  address: ["address", "street_address"],
  latitude: ["latitude", "lat"],
  longitude: ["longitude", "lon", "lng"],
};

function canonicalKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function field(record: Record<string, unknown>, name: keyof JobSignalInput): unknown {
  const entries = new Map(Object.entries(record).map(([key, value]) => [canonicalKey(key), value]));
  return FIELD_ALIASES[name]?.map(canonicalKey).map((alias) => entries.get(alias)).find((value) => value !== undefined);
}

function numberField(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function recordToJob(record: Record<string, unknown>): JobSignalInput {
  const sourceUrl = cleanText(field(record, "sourceUrl"));
  return {
    companyName: cleanText(field(record, "companyName")),
    jobTitle: cleanText(field(record, "jobTitle")) || "Operations hiring signal",
    jobLocation: cleanText(field(record, "jobLocation")),
    city: cleanText(field(record, "city")),
    postalCode: cleanText(field(record, "postalCode")),
    source: identifySource(sourceUrl, cleanText(field(record, "source"))),
    sourceUrl,
    postingDate: cleanText(field(record, "postingDate")),
    rawText: cleanText(field(record, "rawText")),
    website: cleanText(field(record, "website")),
    companyDescription: cleanText(field(record, "companyDescription")),
    publicEmail: cleanText(field(record, "publicEmail")),
    contactUrl: cleanText(field(record, "contactUrl")),
    phone: cleanText(field(record, "phone")),
    address: cleanText(field(record, "address")),
    latitude: numberField(field(record, "latitude")),
    longitude: numberField(field(record, "longitude")),
  };
}

export function parseCsvJobs(content: string): JobSignalInput[] {
  const records = parseCsv(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true }) as Record<string, unknown>[];
  return records.map(recordToJob);
}

export function parseJsonJobs(content: string): JobSignalInput[] {
  const parsed: unknown = JSON.parse(content);
  const records = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { jobs?: unknown[] }).jobs)
      ? (parsed as { jobs: Record<string, unknown>[] }).jobs
      : [parsed];
  return (records as Record<string, unknown>[]).map(recordToJob);
}

function flattenJsonLd(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  return [object, ...flattenJsonLd(object["@graph"]), ...flattenJsonLd(object.itemListElement)];
}

function textFromHtml(value: unknown): string {
  return cleanText(cheerio.load(String(value ?? "")).text());
}

export function parseHtmlJobs(content: string, pageUrl = ""): JobSignalInput[] {
  const $ = cheerio.load(content);
  const jobs: JobSignalInput[] = [];
  $("script[type='application/ld+json']").each((_, element) => {
    try {
      const parsed = JSON.parse($(element).text()) as unknown;
      for (const item of flattenJsonLd(parsed)) {
        const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
        if (!types.some((type) => String(type).toLowerCase() === "jobposting")) continue;
        const organization = (item.hiringOrganization ?? {}) as Record<string, unknown>;
        const locations = Array.isArray(item.jobLocation) ? item.jobLocation : [item.jobLocation];
        const location = ((locations[0] ?? {}) as Record<string, unknown>).address as Record<string, unknown> | undefined;
        jobs.push({
          companyName: cleanText(organization.name),
          jobTitle: cleanText(item.title),
          jobLocation: cleanText([location?.addressLocality, location?.addressRegion].filter(Boolean).join(", ")),
          city: cleanText(location?.addressLocality),
          postalCode: cleanText(location?.postalCode),
          source: identifySource(pageUrl),
          sourceUrl: cleanText(item.url) || pageUrl,
          postingDate: cleanText(item.datePosted),
          rawText: textFromHtml(item.description),
          website: cleanText(organization.sameAs || organization.url),
        });
      }
    } catch {
      // A malformed JSON-LD block does not prevent safe fallback parsing.
    }
  });

  if (jobs.length > 0) return jobs;
  $("[data-job], .job-card, .job, article.job, li.job").each((_, element) => {
    const node = $(element);
    const title = cleanText(node.find("[data-job-title], .job-title, h2, h3").first().text());
    const companyName = cleanText(node.find("[data-company], .company, .employer").first().text());
    if (!title || !companyName) return;
    const link = node.find("a[href]").first().attr("href") || pageUrl;
    let resolvedLink = link;
    try {
      resolvedLink = new URL(link, pageUrl || "https://example.invalid").toString();
    } catch {
      resolvedLink = pageUrl;
    }
    jobs.push({
      companyName,
      jobTitle: title,
      jobLocation: cleanText(node.find("[data-location], .location").first().text()),
      source: identifySource(pageUrl),
      sourceUrl: resolvedLink,
      rawText: cleanText(node.text()),
    });
  });
  return jobs;
}

export function parseCopiedText(content: string): JobSignalInput[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.every((line) => /^https?:\/\//i.test(line))) return [];

  const blocks = trimmed.split(/\r?\n\s*\r?\n/).map((block) => block.trim()).filter(Boolean);
  const keyed = blocks.filter((block) => /^(company|employer)\s*:/im.test(block));
  if (keyed.length > 0) {
    return keyed.map((block) => {
      const record: Record<string, string> = {};
      for (const line of block.split(/\r?\n/)) {
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (match?.[1]) record[match[1]] = match[2] || "";
      }
      return recordToJob(record);
    });
  }

  return lines
    .filter((line) => !line.startsWith("#"))
    .map((companyName) => ({ companyName, jobTitle: "Operations hiring signal", source: "manual-company-list" }));
}

export async function parseJobFile(path: string, fetchPage?: FetchPage): Promise<JobSignalInput[]> {
  const content = readFileSync(path, "utf8");
  const extension = extname(path).toLowerCase();
  if (extension === ".csv" || extension === ".tsv") return parseCsvJobs(content);
  if (extension === ".json") return parseJsonJobs(content);
  if (extension === ".html" || extension === ".htm") return parseHtmlJobs(content);
  if (extension === ".txt") {
    const urls = content.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^https?:\/\//i.test(line));
    if (urls.length > 0 && urls.length === content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length) {
      if (!fetchPage) throw new Error("A job-URL list requires --live, or import saved HTML instead.");
      const pages = await Promise.all(urls.map((url) => fetchPage(url)));
      return pages.flatMap((page) => parseHtmlJobs(page.html, page.url));
    }
    return parseCopiedText(content);
  }
  throw new Error(`Unsupported input format: ${extension || "unknown"}`);
}

export function importSignals(
  database: EngineDatabase,
  inputs: JobSignalInput[],
  sourceFile = "manual",
): { imported: number; duplicates: number; invalid: number } {
  const insertJob = database.prepare(`
    INSERT OR IGNORE INTO jobs (
      fingerprint, company_name, normalized_company, job_title, job_location, city, postal_code,
      source, source_url, posting_date, category, signal_types, raw_text, website,
      company_description, public_email, contact_url, phone, address, latitude, longitude,
      imported_at, source_file
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const upsertCompany = database.prepare(`
    INSERT INTO companies (
      canonical_name, normalized_name, website, domain, city, postal_code, address, phone,
      description, category, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(normalized_name) DO UPDATE SET
      website = CASE WHEN companies.website = '' THEN excluded.website ELSE companies.website END,
      domain = CASE WHEN companies.domain = '' THEN excluded.domain ELSE companies.domain END,
      city = CASE WHEN companies.city = '' THEN excluded.city ELSE companies.city END,
      postal_code = CASE WHEN companies.postal_code = '' THEN excluded.postal_code ELSE companies.postal_code END,
      address = CASE WHEN companies.address = '' THEN excluded.address ELSE companies.address END,
      phone = CASE WHEN companies.phone = '' THEN excluded.phone ELSE companies.phone END,
      description = CASE WHEN companies.description = '' THEN excluded.description ELSE companies.description END,
      category = CASE WHEN companies.category = 'other' THEN excluded.category ELSE companies.category END,
      updated_at = excluded.updated_at
  `);
  const link = database.prepare("INSERT OR IGNORE INTO company_jobs (company_id, job_id) VALUES (?, ?)");
  const companyIdQuery = database.prepare("SELECT id FROM companies WHERE normalized_name = ?");
  const jobIdQuery = database.prepare("SELECT id FROM jobs WHERE fingerprint = ?");

  let imported = 0;
  let duplicates = 0;
  let invalid = 0;
  database.exec("BEGIN");
  try {
    for (const input of inputs) {
      let job: NormalizedJobSignal;
      try {
        job = normalizeJobSignal(input);
      } catch (error) {
        invalid += 1;
        logAudit(database, "import", "job", "", sourceFile, "rejected", { error: String(error) });
        continue;
      }
      const now = nowIso();
      const result = insertJob.run(
        job.fingerprint, job.companyName, job.normalizedCompany, job.jobTitle, job.jobLocation,
        job.city, job.postalCode, job.source, job.sourceUrl, job.postingDate, job.category,
        JSON.stringify(job.signalTypes), job.rawText, job.website, job.companyDescription,
        job.publicEmail, job.contactUrl, job.phone, job.address, job.latitude ?? null,
        job.longitude ?? null, now, sourceFile,
      );
      if (Number(result.changes) === 0) duplicates += 1;
      else imported += 1;

      upsertCompany.run(
        job.companyName, job.normalizedCompany, job.website, domainFromUrl(job.website), job.city,
        job.postalCode, job.address, job.phone, job.companyDescription, job.category, now, now,
      );
      const companyRow = companyIdQuery.get(job.normalizedCompany) as { id: number };
      const jobRow = jobIdQuery.get(job.fingerprint) as { id: number };
      link.run(companyRow.id, jobRow.id);
      logAudit(database, "import", "job", jobRow.id, job.source, Number(result.changes) ? "accepted" : "duplicate", {
        sourceFile: basename(sourceFile),
        sourceUrl: job.sourceUrl,
      });
    }
    database.exec(`
      UPDATE jobs SET multiple_active = CASE WHEN (
        SELECT COUNT(*) FROM jobs other WHERE other.normalized_company = jobs.normalized_company
      ) > 1 THEN 1 ELSE 0 END
    `);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return { imported, duplicates, invalid };
}

export function applyWebsiteMap(database: EngineDatabase, content: string): number {
  const records = parseCsv(content, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, unknown>[];
  const update = database.prepare("UPDATE companies SET website = ?, domain = ?, updated_at = ? WHERE normalized_name = ?");
  let changed = 0;
  for (const record of records) {
    const company = cleanText(record.company ?? record.company_name);
    const website = cleanText(record.website ?? record.company_website);
    if (!company || !website) continue;
    changed += Number(update.run(website, domainFromUrl(website), nowIso(), normalizeCompanyName(company)).changes);
  }
  return changed;
}
