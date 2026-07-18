import { createHash } from "node:crypto";
import type { JobSignalInput, NormalizedJobSignal } from "./types.js";
import { classifyJob } from "./classify.js";

const COMPANY_SUFFIXES = /\b(?:incorporated|inc|ltd|limited|corp|corporation|company|co|llp)\b/g;

export function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCompanyName(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(COMPANY_SUFFIXES, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(value: string): string {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`);
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function domainFromUrl(value: string): string {
  try {
    return new URL(normalizeUrl(value)).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normalizeJobSignal(input: JobSignalInput): NormalizedJobSignal {
  const companyName = cleanText(input.companyName);
  const jobTitle = cleanText(input.jobTitle) || "Hiring signal";
  if (!companyName) throw new Error("A company name is required for every job signal.");

  const normalizedCompany = normalizeCompanyName(companyName);
  const jobLocation = cleanText(input.jobLocation || input.city);
  const rawText = cleanText(input.rawText);
  const classification = classifyJob(`${jobTitle} ${rawText}`);
  const source = cleanText(input.source) || "manual";
  const sourceUrl = normalizeUrl(input.sourceUrl || "");
  const postingDate = cleanText(input.postingDate);
  const fingerprint = createHash("sha256")
    .update([normalizedCompany, jobTitle.toLowerCase(), jobLocation.toLowerCase(), source, sourceUrl].join("|"))
    .digest("hex");

  return {
    companyName,
    normalizedCompany,
    jobTitle,
    jobLocation,
    city: cleanText(input.city),
    postalCode: cleanText(input.postalCode).toUpperCase(),
    source,
    sourceUrl,
    postingDate,
    rawText,
    website: normalizeUrl(input.website || ""),
    companyDescription: cleanText(input.companyDescription),
    publicEmail: cleanText(input.publicEmail).toLowerCase(),
    contactUrl: normalizeUrl(input.contactUrl || ""),
    phone: cleanText(input.phone),
    address: cleanText(input.address),
    latitude: input.latitude,
    longitude: input.longitude,
    category: classification.category,
    signalTypes: classification.signalTypes,
    fingerprint,
  };
}
