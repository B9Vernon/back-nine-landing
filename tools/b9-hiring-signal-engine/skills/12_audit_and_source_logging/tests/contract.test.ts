import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportAuditLog, logAudit } from "../index.js";
import { openDatabase } from "../../../src/database.js";

test("audit events export separately as JSONL", () => {
  const database = openDatabase(":memory:");
  logAudit(database, "import", "job", 1, "manual-csv", "accepted", { uncertainty: false });
  const folder = mkdtempSync(join(tmpdir(), "b9-audit-"));
  const output = join(folder, "audit.jsonl");
  assert.equal(exportAuditLog(database, output), 1);
  assert.match(readFileSync(output, "utf8"), /"action":"import"/);
  database.close();
  rmSync(folder, { recursive: true, force: true });
});
