import type { JobCategory } from "./types.js";

const OFFER_MAP: Record<JobCategory, string[]> = {
  sales: ["Corporate Membership", "Client Hosting", "Sales Team Night", "Customer Appreciation Event", "In-Facility TV Advertising"],
  customer_service: ["Staff Perk Membership", "Team-Building Night", "New-Hire Welcome Night", "Employee Discount Code"],
  management: ["Corporate Membership", "New-Hire Welcome Night", "Department Challenge", "Monthly Staff Social"],
  hospitality: ["Staff Perk Membership", "Guest Activity Partnership", "After-Shift Staff Social", "Rainy-Day Activity Partnership"],
  tourism: ["Guest Activity Partnership", "Tourism Referral Partnership", "Partner QR Code Offer", "Rainy-Day Activity Partnership"],
  real_estate: ["Client-Hosting Package", "Customer Appreciation Event", "Corporate Membership", "In-Facility TV Advertising"],
  automotive: ["Client-Hosting Package", "Sales Team Night", "Customer Appreciation Event", "In-Facility TV Advertising"],
  finance: ["Corporate Membership", "Client-Hosting Package", "Staff Perk Membership", "Customer Appreciation Event"],
  insurance: ["Corporate Membership", "Client-Hosting Package", "Team-Building Night", "Customer Appreciation Event"],
  professional_services: ["Corporate Membership", "Client-Hosting Package", "Staff Perk Membership", "Private Tournament"],
  trades: ["Crew Night", "Monthly Staff Challenge", "Employee Discount Code", "Private Event"],
  construction: ["Crew Night", "Monthly Staff Challenge", "Team-Building Night", "Employee Discount Code"],
  logistics: ["Team-Building Night", "Monthly Staff Social", "Employee Discount Code", "Private Tournament"],
  operations: ["Team-Building Night", "Department Challenge", "Staff Perk Membership", "Monthly Staff Social"],
  hr: ["Staff Perk Membership", "New-Hire Welcome Night", "Culture Night", "Corporate Membership"],
  events: ["Private Tournament", "Team-Building Night", "Client-Hosting Package", "Partner QR Code Offer"],
  marketing: ["In-Facility TV Advertising", "Customer Appreciation Event", "Partner QR Code Offer", "Private Event"],
  restaurant: ["After-Shift Staff Social", "Employee Discount Code", "Team-Building Night", "Guest Activity Partnership"],
  hotel: ["Guest Activity Partnership", "Rainy-Day Activity Partnership", "Staff Perk Membership", "Tourism Referral Partnership"],
  winery: ["Customer Appreciation Event", "Client-Hosting Package", "Staff Social", "Tourism Referral Partnership"],
  resort: ["Guest Activity Partnership", "Seasonal Team Kickoff", "Staff Perk Membership", "Rainy-Day Activity Partnership"],
  medical: ["Staff Perk Membership", "Team-Building Night", "Monthly Staff Social", "Corporate Membership"],
  dental: ["Staff Perk Membership", "Team-Building Night", "Monthly Staff Social", "Corporate Membership"],
  fitness_wellness: ["Employee Discount Code", "Partner QR Code Offer", "Team-Building Night", "Staff Perk Membership"],
  other: [],
};

export function matchOffers(category: JobCategory, multiplePostings = false): string[] {
  const offers = [...OFFER_MAP[category]];
  if (multiplePostings && offers.length > 0 && !offers.includes("New-Hire Welcome Night")) {
    offers.splice(1, 0, "New-Hire Welcome Night");
  }
  return offers.slice(0, 5);
}
