import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { normalizeCompanyName } from "./normalize.js";

export function listForReview(database: EngineDatabase, limit = 100): Array<Record<string, unknown>> {
  return database.prepare(`
    SELECT c.id, c.canonical_name AS company, c.city, ROUND(c.distance_km, 1) AS distance_km,
      c.category, c.status, c.contact_type, c.contact_value, c.review_status,
      (SELECT GROUP_CONCAT(j.job_title, ' | ') FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
       WHERE cj.company_id = c.id AND j.accepted = 1) AS hiring_signals
    FROM companies c WHERE c.status <> 'rejected'
    ORDER BY c.distance_km, c.id LIMIT ?
  `).all(limit) as Array<Record<string, unknown>>;
}

export function approveCompanies(
  database: EngineDatabase,
  options: { all?: boolean; selector?: string; includeNoEmail?: boolean },
): { approved: number; skipped: number } {
  const rows = options.all
    ? database.prepare("SELECT id, canonical_name, contact_type, contact_value, status FROM companies WHERE status <> 'rejected'").all()
    : /^\d+$/.test(options.selector || "")
      ? database.prepare("SELECT id, canonical_name, contact_type, contact_value, status FROM companies WHERE id = ?").all(Number(options.selector))
      : database.prepare("SELECT id, canonical_name, contact_type, contact_value, status FROM companies WHERE normalized_name = ?").all(normalizeCompanyName(options.selector || ""));
  let approved = 0;
  let skipped = 0;
  const update = database.prepare("UPDATE companies SET review_status = 'approved', updated_at = ? WHERE id = ?");
  for (const raw of rows as Array<Record<string, unknown>>) {
    const hasExportableContact = raw.contact_type === "email" || raw.contact_type === "contact_form";
    if (!hasExportableContact && !options.includeNoEmail) {
      skipped += 1;
      continue;
    }
    const companyId = Number(raw.id);
    update.run(nowIso(), companyId);
    logAudit(database, "manual_review", "company", companyId, "operator", "approved", { includeNoEmail: Boolean(options.includeNoEmail) });
    approved += 1;
  }
  return { approved, skipped };
}

export function rejectCompanies(database: EngineDatabase, selector: string, reason: string): number {
  const rows = /^\d+$/.test(selector)
    ? database.prepare("SELECT id FROM companies WHERE id = ?").all(Number(selector))
    : database.prepare("SELECT id FROM companies WHERE normalized_name = ?").all(normalizeCompanyName(selector));
  const update = database.prepare("UPDATE companies SET review_status = 'rejected', rejection_reason = ?, updated_at = ? WHERE id = ?");
  for (const row of rows as Array<{ id: number }>) {
    update.run(reason, nowIso(), row.id);
    logAudit(database, "manual_review", "company", row.id, "operator", "rejected", { reason });
  }
  return rows.length;
}
