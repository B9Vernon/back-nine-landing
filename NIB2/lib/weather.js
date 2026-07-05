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

// A second shape shows up on forecast text fields: plain { en, fr } with no
// .value wrapper (e.g. abbreviatedForecast.textSummary, forecast.textSummary).
function en(field) {
  if (field === undefined || field === null) return null;
  return typeof field === "object" ? (field.en ?? null) : field;
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

  // Env Canada gives alternating day/night periods (Today, Tonight, Monday,
  // Monday night, ...). Group each day with its overnight low into one
  // 5-day-outlook entry: { day, high, low, summary, iconCode }.
  const fiveDay = [];
  for (let i = 0; i < forecasts.length && fiveDay.length < 5; i++) {
    const f = forecasts[i];
    const name = f.period?.textForecastName?.en ?? "";
    if (/night$/i.test(name)) continue; // nights are folded into the prior day
    const temps = f.temperatures?.temperature || [];
    const high = temps.find((t) => t.class?.en === "high");
    // The matching overnight low is usually the very next period.
    const next = forecasts[i + 1];
    const nextTemps = /night$/i.test(next?.period?.textForecastName?.en ?? "")
      ? next.temperatures?.temperature || []
      : [];
    const low = nextTemps.find((t) => t.class?.en === "low");
    fiveDay.push({
      day: name,
      high: v(high) ?? null,
      low: v(low) ?? null,
      summary: en(f.abbreviatedForecast?.textSummary) ?? en(f.textSummary) ?? null,
      iconCode: f.abbreviatedForecast?.icon?.value ?? null,
    });
  }

  const data = {
    location: "Vernon, BC",
    fetchedAt: new Date().toISOString(),
    condition: en(cc.condition),
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
          summary: en(today.textSummary),
        }
      : null,
    fiveDay,
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
