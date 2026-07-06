// Gmail via n8n — NIB's n8n cloud workflow owns the Google connection; NIB2
// just polls the workflow's Webhook production URL and gets JSON back. No
// Google OAuth needed on NIB2's side at all.
//
// Setup (one-time, in n8n): Webhook trigger (GET, Respond: "When Last Node
// Finishes") → Gmail node ("Get Many", search "in:inbox is:unread",
// Simplify ON) → activate workflow → paste the PRODUCTION webhook URL into
// .env.local as N8N_GMAIL_WEBHOOK_URL.
//
// The normalizer below is deliberately tolerant: n8n's Gmail node output
// shape varies (simplified vs raw, wrapped in {json} or not, single object
// vs array), and NIB shouldn't have to care.

const CACHE_MS = 2 * 60 * 1000; // n8n + Gmail are rate-limited; 2 min is plenty
let cache = { at: 0, emails: null };

export function isN8nConfigured() {
  return Boolean(process.env.N8N_GMAIL_WEBHOOK_URL);
}

function firstString(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object" && typeof v.value === "string" && v.value.trim()) return v.value.trim();
  }
  return "";
}

// Pull sender/subject/etc. out of whatever shape one n8n item has.
function normalizeItem(raw) {
  const item = raw?.json && typeof raw.json === "object" ? raw.json : raw;
  if (!item || typeof item !== "object") return null;

  // Raw Gmail API shape keeps headers in payload.headers.
  const headers = {};
  for (const h of item.payload?.headers || []) {
    if (h?.name) headers[h.name.toLowerCase()] = h.value;
  }

  const from = firstString(item.From, item.from, item.sender, headers.from);
  const subject = firstString(item.Subject, item.subject, headers.subject);
  const snippet = firstString(item.snippet, item.textSnippet, item.text, item.preview);
  const date = firstString(item.date, item.Date, headers.date, item.internalDate);

  if (!from && !subject && !snippet) return null; // not an email-shaped item
  return {
    id: firstString(item.id, item.threadId) || null,
    from: from || "(unknown sender)",
    subject: subject || "(no subject)",
    snippet: snippet.slice(0, 200),
    date,
  };
}

export async function fetchUnreadViaN8n({ fetchImpl = fetch, force = false } = {}) {
  if (!isN8nConfigured()) {
    const err = new Error("n8n Gmail webhook is not configured.");
    err.code = "not_configured";
    throw err;
  }
  if (!force && cache.emails && Date.now() - cache.at < CACHE_MS) return cache.emails;

  const res = await fetchImpl(process.env.N8N_GMAIL_WEBHOOK_URL, {
    headers: { Accept: "application/json", "User-Agent": "NIB2-dashboard" },
  });
  if (!res.ok) {
    const err = new Error(
      res.status === 404
        ? "n8n webhook returned 404 — the workflow is probably not ACTIVATED (test URLs only work while listening; use the Production URL and toggle the workflow Active)."
        : `n8n webhook returned ${res.status}.`
    );
    err.code = "webhook_error";
    err.status = res.status;
    throw err;
  }

  let body;
  try {
    body = await res.json();
  } catch {
    const err = new Error("n8n webhook responded but not with JSON — set the Webhook node's Respond option to 'When Last Node Finishes'.");
    err.code = "bad_response";
    throw err;
  }

  // Accept: [items], {data:[items]}, {messages:[items]}, or a single item.
  const list = Array.isArray(body) ? body
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body?.messages) ? body.messages
    : [body];

  const emails = list.map(normalizeItem).filter(Boolean).slice(0, 15);
  cache = { at: Date.now(), emails };
  return emails;
}

export function clearN8nCache() {
  cache = { at: 0, emails: null };
}
