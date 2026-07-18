import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_DATABASE = resolve(
  PROJECT_ROOT,
  process.env.B9_DATABASE_PATH || "data/cache/b9-hiring-signals.sqlite",
);
export const DEFAULT_RADIUS_KM = 40;
export const ORIGIN_POSTAL_CODE = "V1T 5B9";
export const ORIGIN = { latitude: 50.267, longitude: -119.272 };
export const TIMEZONE = process.env.B9_TIMEZONE || "America/Vancouver";
export const USER_AGENT =
  process.env.B9_USER_AGENT ||
  "BackNineHiringSignalEngine/1.0 (+https://backninegolf.ca/local/vernonbc)";
export const REQUEST_DELAY_MS = Number(process.env.B9_REQUEST_DELAY_MS || 1000);

export const CITY_CENTROIDS: Record<string, { latitude: number; longitude: number; distanceKm: number }> = {
  vernon: { latitude: 50.267, longitude: -119.272, distanceKm: 0 },
  coldstream: { latitude: 50.22, longitude: -119.25, distanceKm: 7 },
  armstrong: { latitude: 50.449, longitude: -119.197, distanceKm: 24 },
  spallumcheen: { latitude: 50.39, longitude: -119.22, distanceKm: 20 },
  "lake country": { latitude: 50.054, longitude: -119.414, distanceKm: 37 },
  lumby: { latitude: 50.249, longitude: -118.965, distanceKm: 28 },
  "silver star": { latitude: 50.36, longitude: -119.06, distanceKm: 24 },
  "predator ridge": { latitude: 50.193, longitude: -119.39, distanceKm: 18 },
  enderby: { latitude: 50.55, longitude: -119.14, distanceKm: 38 },
  kelowna: { latitude: 49.888, longitude: -119.496, distanceKm: 54 },
};
