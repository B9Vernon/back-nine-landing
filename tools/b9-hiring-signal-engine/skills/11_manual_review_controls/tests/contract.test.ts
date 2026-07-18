import test from "node:test";
import assert from "node:assert/strict";
import { approveCompanies } from "../index.js";
import { openDatabase, nowIso } from "../../../src/database.js";

test("review approval requires an exportable contact unless explicitly overridden", () => {
  const database = openDatabase(":memory:");
  const insert = database.prepare(`INSERT INTO companies (canonical_name, normalized_name, contact_type, contact_value, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'contact_found', ?, ?)`);
  insert.run("Email Co", "email", "email", "info@email.example", nowIso(), nowIso());
  insert.run("No Contact Co", "none", "", "", nowIso(), nowIso());
  const result = approveCompanies(database, { all: true });
  assert.deepEqual(result, { approved: 1, skipped: 1 });
  database.close();
});
