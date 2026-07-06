// NIB2 Gmail integration — safe, read-first, local OAuth.
//
// Why local OAuth (not a "connector"): NIB2 is a Node app running on your own
// computer. The Gmail connectors inside Claude's own chat environment are not
// reachable from a separate app, so NIB2 uses Google's standard OAuth 2.0 flow
// with credentials you create once in Google Cloud. Your Gmail password is never
// asked for or stored — only a revocable OAuth token, kept in data/gmail-token.json
// (git-ignored, never sent to the browser).
//
// Safety rules baked in:
//   - Read + search + DRAFT only. NIB2 never sends, deletes, or archives.
//   - Drafts are created in your Gmail Drafts folder for you to review and send.
//
// googleapis is imported lazily so the server still runs before `npm install`
// has fetched it, and so the whole app never crashes on a missing dependency.

import fs from "node:fs";
import { dataPath } from "./store.js";

const TOKEN_FILE = "gmail-token.json";

// Read + compose(draft) scopes only. No send/delete/modify scope is requested,
// so even a leaked token cannot send or destroy mail.
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
];

export function isConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function isConnected() {
  return isConfigured() && fs.existsSync(dataPath(TOKEN_FILE));
}

export function gmailStatus() {
  if (!isConfigured()) return { connected: false, reason: "not_configured" };
  if (!isConnected()) return { connected: false, reason: "not_authorized" };
  return { connected: true };
}

async function getOAuthClient() {
  const { google } = await import("googleapis");
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  if (fs.existsSync(dataPath(TOKEN_FILE))) {
    const token = JSON.parse(fs.readFileSync(dataPath(TOKEN_FILE), "utf8"));
    client.setCredentials(token);
    // Persist refreshed tokens so the connection survives restarts.
    client.on("tokens", (t) => {
      const merged = { ...token, ...t };
      fs.writeFileSync(dataPath(TOKEN_FILE), JSON.stringify(merged, null, 2));
    });
  }
  return client;
}

export async function getAuthUrl() {
  if (!isConfigured()) throw new Error("Gmail is not configured. See README section on Gmail.");
  const client = await getOAuthClient();
  return client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });
}

export async function handleCallback(code) {
  const client = await getOAuthClient();
  const { tokens } = await client.getToken(code);
  fs.writeFileSync(dataPath(TOKEN_FILE), JSON.stringify(tokens, null, 2));
  return true;
}

async function gmailApi() {
  if (!isConnected()) throw new Error("Gmail is not connected. Authorize it first at /api/gmail/auth.");
  const { google } = await import("googleapis");
  const auth = await getOAuthClient();
  return google.gmail({ version: "v1", auth });
}

// Decode a Gmail header list into a simple {from, subject, date} object.
function headerMap(headers = []) {
  const map = {};
  for (const h of headers) map[h.name.toLowerCase()] = h.value;
  return map;
}

// List and lightly summarize recent inbox messages (read-only).
export async function summarizeInbox(max = 8) {
  const gmail = await gmailApi();
  const list = await gmail.users.messages.list({ userId: "me", maxResults: max, q: "in:inbox" });
  const messages = list.data.messages || [];
  const out = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: "me", id: m.id, format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });
    const h = headerMap(full.data.payload?.headers);
    out.push({
      id: m.id,
      from: h.from || "(unknown)",
      subject: h.subject || "(no subject)",
      date: h.date || "",
      snippet: full.data.snippet || "",
      unread: (full.data.labelIds || []).includes("UNREAD"),
    });
  }
  return out;
}

// List unread inbox messages (read-only) — powers the Command Centre card.
export async function listUnread(max = 10) {
  const gmail = await gmailApi();
  const list = await gmail.users.messages.list({ userId: "me", maxResults: max, q: "in:inbox is:unread" });
  const messages = list.data.messages || [];
  const out = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: "me", id: m.id, format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });
    const h = headerMap(full.data.payload?.headers);
    out.push({
      id: m.id,
      from: h.from || "(unknown)",
      subject: h.subject || "(no subject)",
      date: h.date || "",
      snippet: full.data.snippet || "",
    });
  }
  return out;
}

// Search mail with a Gmail query string (read-only).
export async function searchEmails(query, max = 8) {
  const gmail = await gmailApi();
  const list = await gmail.users.messages.list({ userId: "me", maxResults: max, q: String(query || "") });
  const messages = list.data.messages || [];
  const out = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: "me", id: m.id, format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });
    const h = headerMap(full.data.payload?.headers);
    out.push({
      id: m.id,
      from: h.from || "(unknown)",
      subject: h.subject || "(no subject)",
      date: h.date || "",
      snippet: full.data.snippet || "",
    });
  }
  return out;
}

// Create a DRAFT reply/email. Never sends — the draft waits in Gmail for review.
export async function createDraft({ to, subject, body }) {
  const gmail = await gmailApi();
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");
  const raw = Buffer.from(lines).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
  const draft = await gmail.users.drafts.create({ userId: "me", requestBody: { message: { raw } } });
  return { draftId: draft.data.id, to, subject };
}
