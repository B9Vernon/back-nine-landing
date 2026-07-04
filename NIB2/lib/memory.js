// NIB2 long-term memory: preferences, facts, projects, decisions.
// Stored in data/memory.json, shared by both computers through the server.
import { readJson, writeJson } from "./store.js";
import { getOpenTasks } from "./tasks.js";
import { latestHandoff } from "./sessions.js";

const FILE = "memory.json";
const EMPTY = { preferences: {}, facts: [], projects: [], decisions: [] };

export function readMemory() {
  const m = readJson(FILE, EMPTY);
  // Heal partially-broken shapes so one bad field never takes the app down.
  return {
    preferences: m.preferences && typeof m.preferences === "object" ? m.preferences : {},
    facts: Array.isArray(m.facts) ? m.facts : [],
    projects: Array.isArray(m.projects) ? m.projects : [],
    decisions: Array.isArray(m.decisions) ? m.decisions : [],
  };
}

export function writeMemory(memory) {
  writeJson(FILE, memory);
  return memory;
}

export function savePreference(key, value) {
  const m = readMemory();
  m.preferences[key] = value;
  return writeMemory(m);
}

export function saveEntry(kind, text) {
  const m = readMemory();
  const entry = { text, savedAt: new Date().toISOString() };
  if (kind === "fact") m.facts.push(entry);
  else if (kind === "project") m.projects.push(entry);
  else if (kind === "decision") m.decisions.push(entry);
  else throw new Error(`Unknown memory kind: ${kind}`);
  return writeMemory(m);
}

// Compact context string appended to NIB2's system prompt on every chat turn.
export function getRelevantContext() {
  const m = readMemory();
  const lines = [];

  const prefs = Object.entries(m.preferences);
  if (prefs.length) {
    lines.push("User preferences:");
    for (const [k, v] of prefs.slice(-20)) lines.push(`- ${k}: ${v}`);
  }
  if (m.facts.length) {
    lines.push("Known facts:");
    for (const f of m.facts.slice(-20)) lines.push(`- ${f.text}`);
  }
  if (m.projects.length) {
    lines.push("Active projects:");
    for (const p of m.projects.slice(-10)) lines.push(`- ${p.text}`);
  }
  if (m.decisions.length) {
    lines.push("Decisions made:");
    for (const d of m.decisions.slice(-10)) lines.push(`- ${d.text}`);
  }

  const open = getOpenTasks();
  if (open.length) {
    lines.push("Open tasks:");
    for (const t of open.slice(0, 15)) {
      lines.push(`- [${t.status}/${t.priority}] ${t.title} (id: ${t.id})`);
    }
  }

  const handoff = latestHandoff();
  if (handoff) {
    lines.push(`Last session handoff (${handoff.createdAt}):`);
    lines.push(handoff.summary);
  }

  return lines.length ? lines.join("\n") : "No stored memory yet.";
}
