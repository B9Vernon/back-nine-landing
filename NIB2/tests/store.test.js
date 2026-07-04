import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-store-"));
const { readJson, writeJson, dataPath } = await import("../lib/store.js");

test("readJson creates the file with fallback when missing", () => {
  const result = readJson("fresh.json", { hello: "world" });
  assert.deepEqual(result, { hello: "world" });
  assert.ok(fs.existsSync(dataPath("fresh.json")));
});

test("writeJson then readJson round-trips data", () => {
  writeJson("round.json", { n: 42, list: [1, 2, 3] });
  assert.deepEqual(readJson("round.json", {}), { n: 42, list: [1, 2, 3] });
});

test("corrupt JSON is quarantined and fallback returned — no crash", () => {
  fs.writeFileSync(dataPath("broken.json"), "{ this is not json !!!", "utf8");
  const result = readJson("broken.json", { safe: true });
  assert.deepEqual(result, { safe: true });
  // A .corrupt-*.bak quarantine file should exist
  const backups = fs.readdirSync(process.env.NIB2_DATA_DIR).filter((f) => f.includes("corrupt"));
  assert.ok(backups.length >= 1, "expected a quarantined backup file");
});
