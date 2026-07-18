#!/usr/bin/env node
import { existsSync, rmSync } from "node:fs";
import { resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { SOURCE_ADAPTERS } from "./adapters.js";
import { exportAuditLog } from "./audit.js";
import { PROJECT_ROOT, DEFAULT_RADIUS_KM } from "./config.js";
import { openDatabase, resolveDatabasePath } from "./database.js";
import { deduplicateCompanies } from "./dedupe.js";
import { applyHiringFilters, listHiringSignals } from "./discovery.js";
import { generateApprovedEmails } from "./email.js";
import { exportApprovedTxt } from "./export.js";
import { importSignals, parseJobFile } from "./ingestion.js";
import { discoverContacts } from "./contact.js";
import { approveCompanies, listForReview, rejectCompanies } from "./review.js";
import { loadWebsiteMap, researchCompanies } from "./research.js";
import { discoverFromApprovedSearchApi } from "./search.js";
import { getRunSummary } from "./summary.js";
import type { JobCategory, LocationSettings } from "./types.js";
import { SafeWebClient } from "./web.js";

const parsed = parseArgs({
  allowPositionals: true,
  strict: true,
  options: {
    database: { type: "string" },
    radius: { type: "string" },
    limit: { type: "string" },
    categories: { type: "string" },
    sources: { type: "string" },
    live: { type: "boolean", default: false },
    "include-kelowna": { type: "boolean", default: false },
    "include-golf": { type: "boolean", default: false },
    "include-no-email": { type: "boolean", default: false },
    "website-map": { type: "string" },
    query: { type: "string" },
    all: { type: "boolean", default: false },
    reason: { type: "string" },
    output: { type: "string" },
  },
});

const command = parsed.positionals[0] || "help";
const argument = parsed.positionals[1];
const databasePath = resolveDatabasePath(parsed.values.database);
const limit = Math.max(1, Number(parsed.values.limit || 25));
const live = Boolean(parsed.values.live);
const includeNoEmail = Boolean(parsed.values["include-no-email"]);

function splitList(value: string | undefined): string[] | undefined {
  const values = value?.split(",").map((item) => item.trim()).filter(Boolean);
  return values?.length ? values : undefined;
}

function locationSettings(): LocationSettings {
  return {
    radiusKm: Math.max(1, Number(parsed.values.radius || DEFAULT_RADIUS_KM)),
    includeKelowna: Boolean(parsed.values["include-kelowna"]),
    includeGolfCourses: Boolean(parsed.values["include-golf"]),
    categories: splitList(parsed.values.categories) as JobCategory[] | undefined,
    sources: splitList(parsed.values.sources),
  };
}

function client(): SafeWebClient {
  if (!live) throw new Error("Network access requires the explicit --live flag.");
  return new SafeWebClient();
}

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function help(): void {
  process.stdout.write(`B9 Hiring Signal Engine\n\n`);
  process.stdout.write(`Commands:\n`);
  process.stdout.write(`  init\n  import:jobs <csv|json|html|txt> [--live]\n  find:hiring [--radius 40] [--limit 25]\n`);
  process.stdout.write(`  research:companies [--website-map map.csv] [--live]\n  find:contacts [--live]\n  dedupe\n`);
  process.stdout.write(`  review:list\n  review:approve <id|company> | --all\n  review:reject <id|company> --reason "..."\n`);
  process.stdout.write(`  generate:emails\n  generate:txt\n  summary\n  audit:export\n  run <input> [--live]\n  demo\n  sources\n`);
  process.stdout.write(`\nTXT export never sends email or creates drafts.\n`);
}

async function execute(): Promise<void> {
  if (command === "help" || command === "--help") return help();
  if (command === "sources") return print(SOURCE_ADAPTERS);
  if (command === "demo") {
    const cacheRoot = resolve(PROJECT_ROOT, "data/cache");
    const resolvedDatabase = resolve(databasePath);
    if (!resolvedDatabase.startsWith(`${cacheRoot}${sep}`)) {
      throw new Error("The demo database must stay inside data/cache/.");
    }
    for (const suffix of ["", "-shm", "-wal"]) rmSync(`${resolvedDatabase}${suffix}`, { force: true });
  }
  const database = openDatabase(databasePath);
  try {
    if (command === "init") {
      return print({ initialized: databasePath });
    }
    if (command === "import:jobs") {
      if (!argument) throw new Error("Usage: import:jobs <csv|json|html|txt> [--live]");
      const path = resolve(PROJECT_ROOT, argument);
      if (!existsSync(path)) throw new Error(`Input file not found: ${path}`);
      const web = live ? client() : undefined;
      const jobs = await parseJobFile(path, web ? (url) => web.fetchPage(url) : undefined);
      return print(importSignals(database, jobs, path));
    }
    if (command === "find:hiring") {
      if (parsed.values.query) {
        if (!live) throw new Error("Search API discovery requires --live.");
        const jobs = await discoverFromApprovedSearchApi(parsed.values.query, client());
        importSignals(database, jobs, "approved-search-api");
      }
      const filtering = applyHiringFilters(database, locationSettings());
      return print({ filtering, signals: listHiringSignals(database, limit) });
    }
    if (command === "research:companies") {
      let websiteMapUpdated = 0;
      if (parsed.values["website-map"]) {
        const mapPath = resolve(PROJECT_ROOT, parsed.values["website-map"]);
        websiteMapUpdated = loadWebsiteMap(database, mapPath);
      }
      const result = await researchCompanies(database, { live, limit, client: live ? client() : undefined });
      return print({ websiteMapUpdated, ...result });
    }
    if (command === "find:contacts") {
      return print(await discoverContacts(database, { live, limit, client: live ? client() : undefined }));
    }
    if (command === "dedupe") return print(deduplicateCompanies(database));
    if (command === "review:list") return print(listForReview(database, limit));
    if (command === "review:approve") {
      if (!parsed.values.all && !argument) throw new Error("Provide a company id/name or --all.");
      return print(approveCompanies(database, { all: parsed.values.all, selector: argument, includeNoEmail }));
    }
    if (command === "review:reject") {
      if (!argument) throw new Error("Provide a company id or name.");
      return print({ rejected: rejectCompanies(database, argument, parsed.values.reason || "Rejected during manual review.") });
    }
    if (command === "generate:emails") return print(generateApprovedEmails(database, { limit, includeNoEmail }));
    if (command === "generate:txt") return print(exportApprovedTxt(database, { limit, includeNoEmail, outputPath: parsed.values.output }));
    if (command === "summary") return print(getRunSummary(database));
    if (command === "audit:export") {
      const output = resolve(PROJECT_ROOT, parsed.values.output || "data/cache/audit-log.jsonl");
      return print({ path: output, events: exportAuditLog(database, output) });
    }
    if (command === "run") {
      if (argument) {
        const inputPath = resolve(PROJECT_ROOT, argument);
        const web = live ? client() : undefined;
        const jobs = await parseJobFile(inputPath, web ? (url) => web.fetchPage(url) : undefined);
        importSignals(database, jobs, inputPath);
      }
      applyHiringFilters(database, locationSettings());
      const research = await researchCompanies(database, { live, limit, client: live ? client() : undefined });
      const contacts = await discoverContacts(database, { live, limit, client: live ? client() : undefined });
      const dedupe = deduplicateCompanies(database);
      return print({ research, contacts, dedupe, summary: getRunSummary(database), next: "Run review:list, review:approve, generate:emails, then the explicit generate:txt command." });
    }
    if (command === "demo") {
      const sample = resolve(PROJECT_ROOT, "data/samples/fake-jobs.csv");
      const jobs = await parseJobFile(sample);
      const imported = importSignals(database, jobs, sample);
      const filtering = applyHiringFilters(database, locationSettings());
      const research = await researchCompanies(database, { live: false, limit });
      const contacts = await discoverContacts(database, { live: false, limit });
      const dedupe = deduplicateCompanies(database);
      const approval = approveCompanies(database, { all: true });
      const emails = generateApprovedEmails(database, { limit, includeNoEmail: false });
      const output = exportApprovedTxt(database, { limit, includeNoEmail: false });
      return print({ imported, filtering, research, contacts, dedupe, approval, emails, output });
    }
    throw new Error(`Unknown command: ${command}`);
  } finally {
    database.close();
  }
}

execute().catch((error) => {
  process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
