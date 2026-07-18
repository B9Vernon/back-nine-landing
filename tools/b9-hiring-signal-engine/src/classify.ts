import type { JobCategory, SignalType } from "./types.js";

const CATEGORY_RULES: Array<[JobCategory, RegExp]> = [
  ["sales", /\b(sales|account executive|business development|realtor|leasing)\b/i],
  ["customer_service", /\b(customer services?|customer experience|guest services?|front desk|reception|service advisor|concierge)\b/i],
  ["management", /\b(manager|director|supervisor|team lead|general manager|executive)\b/i],
  ["hospitality", /\b(hospitality|host|server|bartender|guest services?|food and beverage)\b/i],
  ["tourism", /\b(tourism|tour guide|visitor experience|travel advisor)\b/i],
  ["real_estate", /\b(real estate|property manager|realtor|strata)\b/i],
  ["automotive", /\b(automotive|dealership|vehicle|service advisor|parts advisor|tire technician)\b/i],
  ["finance", /\b(finance|financial|banking|bookkeeper|accountant|credit union|mortgage)\b/i],
  ["insurance", /\b(insurance|broker|underwriter|claims)\b/i],
  ["professional_services", /\b(lawyer|legal assistant|consultant|engineering|architect|professional services)\b/i],
  ["trades", /\b(electrician|plumber|carpenter|welder|mechanic|hvac|journeyperson|apprentice|trades?)\b/i],
  ["construction", /\b(construction|site superintendent|labourer|foreperson|project coordinator)\b/i],
  ["logistics", /\b(logistics|warehouse|driver|dispatcher|shipping|receiving|supply chain)\b/i],
  ["operations", /\b(operations|operator|production|facilities|maintenance|coordinator)\b/i],
  ["hr", /\b(human resources|people and culture|recruiter|talent acquisition|\bhr\b)\b/i],
  ["events", /\b(event|banquet|conference|wedding)\b/i],
  ["marketing", /\b(marketing|communications|social media|brand|content creator)\b/i],
  ["restaurant", /\b(restaurant|cook|chef|kitchen|dishwasher|food service)\b/i],
  ["hotel", /\b(hotel|motel|lodging|housekeeping|rooms division)\b/i],
  ["winery", /\b(winery|vineyard|tasting room|cellar)\b/i],
  ["resort", /\b(resort|ski hill|mountain operations)\b/i],
  ["medical", /\b(medical|clinic|physician|nurse|pharmacy|healthcare|chiropractic|physiotherapy)\b/i],
  ["dental", /\b(dental|dentist|hygienist|orthodont)\b/i],
  ["fitness_wellness", /\b(fitness|wellness|gym|personal trainer|massage|spa|yoga)\b/i],
];

export function classifyJob(text: string): { category: JobCategory; signalTypes: SignalType[] } {
  const category = CATEGORY_RULES.find(([, rule]) => rule.test(text))?.[0] ?? "other";
  const signals = new Set<SignalType>();
  if (/\b(seasonal|summer|winter|holiday|temporary)\b/i.test(text)) signals.add("seasonal_ramp");
  if (/\b(multiple|several|various|expanding|growing|growth|new location|now hiring)\b/i.test(text)) signals.add("growth");
  if (/\b(replacement|immediately|urgent|high volume)\b/i.test(text)) signals.add("turnover");
  if (category === "sales" || /sales/i.test(text)) signals.add("sales_growth");
  if (["hospitality", "hotel", "restaurant", "resort", "tourism"].includes(category)) signals.add("hospitality_growth");
  if (["operations", "logistics", "trades", "construction"].includes(category)) signals.add("operations_growth");
  if (["management", "hr", "customer_service", "events"].includes(category)) signals.add("staff_culture");
  if (signals.size === 0) signals.add("growth");
  return { category, signalTypes: [...signals] };
}

export function hasClearB9Angle(category: JobCategory): boolean {
  return category !== "other";
}
