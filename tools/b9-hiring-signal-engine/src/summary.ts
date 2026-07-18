import type { EngineDatabase } from "./database.js";

function count(database: EngineDatabase, sql: string): number {
  return Number((database.prepare(sql).get() as { count: number }).count);
}

export function getRunSummary(database: EngineDatabase): Record<string, number> {
  return {
    totalJobs: count(database, "SELECT COUNT(*) AS count FROM jobs"),
    acceptedJobs: count(database, "SELECT COUNT(*) AS count FROM jobs WHERE accepted = 1"),
    rejectedJobs: count(database, "SELECT COUNT(*) AS count FROM jobs WHERE accepted = 0"),
    companies: count(database, "SELECT COUNT(*) AS count FROM companies"),
    acceptedCompanies: count(database, "SELECT COUNT(*) AS count FROM companies WHERE status <> 'rejected'"),
    publicEmails: count(database, "SELECT COUNT(*) AS count FROM companies WHERE contact_type = 'email'"),
    contactForms: count(database, "SELECT COUNT(*) AS count FROM companies WHERE contact_type = 'contact_form'"),
    approvedCompanies: count(database, "SELECT COUNT(*) AS count FROM companies WHERE review_status = 'approved'"),
    generatedEmails: count(database, "SELECT COUNT(*) AS count FROM generated_emails"),
    auditEvents: count(database, "SELECT COUNT(*) AS count FROM audit_log"),
  };
}
