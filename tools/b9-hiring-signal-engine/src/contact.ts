import * as cheerio from "cheerio";
import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { cleanText } from "./normalize.js";
import { collectPublicSitePages } from "./research.js";
import type { SitePage } from "./research.js";
import type { SafeWebClient } from "./web.js";

export interface PublicContactCandidate {
  type: "email" | "contact_form" | "phone";
  value: string;
  source: string;
  priority: number;
}

function emailPriority(email: string): number {
  const local = email.split("@")[0]?.toLowerCase() || "";
  if (/owner|generalmanager|general\.manager|^gm$/.test(local)) return 10;
  if (/hr|people|careers|jobs|talent/.test(local)) return 20;
  if (/sales|marketing/.test(local)) return 30;
  if (/events|partnerships/.test(local)) return 40;
  if (/info|contact|hello|office|admin|reception/.test(local)) return 50;
  return 80;
}

export function isValidPublicEmail(value: string): boolean {
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(value.trim());
}

export function extractPublicContacts(pages: SitePage[]): PublicContactCandidate[] {
  const candidates: PublicContactCandidate[] = [];
  for (const page of pages) {
    const $ = cheerio.load(page.html);
    $("a[href^='mailto:']").each((_, element) => {
      const value = decodeURIComponent(($(element).attr("href") || "").replace(/^mailto:/i, "").split("?")[0] || "").trim().toLowerCase();
      if (isValidPublicEmail(value)) candidates.push({ type: "email", value, source: page.url, priority: emailPriority(value) });
    });
    const plainEmails = page.text.match(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
    for (const value of plainEmails.map((email) => email.toLowerCase())) {
      if (isValidPublicEmail(value)) candidates.push({ type: "email", value, source: page.url, priority: emailPriority(value) });
    }
    $("form").each((_, element) => {
      const action = $(element).attr("action") || page.url;
      try {
        const value = new URL(action, page.url).toString();
        if (/contact|inquir|message/i.test(`${value} ${$(element).text()}`)) candidates.push({ type: "contact_form", value, source: page.url, priority: 100 });
      } catch {
        // Ignore malformed form actions.
      }
    });
    const phone = page.text.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)?.[0];
    if (phone) candidates.push({ type: "phone", value: cleanText(phone), source: page.url, priority: 200 });
  }
  const seen = new Set<string>();
  return candidates
    .sort((a, b) => a.priority - b.priority)
    .filter((candidate) => {
      const key = `${candidate.type}:${candidate.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function discoverContacts(
  database: EngineDatabase,
  options: { live: boolean; limit: number; client?: SafeWebClient },
): Promise<{ foundEmail: number; foundForm: number; phoneOnly: number; missing: number; errors: number }> {
  const companies = database.prepare(`
    SELECT id, canonical_name, website FROM companies
    WHERE status <> 'rejected'
    ORDER BY distance_km, id LIMIT ?
  `).all(options.limit) as Array<{ id: number; canonical_name: string; website: string }>;
  const importedContact = database.prepare(`
    SELECT public_email, contact_url, phone, source_url, source_file FROM jobs j
    JOIN company_jobs cj ON cj.job_id = j.id WHERE cj.company_id = ? AND j.accepted = 1
    ORDER BY CASE WHEN public_email <> '' THEN 0 WHEN contact_url <> '' THEN 1 ELSE 2 END, j.id
  `);
  const update = database.prepare(`
    UPDATE companies SET contact_type = ?, contact_value = ?, contact_source = ?,
      status = ?, updated_at = ? WHERE id = ?
  `);
  let foundEmail = 0;
  let foundForm = 0;
  let phoneOnly = 0;
  let missing = 0;
  let errors = 0;

  for (const company of companies) {
    const imported = importedContact.all(company.id) as Array<{ public_email: string; contact_url: string; phone: string; source_url: string; source_file: string }>;
    const evidence = imported.find((row) => isValidPublicEmail(row.public_email));
    if (evidence) {
      update.run("email", evidence.public_email.toLowerCase(), evidence.source_url || evidence.source_file, "contact_found", nowIso(), company.id);
      foundEmail += 1;
      logAudit(database, "contact_discovery", "company", company.id, evidence.source_url || evidence.source_file, "accepted", { type: "public_business_email", value: evidence.public_email });
      continue;
    }
    const formEvidence = imported.find((row) => /^https?:\/\//i.test(row.contact_url));
    if (formEvidence) {
      update.run("contact_form", formEvidence.contact_url, formEvidence.source_url || formEvidence.source_file, "contact_found", nowIso(), company.id);
      foundForm += 1;
      logAudit(database, "contact_discovery", "company", company.id, formEvidence.source_url || formEvidence.source_file, "accepted", { type: "contact_form", value: formEvidence.contact_url });
      continue;
    }
    if (options.live && options.client && company.website) {
      try {
        const pages = await collectPublicSitePages(company.website, options.client);
        const contacts = extractPublicContacts(pages);
        const best = contacts.find((contact) => contact.type !== "phone") || contacts[0];
        if (best?.type === "email") {
          update.run("email", best.value, best.source, "contact_found", nowIso(), company.id);
          foundEmail += 1;
        } else if (best?.type === "contact_form") {
          update.run("contact_form", best.value, best.source, "contact_found", nowIso(), company.id);
          foundForm += 1;
        } else if (best?.type === "phone") {
          update.run("phone", best.value, best.source, "phone_only", nowIso(), company.id);
          phoneOnly += 1;
        } else {
          update.run("", "", "", "contact_missing", nowIso(), company.id);
          missing += 1;
        }
        logAudit(database, "contact_discovery", "company", company.id, company.website, best ? "accepted" : "missing", best ? { type: best.type, value: best.value, evidence: best.source } : {});
      } catch (error) {
        errors += 1;
        update.run("", "", "", "contact_missing", nowIso(), company.id);
        logAudit(database, "contact_discovery", "company", company.id, company.website, "uncertain", { error: String(error) });
      }
      continue;
    }
    const phoneEvidence = imported.find((row) => row.phone);
    if (phoneEvidence) {
      update.run("phone", phoneEvidence.phone, phoneEvidence.source_url || phoneEvidence.source_file, "phone_only", nowIso(), company.id);
      phoneOnly += 1;
    } else {
      update.run("", "", "", "contact_missing", nowIso(), company.id);
      missing += 1;
    }
    logAudit(database, "contact_discovery", "company", company.id, company.website || "manual-import", "missing", { networkUsed: false });
  }
  return { foundEmail, foundForm, phoneOnly, missing, errors };
}
