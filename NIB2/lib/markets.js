// Live index tickers for the B9 Command Centre — Dow Jones, S&P 500, Nasdaq,
// and the S&P/TSX Composite, via Yahoo Finance's public chart endpoint (no
// API key). Cached 5 minutes. Verified live before wiring in.

const INDICES = [
  { symbol: "^DJI", label: "DOW" },
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^GSPTSE", label: "TSX" },
];

const CACHE_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };

async function fetchIndex(fetchImpl, { symbol, label }) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetchImpl(url, { headers: { "User-Agent": "Mozilla/5.0 NIB2-dashboard" } });
  if (!res.ok) throw new Error(`${label}: ${res.status}`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose;
  if (price === undefined || price === null) throw new Error(`${label}: no price in response`);
  const change = prev ? price - prev : null;
  return {
    symbol,
    label,
    name: meta.shortName || label,
    price,
    change,
    changePct: prev ? (change / prev) * 100 : null,
  };
}

export async function getIndices({ fetchImpl = fetch, force = false } = {}) {
  if (!force && cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;

  const settled = await Promise.allSettled(INDICES.map((i) => fetchIndex(fetchImpl, i)));
  const quotes = [];
  const errors = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") quotes.push(r.value);
    else errors.push(`${INDICES[i].label}: ${r.reason.message}`);
  });

  if (!quotes.length) {
    const err = new Error(`All index quotes failed (${errors.join("; ")}).`);
    err.code = "markets_error";
    throw err;
  }

  const data = { fetchedAt: new Date().toISOString(), quotes, errors };
  cache = { at: Date.now(), data };
  return data;
}

export function clearMarketsCache() {
  cache = { at: 0, data: null };
}
