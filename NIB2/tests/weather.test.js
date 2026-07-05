import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getVernonWeather, clearWeatherCache } from "../lib/weather.js";

// A realistic slice of Environment Canada's citypageweather-realtime response.
const SAMPLE = {
  properties: {
    currentConditions: {
      temperature: { value: { en: 20.1 }, units: { en: "C" } },
      relativeHumidity: { value: { en: 42 }, units: { en: "%" } },
      wind: {
        speed: { value: { en: 4 }, units: { en: "km/h" } },
        direction: { value: { en: "NW" } },
        gust: { value: { en: 27 } },
      },
      dewpoint: { value: { en: 6.6 } },
      pressure: { value: { en: 101.2 } },
    },
    forecastGroup: {
      forecasts: [
        { period: { textForecastName: { en: "Today" } }, textSummary: { en: "Sunny. High 28." } },
      ],
    },
  },
};

beforeEach(() => clearWeatherCache());

test("parses Environment Canada current conditions", async () => {
  const w = await getVernonWeather({ fetchImpl: async () => ({ ok: true, json: async () => SAMPLE }) });
  assert.equal(w.location, "Vernon, BC");
  assert.equal(w.temperature, 20.1);
  assert.equal(w.humidity, 42);
  assert.equal(w.windSpeed, 4);
  assert.equal(w.windDirection, "NW");
  assert.equal(w.windGust, 27);
  assert.equal(w.forecast.period, "Today");
  assert.match(w.forecast.summary, /Sunny/);
});

test("caches results so repeated calls don't re-hit the API", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: true, json: async () => SAMPLE }; };
  await getVernonWeather({ fetchImpl });
  await getVernonWeather({ fetchImpl });
  assert.equal(calls, 1);
});

test("throws a clean error on a non-OK response", async () => {
  await assert.rejects(
    () => getVernonWeather({ fetchImpl: async () => ({ ok: false, status: 502 }) }),
    (e) => e.code === "api_error"
  );
});

test("throws no_data when readings are missing", async () => {
  const empty = { properties: { currentConditions: {} } };
  await assert.rejects(
    () => getVernonWeather({ fetchImpl: async () => ({ ok: true, json: async () => empty }) }),
    (e) => e.code === "no_data"
  );
});
