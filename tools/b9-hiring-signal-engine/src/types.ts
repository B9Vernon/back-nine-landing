export type JobCategory =
  | "sales"
  | "customer_service"
  | "management"
  | "hospitality"
  | "tourism"
  | "real_estate"
  | "automotive"
  | "finance"
  | "insurance"
  | "professional_services"
  | "trades"
  | "construction"
  | "logistics"
  | "operations"
  | "hr"
  | "events"
  | "marketing"
  | "restaurant"
  | "hotel"
  | "winery"
  | "resort"
  | "medical"
  | "dental"
  | "fitness_wellness"
  | "other";

export type SignalType =
  | "growth"
  | "turnover"
  | "seasonal_ramp"
  | "sales_growth"
  | "hospitality_growth"
  | "operations_growth"
  | "staff_culture";

export interface JobSignalInput {
  companyName: string;
  jobTitle: string;
  jobLocation?: string;
  city?: string;
  postalCode?: string;
  source?: string;
  sourceUrl?: string;
  postingDate?: string;
  rawText?: string;
  website?: string;
  companyDescription?: string;
  publicEmail?: string;
  contactUrl?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface NormalizedJobSignal extends Required<Pick<JobSignalInput, "companyName" | "jobTitle">> {
  normalizedCompany: string;
  jobLocation: string;
  city: string;
  postalCode: string;
  source: string;
  sourceUrl: string;
  postingDate: string;
  rawText: string;
  website: string;
  companyDescription: string;
  publicEmail: string;
  contactUrl: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category: JobCategory;
  signalTypes: SignalType[];
  fingerprint: string;
}

export interface LocationSettings {
  radiusKm: number;
  includeKelowna: boolean;
  includeGolfCourses: boolean;
  categories?: JobCategory[];
  sources?: string[];
}

export interface LocationDecision {
  accepted: boolean;
  distanceKm?: number;
  uncertain: boolean;
  city: string;
  reason: string;
}

export interface CompanyForOutreach {
  id: number;
  name: string;
  description: string;
  jobTitle: string;
  category: JobCategory;
  multiplePostings: boolean;
  offers: string[];
  contactType: "email" | "contact_form" | "none";
  contactValue: string;
}

export interface GeneratedEmail {
  companyId: number;
  company: string;
  email: string;
  subject: string;
  body: string;
}

export interface SourceAdapterDefinition {
  id: string;
  label: string;
  hostPatterns: string[];
  livePolicy: "official-api-or-feed" | "public-page-if-permitted" | "manual-import-only";
  supportedFallbacks: string[];
  enabledByDefault: boolean;
}
