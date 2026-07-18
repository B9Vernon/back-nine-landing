import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";
import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { applyWebsiteMap } from "./ingestion.js";
import { cleanText, domainFromUrl, normalizeCompanyName } from "./normalize.js";
import type { SafeWebClient, FetchedPage } from "./web.js";

export interface SitePage extends FetchedPage {
  title: string;
  description: string;
  text: string;
  links: string[];
}

const RESEARCH_LINK = /\b(about|contact|team|services|careers?|locations?|company)\b/i;

export function extractSitePage(page: FetchedPage): SitePage {
  const $ = cheerio.load(page.html);
  $("script, style, noscript, svg").remove();
  const description = cleanText($("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content"));
  const text = cleanText($("main, article, body").first().text()).slice(0, 20_000);
  const links: string[] = [];
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const label = cleanText($(element).text());
    if (!href || !RESEARCH_LINK.test(`${href} ${label}`)) return;
    try {
      links.push(new URL(href, page.url).toString());
    } catch {
      // Ignore malformed links.
    }
  });
  return { ...page, title: cleanText($("title").text()), description, text, links: [...new Set(links)] };
}

export async function collectPublicSitePages(website: string, client: SafeWebClient, limit = 5): Promise<SitePage[]> {
  const home = extractSitePage(await client.fetchPage(website));
  const host = new URL(home.url).hostname.replace(/^www\./, "");
  const links = home.links.filter((link) => new URL(link).hostname.replace(/^www\./, "") === host).slice(0, Math.max(0, limit - 1));
  const pages = [home];
  for (const link of links) {
    try {
      pages.push(extractSitePage(await client.fetchPage(link)));
    } catch {
      // The audit at the company level records partial research; blocked pages are skipped.
    }
  }
  return pages;
}

function summarizePages(company: string, pages: SitePage[], importedDescription: string): string {
  const candidates = [importedDescription, ...pages.flatMap((page) => [page.description, page.text.slice(0, 600)])]
    .map(cleanText)
    .filter(Boolean);
  if (candidates.length === 0) return `${company} has an active local hiring signal; further company detail requires manual research.`;
  return cleanText(candidates.join(" ")).slice(0, 1200);
}

export function loadWebsiteMap(database: EngineDatabase, path: string): number {
  return applyWebsiteMap(database, readFileSync(path, "utf8"));
}

export async function researchCompanies(
  database: EngineDatabase,
  options: { live: boolean; limit: number; client?: SafeWebClient },
): Promise<{ researched: number; importedOnly: number; pending: number; errors: number }> {
  const rows = database.prepare(`
    SELECT c.id, c.canonical_name, c.website, c.description
    FROM companies c WHERE c.status <> 'rejected'
    ORDER BY c.distance_km, c.id LIMIT ?
  `).all(options.limit) as Array<{ id: number; canonical_name: string; website: string; description: string }>;
  const firstJobWebsite = database.prepare(`
    SELECT j.website FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
    WHERE cj.company_id = ? AND j.website <> '' ORDER BY j.id LIMIT 1
  `);
  const update = database.prepare(`
    UPDATE companies SET website = ?, domain = ?, research_summary = ?, research_sources = ?,
      status = ?, updated_at = ? WHERE id = ?
  `);
  let researched = 0;
  let importedOnly = 0;
  let pending = 0;
  let errors = 0;

  for (const row of rows) {
    const jobWebsite = firstJobWebsite.get(row.id) as { website?: string } | undefined;
    const website = row.website || jobWebsite?.website || "";
    if (!website) {
      const summary = summarizePages(row.canonical_name, [], row.description);
      update.run("", "", summary, "[]", "research_pending", nowIso(), row.id);
      pending += 1;
      logAudit(database, "company_research", "company", row.id, "manual-import", "pending", { reason: "No official website supplied." });
      continue;
    }
    if (!options.live || !options.client) {
      const summary = summarizePages(row.canonical_name, [], row.description);
      update.run(website, domainFromUrl(website), summary, JSON.stringify([website]), "researched", nowIso(), row.id);
      importedOnly += 1;
      logAudit(database, "company_research", "company", row.id, website, "accepted", { mode: "imported-evidence", networkUsed: false });
      continue;
    }
    try {
      const pages = await collectPublicSitePages(website, options.client);
      const combinedIdentity = normalizeCompanyName(pages.map((page) => `${page.title} ${page.description}`).join(" "));
      const nameTokens = normalizeCompanyName(row.canonical_name).split(" ").filter((token) => token.length > 2);
      if (nameTokens.length > 0 && !nameTokens.some((token) => combinedIdentity.includes(token))) {
        throw new Error("The supplied site could not be confidently matched to the company name.");
      }
      const summary = summarizePages(row.canonical_name, pages, row.description);
      update.run(pages[0]?.url || website, domainFromUrl(pages[0]?.url || website), summary, JSON.stringify(pages.map((page) => page.url)), "researched", nowIso(), row.id);
      researched += 1;
      logAudit(database, "company_research", "company", row.id, website, "accepted", { pages: pages.map((page) => page.url), networkUsed: true });
    } catch (error) {
      errors += 1;
      const summary = summarizePages(row.canonical_name, [], row.description);
      update.run(website, domainFromUrl(website), summary, JSON.stringify([website]), "research_pending", nowIso(), row.id);
      logAudit(database, "company_research", "company", row.id, website, "uncertain", { error: String(error), networkUsed: true });
    }
  }
  return { researched, importedOnly, pending, errors };
}
