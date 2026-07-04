// Session handoff summaries. Stored in data/sessions.json.
import crypto from "node:crypto";
import { readJson, writeJson } from "./store.js";

const FILE = "sessions.json";
const EMPTY = { sessions: [] };

const REQUIRED_HEADING = "Pickup Where You Left Off";

function load() {
  const data = readJson(FILE, EMPTY);
  if (!Array.isArray(data.sessions)) data.sessions = [];
  return data;
}

export function listSessions() {
  return load().sessions;
}

export function latestHandoff() {
  const s = load().sessions;
  return s.length ? s[s.length - 1] : null;
}

export function createSessionSummary(summaryText, meta = {}) {
  let summary = String(summaryText || "").trim();
  if (!summary) throw new Error("Cannot save an empty session summary.");
  // The handoff contract: every summary begins with this exact heading.
  if (!summary.includes(REQUIRED_HEADING)) {
    summary = `**${REQUIRED_HEADING}**\n\n${summary}`;
  }
  const entry = {
    id: crypto.randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    summary,
    ...meta,
  };
  const data = load();
  data.sessions.push(entry);
  writeJson(FILE, data);
  return entry;
}
