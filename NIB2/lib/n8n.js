// NIB's "NIB2 Command Router" n8n workflow — one POST webhook that routes on
// a `command` field: connection_test, gmail_summary, gmail_draft,
// weekly_b9_brief. NIB2 is the client: it POSTs {command, ...payload} to
// N8N_WEBHOOK_URL with the shared secret in a header, and gets JSON back.
//
// Setup (one-time, in n8n, done by NIB): Webhook (POST, Respond "When Last
// Node Finishes") → Route on `command` → branches → activate workflow →
// copy the PRODUCTION webhook URL into .env.local as N8N_WEBHOOK_URL, and
// the same secret configured on the Webhook's header auth as
// N8N_WEBHOOK_SECRET.

const CACHE_MS = 2 * 60 * 1000; // n8n + Gmail are rate-limited; 2 min is plenty
const SECRET_HEADER = "x-nib2-secret";
let gmailCache = { at: 0, emails: null };

export function isN8nConfigured() {
  return Boolean(process.env.N8N_WEBHOOK_URL);
}

export async function callN8n(command, payload = {}, { fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  if (!isN8nConfigured()) {
    const err = new Error("n8n is not configured. Set N8N_WEBHOOK_URL (and N8N_WEBHOOK_SECRET) in .env.local.");
    err.code = "not_configured";
    throw err;
  }

  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (process.env.N8N_WEBHOOK_SECRET) headers[SECRET_HEADER] = process.env.N8N_WEBHOOK_SECRET;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ command, ...payload }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error("n8n webhook timed out — check the workflow is Active and not stuck on a step.");
      e.code = "webhook_error";
      throw e;
    }
    const e = new Error(`Could not reach the n8n webhook: ${err.message}`);
    e.code = "webhook_error";
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message;
    if (res.status === 404) {
      message = "n8n webhook returned 404 — the workflow is probably not ACTIVATED (toggle it Active, top-right, and use the Production URL, not Test).";
    } else if (res.status === 401 || res.status === 403) {
      message = "n8n webhook rejected the request (401/403) — N8N_WEBHOOK_SECRET probably doesn't match the header auth configured on the Webhook node.";
    } else {
      message = `n8n webhook returned ${res.status}.`;
    }
    const err = new Error(message);
    err.code = "webhook_error";
    err.status = res.status;
    throw err;
  }

  try {
    return await res.json();
  } catch {
    const err = new Error("n8n webhook responded but not with JSON — set the Webhook node's Respond option to 'When Last Node Finishes'.");
    err.code = "bad_response";
    throw err;
  }
}

function firstString(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object" && typeof v.value === "string" && v.value.trim()) return v.value.trim();
  }
  return "";
}

// Pull sender/subject/etc. out of whatever shape one Gmail item has.
function normalizeItem(raw) {
  const item = raw?.json && typeof raw.json === "object" ? raw.json : raw;
  if (!item || typeof item !== "object") return null;

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

// The "Build Gmail Summary Response" node's exact shape is whatever NIB
// wired up — accept a list, a wrapped list, a plain summary string, or a
// single email-shaped object, and normalize whatever comes back.
function normalizeGmailSummary(body) {
  if (body && typeof body === "object" && typeof body.summary === "string" && !Array.isArray(body)) {
    return { summaryText: body.summary, emails: [] };
  }
  const list = Array.isArray(body) ? body
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body?.messages) ? body.messages
    : Array.isArray(body?.emails) ? body.emails
    : [body];
  return { summaryText: null, emails: list.map(normalizeItem).filter(Boolean).slice(0, 15) };
}

export async function testN8nConnection({ fetchImpl } = {}) {
  return callN8n("connection_test", {}, { fetchImpl });
}

export async function fetchUnreadViaN8n({ fetchImpl, force = false } = {}) {
  if (!force && gmailCache.emails && Date.now() - gmailCache.at < CACHE_MS) return gmailCache.emails;
  const body = await callN8n("gmail_summary", {}, { fetchImpl });
  const { emails } = normalizeGmailSummary(body);
  gmailCache = { at: Date.now(), emails };
  return emails;
}

export async function createGmailDraftViaN8n({ to, subject, body }, { fetchImpl } = {}) {
  return callN8n("gmail_draft", { to, subject, body }, { fetchImpl });
}

export async function weeklyBriefViaN8n({ fetchImpl } = {}) {
  return callN8n("weekly_b9_brief", {}, { fetchImpl });
}

export function clearN8nCache() {
  gmailCache = { at: 0, emails: null };
}
