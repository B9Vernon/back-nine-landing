import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-feeds-"));

const { fetchRss, getAllFeeds, clearFeedCache } = await import("../lib/feeds.js");
const { getIndices, clearMarketsCache } = await import("../lib/markets.js");
const { readBookings, writeBookings } = await import("../lib/bookings.js");

// CBC-style feed: <item> carries attributes/whitespace — the strict <item>
// regex missed these in the wild; the tolerant parser must not.
const RSS_WITH_ATTRS = `<?xml version="1.0"?><rss version="2.0"><channel>
<item cbc:type="story" cbc:deptid="2.655">
<title><![CDATA[McIntosh breaks world record at Canadian trials]]></title>
<link>https://www.cbc.ca/sports/a</link>
<pubDate>Sun, 05 Jul 2026 20:00:00 EDT</pubDate>
</item>
<item>
<title>Second story &amp; more</title>
<link>https://www.cbc.ca/sports/b</link>
<pubDate>Sun, 05 Jul 2026 19:00:00 EDT</pubDate>
</item>
</channel></rss>`;

beforeEach(() => {
  clearFeedCache();
  clearMarketsCache();
});

test("fetchRss parses items with tag attributes and CDATA (CBC style)", async () => {
  const items = await fetchRss("https://example.com/feed", {
    fetchImpl: async () => ({ ok: true, text: async () => RSS_WITH_ATTRS }),
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "McIntosh breaks world record at Canadian trials");
  assert.equal(items[1].title, "Second story & more");
  assert.equal(items[0].link, "https://www.cbc.ca/sports/a");
});

test("fetchRss throws clean errors for dead feeds and empty feeds", async () => {
  await assert.rejects(
    () => fetchRss("https://x/1", { fetchImpl: async () => ({ ok: false, status: 500 }) }),
    (e) => e.code === "feed_error"
  );
  await assert.rejects(
    () => fetchRss("https://x/2", { fetchImpl: async () => ({ ok: true, text: async () => "<rss></rss>" }) }),
    (e) => e.code === "no_items"
  );
});

test("getAllFeeds survives one feed failing and reports it", async () => {
  let call = 0;
  const fetchImpl = async () => {
    call++;
    if (call === 2) return { ok: false, status: 503 }; // business feed dies
    return { ok: true, text: async () => RSS_WITH_ATTRS };
  };
  const out = await getAllFeeds({ fetchImpl });
  assert.ok(out.sports.items.length);
  assert.equal(out.business, null);
  assert.ok(out.markets.items.length);
  assert.match(out.errors[0], /business/);
});

test("getIndices parses Yahoo Finance chart meta into quotes with change", async () => {
  const fetchImpl = async (url) => ({
    ok: true,
    json: async () => ({
      chart: { result: [{ meta: { regularMarketPrice: 105, chartPreviousClose: 100, shortName: url.includes("GSPTSE") ? "TSX" : "Index" } }] },
    }),
  });
  const data = await getIndices({ fetchImpl });
  assert.equal(data.quotes.length, 4);
  assert.equal(data.quotes[0].price, 105);
  assert.equal(data.quotes[0].change, 5);
  assert.equal(Math.round(data.quotes[0].changePct), 5);
});

test("getIndices throws only when ALL quotes fail", async () => {
  await assert.rejects(
    () => getIndices({ fetchImpl: async () => ({ ok: false, status: 429 }) }),
    (e) => e.code === "markets_error"
  );
});

test("bookings round-trip with normalization", () => {
  assert.equal(readBookings().bookings.length, 0);
  writeBookings([{ time: "10am", bay: 1, name: "Smith" }], "manual");
  const b = readBookings();
  assert.equal(b.bookings[0].time, "10am");
  assert.equal(b.bookings[0].bay, "1"); // normalized to string
  assert.ok(b.updatedAt);
  assert.throws(() => writeBookings("not-an-array"));
});
