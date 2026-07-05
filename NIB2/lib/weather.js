// Live Vernon, BC weather — Environment Canada (api.weather.gc.ca).
// Uses the citypage-weather realtime feed for Vernon (feature id bc-27), the
// same data shown on weather.gc.ca's Vernon page. No API key required.
// Results are cached for 10 minutes so the dashboard can poll freely.

const VERNON_URL =
  "https://api.weather.gc.ca/collections/citypageweather-realtime/items/bc-27?f=json";

const CACHE_MS = 10 * 60 * 1000;
let cache = { at: 0, data: null };

// Env Canada wraps every value as { value: { en, fr }, units: { en }, ... }
function v(field) {
  const val = field?.value;
  if (val === undefined || val === null) return null;
  return typeof val === "object" ? (val.en ?? null) : val;
}

export async function getVernonWeather({ fetchImpl = fetch, force = false } = {}) {
  if (!force && cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;

  const res = await fetchImpl(VERNON_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const err = new Error(`Environment Canada returned ${res.status}.`);
    err.code = "api_error";
    throw err;
  }
  const geo = await res.json();
  const p = geo?.properties || {};
  const cc = p.currentConditions || {};

  const forecasts = p.forecastGroup?.forecasts || p.forecastGroup?.forecast || [];
  const today = forecasts[0];

  const data = {
    location: "Vernon, BC",
    fetchedAt: new Date().toISOString(),
    condition: typeof cc.condition === "object" ? cc.condition?.en ?? null : cc.condition ?? null,
    temperature: v(cc.temperature),        // °C
    humidity: v(cc.relativeHumidity),      // %
    windSpeed: v(cc.wind?.speed),          // km/h
    windDirection: v(cc.wind?.direction),  // e.g. "NW"
    windGust: v(cc.wind?.gust),            // km/h
    dewpoint: v(cc.dewpoint),              // °C
    pressure: v(cc.pressure),              // kPa
    forecast: today
      ? {
          period: today.period?.textForecastName?.en ?? null,
          summary:
            (typeof today.textSummary === "object" ? today.textSummary?.en : today.textSummary) ?? null,
        }
      : null,
  };

  if (data.temperature === null && data.humidity === null) {
    const err = new Error("Environment Canada responded but had no current readings for Vernon.");
    err.code = "no_data";
    throw err;
  }

  cache = { at: Date.now(), data };
  return data;
}

export function clearWeatherCache() {
  cache = { at: 0, data: null };
}
