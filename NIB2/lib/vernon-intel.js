// Vernon Market Radar — live local headlines from Vernon Matters (vernonmatters.ca).
// Real RSS, no API key. The feed mixes Vernon/Okanagan stories with syndicated
// national items, so consumers (the brief generator) must filter for local
// relevance rather than treat every item as a Vernon event.
// Cached for 30 minutes. No parsing dependencies — the feed is standard RSS 2.0.

const FEED_URL = "https://vernonmatters.ca/feed/";
const CACHE_MS = 30 * 60 * 1000;
let cache = { at: 0, items: null };

function decodeEntities(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#8217;|&#039;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]) : null;
}

export async function getVernonNews({ fetchImpl = fetch, force = false } = {}) {
  if (!force && cache.items && Date.now() - cache.at < CACHE_MS) return cache.items;

  const res = await fetchImpl(FEED_URL, {
    headers: { "User-Agent": "Mozilla/5.0 NIB2-dashboard", Accept: "application/rss+xml, text/xml" },
  });
  if (!res.ok) {
    const err = new Error(`Vernon Matters feed returned ${res.status}.`);
    err.code = "feed_error";
    throw err;
  }
  const xml = await res.text();
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const items = blocks.slice(0, 12).map((b) => ({
    title: pick(b, "title"),
    link: pick(b, "link"),
    date: pick(b, "pubDate"),
    category: pick(b, "category"),
  })).filter((i) => i.title);

  if (!items.length) {
    const err = new Error("Vernon Matters feed parsed but contained no items.");
    err.code = "no_items";
    throw err;
  }

  cache = { at: Date.now(), items };
  return items;
}

export function clearVernonNewsCache() {
  cache = { at: 0, items: null };
}
