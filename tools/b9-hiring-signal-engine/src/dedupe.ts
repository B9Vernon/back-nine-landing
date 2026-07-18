import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { normalizeCompanyName } from "./normalize.js";

interface CompanyRow {
  id: number;
  canonical_name: string;
  normalized_name: string;
  website: string;
  domain: string;
  city: string;
  postal_code: string;
  address: string;
  phone: string;
  description: string;
  research_summary: string;
  research_sources: string;
  distance_km: number | null;
  location_uncertain: number;
  category: string;
  classification: string;
  offers: string;
  contact_type: string;
  contact_value: string;
  contact_source: string;
  status: string;
  rejection_reason: string;
  review_status: string;
}

function normalizedPhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

function normalizedAddress(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function levenshtein(a: string, b: string): number {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        (current[j - 1] ?? 0) + 1,
        (previous[j] ?? 0) + 1,
        (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length] ?? 0;
}

export function companyNameSimilarity(a: string, b: string): number {
  const left = normalizeCompanyName(a);
  const right = normalizeCompanyName(b);
  if (!left && !right) return 1;
  const editScore = 1 - levenshtein(left, right) / Math.max(left.length, right.length, 1);
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  const tokenScore = union ? intersection / union : 0;
  return Math.max(editScore, tokenScore);
}

export function duplicateReason(a: CompanyRow, b: CompanyRow): string {
  if (a.domain && b.domain && a.domain === b.domain) return "same domain";
  if (a.contact_type === "email" && a.contact_value && a.contact_value === b.contact_value) return "same public email";
  if (a.contact_type === "contact_form" && a.contact_value && a.contact_value === b.contact_value) return "same contact form";
  if (normalizedPhone(a.phone).length === 10 && normalizedPhone(a.phone) === normalizedPhone(b.phone)) return "same phone";
  if (normalizedAddress(a.address).length >= 8 && normalizedAddress(a.address) === normalizedAddress(b.address)) return "same address";
  const similarity = companyNameSimilarity(a.canonical_name, b.canonical_name);
  if (similarity >= 0.9) return "similar company name";
  return "";
}

function completeness(row: CompanyRow): number {
  return [row.website, row.domain, row.address, row.phone, row.description, row.research_summary, row.contact_value]
    .filter(Boolean).length + (row.status === "contact_found" ? 3 : 0);
}

function mergeValues(primary: CompanyRow, secondary: CompanyRow): CompanyRow {
  const choose = (a: string, b: string) => a || b;
  return {
    ...primary,
    website: choose(primary.website, secondary.website),
    domain: choose(primary.domain, secondary.domain),
    city: choose(primary.city, secondary.city),
    postal_code: choose(primary.postal_code, secondary.postal_code),
    address: choose(primary.address, secondary.address),
    phone: choose(primary.phone, secondary.phone),
    description: choose(primary.description, secondary.description),
    research_summary: choose(primary.research_summary, secondary.research_summary),
    research_sources: primary.research_sources !== "[]" ? primary.research_sources : secondary.research_sources,
    distance_km: primary.distance_km ?? secondary.distance_km,
    location_uncertain: Math.min(primary.location_uncertain, secondary.location_uncertain),
    category: primary.category !== "other" ? primary.category : secondary.category,
    classification: primary.classification !== "[]" ? primary.classification : secondary.classification,
    offers: primary.offers !== "[]" ? primary.offers : secondary.offers,
    contact_type: choose(primary.contact_type, secondary.contact_type),
    contact_value: choose(primary.contact_value, secondary.contact_value),
    contact_source: choose(primary.contact_source, secondary.contact_source),
    status: primary.status === "contact_found" || secondary.status === "contact_found" ? "contact_found" : primary.status,
    rejection_reason: primary.status !== "rejected" ? "" : secondary.rejection_reason || primary.rejection_reason,
    review_status: primary.review_status === "approved" || secondary.review_status === "approved" ? "approved" : primary.review_status,
  };
}

export function deduplicateCompanies(database: EngineDatabase): { merged: number; remaining: number } {
  const rows = database.prepare("SELECT * FROM companies ORDER BY id").all() as unknown as CompanyRow[];
  const active = new Map(rows.map((row) => [row.id, row]));
  const updateCompany = database.prepare(`
    UPDATE companies SET website = ?, domain = ?, city = ?, postal_code = ?, address = ?, phone = ?,
      description = ?, research_summary = ?, research_sources = ?, distance_km = ?, location_uncertain = ?,
      category = ?, classification = ?, offers = ?, contact_type = ?, contact_value = ?, contact_source = ?,
      status = ?, rejection_reason = ?, review_status = ?, updated_at = ? WHERE id = ?
  `);
  const moveJobs = database.prepare("UPDATE OR IGNORE company_jobs SET company_id = ? WHERE company_id = ?");
  const deleteLinks = database.prepare("DELETE FROM company_jobs WHERE company_id = ?");
  const deleteEmail = database.prepare("DELETE FROM generated_emails WHERE company_id = ?");
  const deleteCompany = database.prepare("DELETE FROM companies WHERE id = ?");
  let merged = 0;

  database.exec("BEGIN");
  try {
    const ids = [...active.keys()];
    for (let leftIndex = 0; leftIndex < ids.length; leftIndex += 1) {
      const leftId = ids[leftIndex]!;
      const left = active.get(leftId);
      if (!left) continue;
      for (let rightIndex = leftIndex + 1; rightIndex < ids.length; rightIndex += 1) {
        const rightId = ids[rightIndex]!;
        const right = active.get(rightId);
        if (!right) continue;
        const reason = duplicateReason(left, right);
        if (!reason) continue;
        const [primary, duplicate] = completeness(left) >= completeness(right) ? [left, right] : [right, left];
        const combined = mergeValues(primary, duplicate);
        updateCompany.run(
          combined.website, combined.domain, combined.city, combined.postal_code, combined.address,
          combined.phone, combined.description, combined.research_summary, combined.research_sources,
          combined.distance_km, combined.location_uncertain, combined.category, combined.classification,
          combined.offers, combined.contact_type, combined.contact_value, combined.contact_source,
          combined.status, combined.rejection_reason, combined.review_status, nowIso(), primary.id,
        );
        moveJobs.run(primary.id, duplicate.id);
        deleteLinks.run(duplicate.id);
        deleteEmail.run(duplicate.id);
        logAudit(database, "deduplicate", "company", duplicate.id, reason, "merged", { canonicalCompanyId: primary.id, reason });
        deleteCompany.run(duplicate.id);
        active.set(primary.id, combined);
        active.delete(duplicate.id);
        merged += 1;
        if (duplicate.id === leftId) break;
      }
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  const remaining = (database.prepare("SELECT COUNT(*) AS count FROM companies").get() as { count: number }).count;
  return { merged, remaining };
}
