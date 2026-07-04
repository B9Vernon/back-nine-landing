import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-memory-"));
const { readMemory, writeMemory, savePreference, saveEntry, getRelevantContext } = await import("../lib/memory.js");

test("readMemory returns a healthy empty shape", () => {
  const m = readMemory();
  assert.deepEqual(Object.keys(m).sort(), ["decisions", "facts", "preferences", "projects"]);
});

test("savePreference persists and appears in context", () => {
  savePreference("editor", "VS Code");
  assert.equal(readMemory().preferences.editor, "VS Code");
  assert.match(getRelevantContext(), /editor: VS Code/);
});

test("saveEntry stores facts, projects, decisions and rejects junk kinds", () => {
  saveEntry("fact", "The user has two computers");
  saveEntry("project", "NIB2 assistant");
  saveEntry("decision", "Use Express, not Next.js");
  const m = readMemory();
  assert.equal(m.facts.length, 1);
  assert.equal(m.projects.length, 1);
  assert.equal(m.decisions.length, 1);
  assert.throws(() => saveEntry("gossip", "not a real category"));
});

test("writeMemory + broken shapes heal on read", () => {
  writeMemory({ preferences: "not-an-object", facts: "nope" });
  const m = readMemory();
  assert.deepEqual(m.preferences, {});
  assert.deepEqual(m.facts, []);
});
