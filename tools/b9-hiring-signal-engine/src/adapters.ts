import type { SourceAdapterDefinition } from "./types.js";

const manualFallbacks = ["saved HTML", "copied text", "CSV", "JSON", "job URL list"];

export const SOURCE_ADAPTERS: SourceAdapterDefinition[] = [
  { id: "indeed-ca", label: "Indeed Canada", hostPatterns: ["indeed.ca", "ca.indeed.com"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "job-bank", label: "Government of Canada Job Bank", hostPatterns: ["jobbank.gc.ca"], livePolicy: "official-api-or-feed", supportedFallbacks: ["official feed", ...manualFallbacks], enabledByDefault: false },
  { id: "castanet", label: "Castanet Classifieds Jobs", hostPatterns: ["castanet.net"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "workbc", label: "WorkBC", hostPatterns: ["workbc.ca"], livePolicy: "public-page-if-permitted", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "simplyhired-ca", label: "SimplyHired Canada", hostPatterns: ["simplyhired.ca"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "workopolis", label: "Workopolis", hostPatterns: ["workopolis.com"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "linkedin-ca", label: "LinkedIn Canada", hostPatterns: ["linkedin.com"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "glassdoor-ca", label: "Glassdoor Canada", hostPatterns: ["glassdoor.ca"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "ziprecruiter-ca", label: "ZipRecruiter Canada", hostPatterns: ["ziprecruiter.com", "ziprecruiter.ca"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "eluta", label: "Eluta.ca", hostPatterns: ["eluta.ca"], livePolicy: "manual-import-only", supportedFallbacks: manualFallbacks, enabledByDefault: false },
  { id: "company-careers", label: "Company career pages", hostPatterns: [], livePolicy: "public-page-if-permitted", supportedFallbacks: ["permitted public page", ...manualFallbacks], enabledByDefault: true },
  { id: "search-results", label: "Search-engine result imports", hostPatterns: [], livePolicy: "official-api-or-feed", supportedFallbacks: ["approved search API", "exported HTML", "copied text", "CSV", "JSON"], enabledByDefault: true },
  { id: "manual-html", label: "Manual HTML imports", hostPatterns: [], livePolicy: "manual-import-only", supportedFallbacks: ["saved HTML"], enabledByDefault: true },
  { id: "manual-csv", label: "Manual CSV imports", hostPatterns: [], livePolicy: "manual-import-only", supportedFallbacks: ["CSV"], enabledByDefault: true },
  { id: "manual-text", label: "Manual copied-text imports", hostPatterns: [], livePolicy: "manual-import-only", supportedFallbacks: ["copied text", "company list", "job URL list"], enabledByDefault: true },
  { id: "manual-json", label: "Manual JSON imports", hostPatterns: [], livePolicy: "manual-import-only", supportedFallbacks: ["JSON"], enabledByDefault: true },
];

export function identifySource(sourceUrl: string, explicitSource = ""): string {
  if (explicitSource.trim()) return explicitSource.trim();
  let host = "";
  try {
    host = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return "manual";
  }
  return SOURCE_ADAPTERS.find((adapter) => adapter.hostPatterns.some((pattern) => host.endsWith(pattern)))?.id ?? "company-careers";
}

export function getSourceAdapter(id: string): SourceAdapterDefinition | undefined {
  return SOURCE_ADAPTERS.find((adapter) => adapter.id === id);
}
