import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EngineDatabase } from "./database.js";
import { nowIso } from "./database.js";

export function logAudit(
  database: EngineDatabase,
  action: string,
  entityType: string,
  entityId: string | number,
  source: string,
  outcome: string,
  details: Record<string, unknown> = {},
): void {
  database
    .prepare(
      `INSERT INTO audit_log
       (occurred_at, action, entity_type, entity_id, source, outcome, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(nowIso(), action, entityType, String(entityId), source, outcome, JSON.stringify(details));
}

export function exportAuditLog(database: EngineDatabase, outputPath: string): number {
  const rows = database
    .prepare("SELECT occurred_at, action, entity_type, entity_id, source, outcome, details FROM audit_log ORDER BY id")
    .all() as Array<Record<string, unknown>>;
  mkdirSync(dirname(outputPath), { recursive: true });
  const body = rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : "");
  writeFileSync(outputPath, body, "utf8");
  return rows.length;
}
