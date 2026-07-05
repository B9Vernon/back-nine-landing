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
        {
          period: { textForecastName: { en: "Today" } },
          temperatures: { temperature: [{ class: { en: "high" }, value: { en: 28 } }] },
          abbreviatedForecast: { textSummary: { en: "Mainly sunny" } },
          textSummary: { en: "Sunny. High 28." },
        },
        {
          period: { textForecastName: { en: "Tonight" } },
          temperatures: { temperature: [{ class: { en: "low" }, value: { en: 12 } }] },
        },
        {
          period: { textForecastName: { en: "Monday" } },
          temperatures: { temperature: [{ class: { en: "high" }, value: { en: 30 } }] },
          abbreviatedForecast: { textSummary: { en: "Sunny" } },
        },
        {
          period: { textForecastName: { en: "Monday night" } },
          temperatures: { temperature: [{ class: { en: "low" }, value: { en: 14 } }] },
        },
        {
          period: { textForecastName: { en: "Tuesday" } },
          temperatures: { temperature: [{ class: { en: "high" }, value: { en: 26 } }] },
          abbreviatedForecast: { textSummary: { en: "Cloudy" } },
        },
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

test("builds a 5-day outlook, folding each night's low into its day", async () => {
  const w = await getVernonWeather({ fetchImpl: async () => ({ ok: true, json: async () => SAMPLE }) });
  assert.equal(w.fiveDay.length, 3); // Today, Monday, Tuesday in the sample (nights excluded from the count)
  assert.equal(w.fiveDay[0].day, "Today");
  assert.equal(w.fiveDay[0].high, 28);
  assert.equal(w.fiveDay[0].low, 12); // pulled from "Tonight"
  assert.equal(w.fiveDay[0].summary, "Mainly sunny");
  assert.equal(w.fiveDay[1].day, "Monday");
  assert.equal(w.fiveDay[1].high, 30);
  assert.equal(w.fiveDay[1].low, 14);
  assert.equal(w.fiveDay[2].day, "Tuesday");
  assert.equal(w.fiveDay[2].low, null); // no "Tuesday night" period in the sample
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
