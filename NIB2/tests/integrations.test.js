import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-integ-"));

const { readB9, writeB9, b9Status } = await import("../lib/b9.js");
const gmail = await import("../lib/gmail.js");

// --- B9 Command Centre sync bridge ---
test("B9 reads empty when nothing synced", () => {
  const b9 = readB9();
  assert.equal(b9.data, null);
  assert.equal(b9Status().connected, false);
});

test("B9 stores and reports synced data", () => {
  writeB9({ bays: 3, bookedToday: 5 }, "manual");
  const b9 = readB9();
  assert.deepEqual(b9.data, { bays: 3, bookedToday: 5 });
  assert.ok(b9.updatedAt);
  assert.equal(b9Status().connected, true);
});

// --- Gmail availability handling (no crash when unconfigured) ---
test("Gmail reports not_configured when env vars are absent", () => {
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
  assert.equal(gmail.isConfigured(), false);
  assert.equal(gmail.isConnected(), false);
  assert.equal(gmail.gmailStatus().reason, "not_configured");
});

test("Gmail reports not_authorized when configured but no token", () => {
  process.env.GOOGLE_CLIENT_ID = "id";
  process.env.GOOGLE_CLIENT_SECRET = "secret";
  process.env.GOOGLE_REDIRECT_URI = "http://localhost:3900/api/gmail/callback";
  assert.equal(gmail.isConfigured(), true);
  assert.equal(gmail.gmailStatus().reason, "not_authorized");
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
});
