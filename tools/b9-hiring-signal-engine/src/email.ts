import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";
import { logAudit } from "./audit.js";
import { cleanText } from "./normalize.js";
import { matchOffers } from "./offers.js";
import type { CompanyForOutreach, GeneratedEmail, JobCategory } from "./types.js";

const OFFER_DESCRIPTIONS: Record<string, string> = {
  "Corporate Membership": "give select team members year-round access to private simulator bays",
  "Staff Perk Membership": "offer the team a premium local perk they can use on their own schedule",
  "Employee Discount Code": "create a simple employee rate for public tee times",
  "Team-Building Night": "bring the group together for a private, easy-to-run team event",
  "New-Hire Welcome Night": "give new and existing staff a relaxed way to connect",
  "Monthly Staff Social": "build an easy recurring team night around friendly competition",
  "Sales Team Night": "turn a team outing into a light competitive sales celebration",
  "Client Hosting": "host key clients in a private indoor golf setting",
  "Client-Hosting Package": "host clients in a private bay without weather getting in the way",
  "Customer Appreciation Event": "invite customers or partners to a memorable hosted evening",
  "Private Tournament": "run a private tournament that works for golfers and non-golfers",
  "League Sponsorship": "put the company in front of an engaged local audience",
  "Guest Activity Partnership": "give guests a polished local activity available day or night",
  "Rainy-Day Activity Partnership": "offer guests a reliable indoor option when plans change",
  "Tourism Referral Partnership": "connect visitors with a distinctly local Vernon experience",
  "In-Facility TV Advertising": "reach local customers through partner screens inside the facility",
  "Partner QR Code Offer": "make a trackable partner offer simple for staff or guests to use",
  "Crew Night": "give the crew a private night out with a competitive edge",
  "Monthly Staff Challenge": "create a recurring closest-to-the-pin or skills challenge",
  "Private Event": "reserve private bays for an uncomplicated staff or client event",
  "Department Challenge": "bring departments together around a friendly simulator challenge",
  "Culture Night": "create a low-pressure social that supports team connection",
  "After-Shift Staff Social": "give the team a flexible after-shift activity close to home",
  "Staff Social": "host a private team social in a premium local setting",
  "Seasonal Team Kickoff": "start the season with a private team event and friendly competition",
};

const TEAM_LABELS: Record<JobCategory, string> = {
  sales: "sales and customer-facing team",
  customer_service: "customer-facing team",
  management: "leadership team",
  hospitality: "hospitality team",
  tourism: "guest-facing team",
  real_estate: "client-facing team",
  automotive: "sales and service team",
  finance: "professional and client-facing team",
  insurance: "client-facing team",
  professional_services: "professional team",
  trades: "crew",
  construction: "crew",
  logistics: "operations team",
  operations: "operations team",
  hr: "people and culture team",
  events: "events team",
  marketing: "marketing team",
  restaurant: "restaurant team",
  hotel: "guest-services team",
  winery: "guest-facing team",
  resort: "seasonal and guest-facing team",
  medical: "clinic team",
  dental: "clinic team",
  fitness_wellness: "wellness team",
  other: "team",
};

function conciseCompanyContext(company: string, description: string): string {
  const cleaned = cleanText(description);
  if (!cleaned || /further company detail requires manual research/i.test(cleaned)) return "Your team has a strong local, people-focused presence";
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0] || cleaned;
  const naturalCase = firstSentence
    .replace(/[.!?]+$/, "")
    .replace(/^we\b/i, "you")
    .replace(/^(A|An|The)\s/, (match) => match.toLowerCase());
  if (/^(a|an)\s/i.test(naturalCase)) return `From what I found, ${company} is ${naturalCase}`;
  return `From what I found, ${naturalCase}`;
}

function subjectFor(company: string, category: JobCategory, multiple: boolean): string {
  if (multiple) return `Quick idea for the growing team at ${company}`;
  if (["sales", "automotive", "real_estate", "finance", "insurance", "professional_services"].includes(category)) return `Client-hosting idea for ${company}`;
  if (["hospitality", "tourism", "hotel", "restaurant", "winery", "resort"].includes(category)) return `Local team perk idea for ${company}`;
  return `Staff night idea for ${company}`;
}

export function generatePersonalEmail(company: CompanyForOutreach): GeneratedEmail {
  const offers = (company.offers.length ? company.offers : matchOffers(company.category, company.multiplePostings)).slice(0, 5);
  const hiringLine = company.multiplePostings
    ? `I noticed ${company.name} has multiple openings right now, including ${company.jobTitle}, and it made me think there could be a timely fit with Back Nine.`
    : `I noticed you're hiring for ${company.jobTitle}, and it made me think there could be a timely fit between your team and Back Nine.`;
  const context = conciseCompanyContext(company.name, company.description);
  const teamLabel = TEAM_LABELS[company.category];
  const bullets = offers.map((offer) => `- ${offer}: ${OFFER_DESCRIPTIONS[offer] || "create a relevant private golf experience for your team"}`).join("\n");
  const body = [
    `Hey ${company.name},`,
    "",
    "I'm Neil, owner of Back Nine Golf here in Vernon.",
    "",
    hiringLine,
    "",
    `${context}. With the team growing, the timing feels especially relevant.`,
    "",
    `Back Nine is a premium 24/7 indoor golf facility with private Full Swing simulator bays and corporate memberships. For your ${teamLabel}, it can be an easy staff perk, a polished place to host people, or a private team experience that works year-round.`,
    "",
    "A few simple ways this could work:",
    "",
    bullets,
    "",
    "The goal is to keep it flexible and useful for your team. The current hiring activity made this feel like a natural time to introduce the idea.",
    "",
    "You're welcome to come by Back Nine for a quick look and see whether it fits your team.",
  ].join("\n");
  return {
    companyId: company.id,
    company: company.name,
    email: company.contactType === "email" ? company.contactValue : company.contactType === "contact_form" ? `Contact form: ${company.contactValue}` : "No public contact found",
    subject: subjectFor(company.name, company.category, company.multiplePostings),
    body,
  };
}

export function generateApprovedEmails(
  database: EngineDatabase,
  options: { limit: number; includeNoEmail: boolean },
): { generated: number; skipped: number } {
  const rows = database.prepare(`
    SELECT c.id, c.canonical_name, c.research_summary, c.description, c.category, c.offers,
      c.contact_type, c.contact_value,
      (SELECT j.job_title FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
       WHERE cj.company_id = c.id AND j.accepted = 1 ORDER BY j.distance_km, j.id LIMIT 1) AS job_title,
      (SELECT COUNT(*) FROM jobs j JOIN company_jobs cj ON cj.job_id = j.id
       WHERE cj.company_id = c.id AND j.accepted = 1) AS job_count
    FROM companies c WHERE c.review_status = 'approved' AND c.status <> 'rejected'
    ORDER BY c.distance_km, c.id LIMIT ?
  `).all(options.limit) as Array<Record<string, unknown>>;
  const upsert = database.prepare(`
    INSERT INTO generated_emails (company_id, subject, body, generated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(company_id) DO UPDATE SET subject = excluded.subject, body = excluded.body,
      generated_at = excluded.generated_at
  `);
  let generated = 0;
  let skipped = 0;
  for (const row of rows) {
    const contactType = String(row.contact_type || "") as "email" | "contact_form" | "none";
    if (!options.includeNoEmail && !["email", "contact_form"].includes(contactType)) {
      skipped += 1;
      continue;
    }
    const email = generatePersonalEmail({
      id: Number(row.id),
      name: String(row.canonical_name),
      description: String(row.research_summary || row.description || ""),
      jobTitle: String(row.job_title || "a new team member"),
      category: String(row.category) as JobCategory,
      multiplePostings: Number(row.job_count) > 1,
      offers: JSON.parse(String(row.offers || "[]")) as string[],
      contactType,
      contactValue: String(row.contact_value || ""),
    });
    upsert.run(email.companyId, email.subject, email.body, nowIso());
    logAudit(database, "email_generation", "company", email.companyId, "approved-company-data", "generated", { subject: email.subject });
    generated += 1;
  }
  return { generated, skipped };
}
