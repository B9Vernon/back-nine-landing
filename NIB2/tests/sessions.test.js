import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-sessions-"));
const { createSessionSummary, listSessions, latestHandoff } = await import("../lib/sessions.js");

test("createSessionSummary saves and enforces the required heading", () => {
  const entry = createSessionSummary("Did some work. Next: do more work.");
  assert.match(entry.summary, /Pickup Where You Left Off/);
  assert.equal(listSessions().length, 1);
});

test("summaries that already have the heading are not double-prefixed", () => {
  const text = "**Pickup Where You Left Off**\n\nAll done.";
  const entry = createSessionSummary(text);
  const occurrences = entry.summary.split("Pickup Where You Left Off").length - 1;
  assert.equal(occurrences, 1);
});

test("empty summaries are rejected", () => {
  assert.throws(() => createSessionSummary("   "));
});

test("latestHandoff returns the most recent entry", () => {
  createSessionSummary("Newest summary");
  assert.match(latestHandoff().summary, /Newest summary/);
});
