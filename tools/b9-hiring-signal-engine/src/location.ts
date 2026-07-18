import { CITY_CENTROIDS, ORIGIN } from "./config.js";
import { hasClearB9Angle } from "./classify.js";
import type { LocationDecision, LocationSettings, NormalizedJobSignal } from "./types.js";

export function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const radius = 6371;
  const latDelta = toRadians(bLat - aLat);
  const lonDelta = toRadians(bLon - aLon);
  const value =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(lonDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function detectCity(location: string): string {
  const lowered = location.toLowerCase();
  return Object.keys(CITY_CENTROIDS).find((city) => lowered.includes(city)) ?? "";
}

export function evaluateLocation(job: NormalizedJobSignal, settings: LocationSettings): LocationDecision {
  const locationText = `${job.city} ${job.jobLocation} ${job.address}`.trim();
  const city = detectCity(locationText);
  const looksLikeGolf = /\b(golf|golf course|country club)\b/i.test(
    `${job.companyName} ${job.companyDescription}`,
  );

  if (!settings.includeKelowna && /\bkelowna\b/i.test(locationText)) {
    return { accepted: false, uncertain: false, city: "kelowna", reason: "Kelowna is excluded by default." };
  }
  if (!settings.includeGolfCourses && looksLikeGolf) {
    return { accepted: false, uncertain: false, city, reason: "Golf courses are excluded by default." };
  }
  if (settings.categories?.length && !settings.categories.includes(job.category)) {
    return { accepted: false, uncertain: !city, city, reason: `Category ${job.category} is disabled for this run.` };
  }
  if (settings.sources?.length && !settings.sources.includes(job.source)) {
    return { accepted: false, uncertain: !city, city, reason: `Source ${job.source} is disabled for this run.` };
  }
  if (!hasClearB9Angle(job.category)) {
    return { accepted: false, uncertain: !city, city, reason: "No clear Back Nine offer angle was identified." };
  }

  let distanceKm: number | undefined;
  let uncertain = false;
  if (typeof job.latitude === "number" && typeof job.longitude === "number") {
    distanceKm = haversineKm(ORIGIN.latitude, ORIGIN.longitude, job.latitude, job.longitude);
  } else if (city) {
    distanceKm = CITY_CENTROIDS[city]?.distanceKm;
    uncertain = true;
  } else {
    uncertain = true;
  }

  if (distanceKm === undefined) {
    return { accepted: false, uncertain, city, reason: "Location could not be placed within the requested radius." };
  }
  if (distanceKm > settings.radiusKm) {
    return {
      accepted: false,
      distanceKm,
      uncertain,
      city,
      reason: `Approximate distance ${distanceKm.toFixed(1)} km exceeds the ${settings.radiusKm} km radius.`,
    };
  }
  return {
    accepted: true,
    distanceKm,
    uncertain,
    city,
    reason: uncertain ? "Accepted using approximate city-centroid distance." : "Accepted using coordinates.",
  };
}
