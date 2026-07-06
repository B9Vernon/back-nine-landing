import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-cc-"));

const { gatherIntel, generateBrief, readCentre, writeCentre } = await import("../lib/command-centre.js");
const { getVernonNews, clearVernonNewsCache } = await import("../lib/vernon-intel.js");

const RSS_FIXTURE = `<?xml version="1.0"?><rss><channel>
<item><title>Vernon council approves new rec funding</title><link>https://vernonmatters.ca/a</link><pubDate>Mon, 06 Jul 2026 01:00:00 +0000</pubDate><category>Vernon News</category></item>
<item><title><![CDATA[Okanagan heat wave expected this week]]></title><link>https://vernonmatters.ca/b</link><pubDate>Sun, 05 Jul 2026 20:00:00 +0000</pubDate></item>
</channel></rss>`;

const FAKE_WEATHER = { temperature: 28, condition: "Sunny", humidity: 30, windSpeed: 5, windDirection: "N", fiveDay: [{ day: "Today", high: 33, low: 15, summary: "Hot" }] };

const FAKE_BRIEF = {
  headline: "Heat wave week — sell the coolest golf in Vernon.",
  vernonSignals: [{ signal: "Heat wave incoming", source: "Okanagan heat wave expected this week", confidence: "reported" }],
  topActions: Array.from({ length: 5 }, (_, i) => ({
    action: `Action ${i + 1}`, why: "why", benefit: "benefit", urgency: "this-week", nib2Help: "drafting",
  })),
  revenueOpportunities: ["Midday heat-escape bookings"],
  premiumPositioning: ["Coolest premium bays in Vernon"],
  competitiveAdvantage: ["24/7 vs weather-dependent options"],
  contentIdeas: ["Beat-the-heat reel"],
  corporateTargets: ["Realtors"],
  memberGrowth: ["Summer member challenge"],
  tournamentIdeas: ["Heat-wave scramble"],
  activationQueue: [{ task: "Draft heat-wave promo", prompt: "Draft a heat-wave promo for B9." }],
};

beforeEach(() => {
  clearVernonNewsCache();
  writeCentre({ updatedAt: null, intel: null, brief: null, briefGeneratedAt: null });
});

test("vernon-intel parses RSS titles, links, dates, and CDATA", async () => {
  const items = await getVernonNews({ fetchImpl: async () => ({ ok: true, text: async () => RSS_FIXTURE }) });
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "Vernon council approves new rec funding");
  assert.equal(items[0].link, "https://vernonmatters.ca/a");
  assert.equal(items[1].title, "Okanagan heat wave expected this week");
});

test("vernon-intel throws a clean error on a dead feed", async () => {
  await assert.rejects(
    () => getVernonNews({ fetchImpl: async () => ({ ok: false, status: 503 }) }),
    (e) => e.code === "feed_error"
  );
});

test("gatherIntel stores real signals and survives one source failing", async () => {
  const intel = await gatherIntel({
    weatherFn: async () => FAKE_WEATHER,
    newsFn: async () => { throw new Error("feed down"); },
  });
  assert.equal(intel.weather.temperature, 28);
  assert.equal(intel.news, null);
  assert.match(intel.errors[0], /feed down/);
  assert.equal(readCentre().intel.weather.temperature, 28);
});

test("generateBrief stores a schema-shaped brief from the model", async () => {
  const mockClient = {
    messages: {
      create: async (params) => {
        assert.ok(params.output_config?.format?.schema, "structured output schema must be sent");
        assert.match(params.messages[0].content, /Back Nine Vernon/);
        assert.match(params.messages[0].content, /heat wave/i); // real headline made it into the prompt
        return { content: [{ type: "text", text: JSON.stringify(FAKE_BRIEF) }] };
      },
    },
  };
  const centre = await generateBrief({
    client: mockClient,
    weatherFn: async () => FAKE_WEATHER,
    newsFn: async () => [{ title: "Okanagan heat wave expected this week", link: "x", date: "d", category: null }],
  });
  assert.equal(centre.brief.topActions.length, 5);
  assert.ok(centre.briefGeneratedAt);
  assert.equal(readCentre().brief.headline, FAKE_BRIEF.headline);
});

test("generateBrief refuses to run with zero live signals (no guesswork briefs)", async () => {
  await assert.rejects(
    () => generateBrief({
      client: { messages: { create: async () => { throw new Error("should never be called"); } } },
      weatherFn: async () => { throw new Error("down"); },
      newsFn: async () => { throw new Error("down"); },
    }),
    (e) => e.code === "no_signals"
  );
});
