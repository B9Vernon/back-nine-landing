import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { EngineDatabase } from "./database.js";
import { logAudit } from "./audit.js";
import { PROJECT_ROOT, TIMEZONE } from "./config.js";

export function localDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function renderTxtBlock(record: { company: string; email: string; subject: string; body: string }): string {
  return [
    `COMPANY: ${record.company}`,
    `EMAIL: ${record.email}`,
    `EMAIL SUBJECT: ${record.subject}`,
    "EMAIL BODY:",
    record.body,
  ].join("\n");
}

export function exportApprovedTxt(
  database: EngineDatabase,
  options: { limit: number; includeNoEmail: boolean; outputPath?: string },
): { path: string; exported: number } {
  const contactClause = options.includeNoEmail ? "" : "AND c.contact_type IN ('email', 'contact_form')";
  const rows = database.prepare(`
    SELECT c.id, c.canonical_name AS company, c.contact_type, c.contact_value,
      e.subject, e.body FROM companies c JOIN generated_emails e ON e.company_id = c.id
    WHERE c.review_status = 'approved' ${contactClause}
    ORDER BY c.distance_km, c.id LIMIT ?
  `).all(options.limit) as Array<{ id: number; company: string; contact_type: string; contact_value: string; subject: string; body: string }>;
  if (rows.length === 0) {
    throw new Error("No approved generated emails are ready. Approve companies and run generate:emails first.");
  }
  const records = rows.map((row) => ({
    company: row.company,
    email: row.contact_type === "email" ? row.contact_value : row.contact_type === "contact_form" ? `Contact form: ${row.contact_value}` : "No public contact found",
    subject: row.subject,
    body: row.body,
  }));
  const outputPath = options.outputPath
    ? resolve(PROJECT_ROOT, options.outputPath)
    : resolve(PROJECT_ROOT, "data/output", `b9-hiring-signal-emails-${localDateString()}.txt`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${records.map(renderTxtBlock).join("\n\n")}\n`, "utf8");
  for (const row of rows) logAudit(database, "txt_export", "company", row.id, outputPath, "exported", {});
  return { path: outputPath, exported: rows.length };
}
