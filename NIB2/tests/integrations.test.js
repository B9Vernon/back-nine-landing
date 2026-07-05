import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-integ-"));

const gmail = await import("../lib/gmail.js");

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
