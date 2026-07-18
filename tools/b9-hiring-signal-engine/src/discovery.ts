import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { evaluateLocation } from "./location.js";
import { matchOffers } from "./offers.js";
import type { JobCategory, LocationSettings, NormalizedJobSignal, SignalType } from "./types.js";

interface JobRow {
  id: number;
  fingerprint: string;
  company_name: string;
  normalized_company: string;
  job_title: string;
  job_location: string;
  city: string;
  postal_code: string;
  source: string;
  source_url: string;
  posting_date: string;
  category: JobCategory;
  signal_types: string;
  raw_text: string;
  website: string;
  company_description: string;
  public_email: string;
  contact_url: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  location_uncertain: number;
}

function rowToJob(row: JobRow): NormalizedJobSignal {
  return {
    companyName: row.company_name,
    normalizedCompany: row.normalized_company,
    jobTitle: row.job_title,
    jobLocation: row.job_location,
    city: row.city,
    postalCode: row.postal_code,
    source: row.source,
    sourceUrl: row.source_url,
    postingDate: row.posting_date,
    category: row.category,
    signalTypes: JSON.parse(row.signal_types) as SignalType[],
    rawText: row.raw_text,
    website: row.website,
    companyDescription: row.company_description,
    publicEmail: row.public_email,
    contactUrl: row.contact_url,
    phone: row.phone,
    address: row.address,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    fingerprint: row.fingerprint,
  };
}

export function applyHiringFilters(database: EngineDatabase, settings: LocationSettings): {
  accepted: number;
  rejected: number;
  uncertain: number;
} {
  const rows = database.prepare("SELECT * FROM jobs ORDER BY imported_at, id").all() as unknown as JobRow[];
  const updateJob = database.prepare(`
    UPDATE jobs SET city = CASE WHEN city = '' THEN ? ELSE city END,
      distance_km = ?, location_uncertain = ?, accepted = ?, rejection_reason = ?
    WHERE id = ?
  `);
  let accepted = 0;
  let rejected = 0;
  let uncertain = 0;
  for (const row of rows) {
    const decision = evaluateLocation(rowToJob(row), settings);
    updateJob.run(
      decision.city,
      decision.distanceKm ?? null,
      decision.uncertain ? 1 : 0,
      decision.accepted ? 1 : 0,
      decision.accepted ? "" : decision.reason,
      row.id,
    );
    accepted += decision.accepted ? 1 : 0;
    rejected += decision.accepted ? 0 : 1;
    uncertain += decision.uncertain ? 1 : 0;
    logAudit(database, "distance_filter", "job", row.id, row.source, decision.accepted ? "accepted" : "rejected", {
      originPostalCode: "V1T 5B9",
      distanceKm: decision.distanceKm,
      uncertain: decision.uncertain,
      reason: decision.reason,
    });
  }

  const companies = database.prepare("SELECT id FROM companies ORDER BY id").all() as Array<{ id: number }>;
  const acceptedJobs = database.prepare(`
    SELECT j.* FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
    WHERE cj.company_id = ? AND j.accepted = 1
    ORDER BY j.distance_km, j.posting_date DESC, j.id
  `);
  const updateCompany = database.prepare(`
    UPDATE companies SET city = ?, distance_km = ?, location_uncertain = ?, category = ?,
      classification = ?, offers = ?, status = ?, rejection_reason = ?, updated_at = ?
    WHERE id = ?
  `);
  const rejectionQuery = database.prepare(`
    SELECT j.rejection_reason FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
    WHERE cj.company_id = ? ORDER BY j.id LIMIT 1
  `);
  for (const company of companies) {
    const jobs = acceptedJobs.all(company.id) as unknown as JobRow[];
    if (jobs.length === 0) {
      const rejection = rejectionQuery.get(company.id) as { rejection_reason?: string } | undefined;
      updateCompany.run("", null, 1, "other", "[]", "[]", "rejected", rejection?.rejection_reason || "No accepted hiring signal.", nowIso(), company.id);
      continue;
    }
    const lead = jobs[0]!;
    const signals = new Set<SignalType>();
    for (const job of jobs) {
      for (const signal of JSON.parse(job.signal_types) as SignalType[]) signals.add(signal);
    }
    if (jobs.length > 1) signals.add("growth");
    updateCompany.run(
      lead.city,
      lead.distance_km,
      lead.location_uncertain,
      lead.category,
      JSON.stringify([...signals]),
      JSON.stringify(matchOffers(lead.category, jobs.length > 1)),
      "accepted",
      "",
      nowIso(),
      company.id,
    );
  }
  return { accepted, rejected, uncertain };
}

export function listHiringSignals(database: EngineDatabase, limit = 25): Array<Record<string, unknown>> {
  return database.prepare(`
    SELECT c.id AS company_id, c.canonical_name AS company, j.job_title, j.city,
      ROUND(j.distance_km, 1) AS distance_km, j.category, j.source,
      j.multiple_active, j.location_uncertain
    FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id JOIN companies c ON c.id = cj.company_id
    WHERE j.accepted = 1
    ORDER BY j.distance_km, j.multiple_active DESC, j.posting_date DESC, j.id
    LIMIT ?
  `).all(limit) as Array<Record<string, unknown>>;
}
