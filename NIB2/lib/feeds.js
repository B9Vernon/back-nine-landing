// News feed modules for the B9 Command Centre — real RSS, no API keys.
//   Sports   — CBC Sports (North American, Canadian lean)
//   Business — Financial Post (Canadian business/markets)
//   Markets  — CNBC Markets (US stock market news)
// Generic tolerant RSS parser (handles <item attr="..."> and CDATA), one
// in-memory cache per feed (15 min). Each feed fails independently.

const FEEDS = {
  sports: { name: "CBC Sports", url: "https://www.cbc.ca/webfeed/rss/rss-sports" },
  business: { name: "Financial Post", url: "https://financialpost.com/feed" },
  markets: { name: "CNBC Markets", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
};

const CACHE_MS = 15 * 60 * 1000;
const cache = new Map(); // key -> { at, items }

function decodeEntities(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#8217;|&#039;|&apos;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]) : null;
}

export async function fetchRss(url, { fetchImpl = fetch, limit = 10, force = false } = {}) {
  const hit = cache.get(url);
  if (!force && hit && Date.now() - hit.at < CACHE_MS) return hit.items.slice(0, limit);

  const res = await fetchImpl(url, {
    headers: { "User-Agent": "Mozilla/5.0 NIB2-dashboard", Accept: "application/rss+xml, text/xml, application/xml" },
  });
  if (!res.ok) {
    const err = new Error(`Feed returned ${res.status}.`);
    err.code = "feed_error";
    throw err;
  }
  const xml = await res.text();
  // Tolerant: matches <item> and <item attr="...">.
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/g) || [];
  const items = blocks
    .map((b) => ({ title: pick(b, "title"), link: pick(b, "link"), date: pick(b, "pubDate") }))
    .filter((i) => i.title);
  if (!items.length) {
    const err = new Error("Feed parsed but contained no items.");
    err.code = "no_items";
    throw err;
  }
  cache.set(url, { at: Date.now(), items });
  return items.slice(0, limit);
}

async function getFeed(key, opts = {}) {
  const feed = FEEDS[key];
  const items = await fetchRss(feed.url, { ...opts, limit: opts.limit ?? 10 });
  return { source: feed.name, items };
}

export const getSportsNews = (opts) => getFeed("sports", opts);
export const getBusinessNews = (opts) => getFeed("business", opts);
export const getMarketsNews = (opts) => getFeed("markets", opts);

// All three at once for the dashboard; each fails independently.
export async function getAllFeeds(opts = {}) {
  const out = { fetchedAt: new Date().toISOString(), errors: [] };
  for (const [key, fn] of [["sports", getSportsNews], ["business", getBusinessNews], ["markets", getMarketsNews]]) {
    try {
      out[key] = await fn(opts);
    } catch (err) {
      out[key] = null;
      out.errors.push(`${key}: ${err.message}`);
    }
  }
  return out;
}

export function clearFeedCache() {
  cache.clear();
}
