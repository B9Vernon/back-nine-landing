import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_DATABASE, PROJECT_ROOT } from "./config.js";

export type EngineDatabase = DatabaseSync;

export function resolveDatabasePath(value?: string): string {
  if (!value) return DEFAULT_DATABASE;
  return resolve(PROJECT_ROOT, value);
}

export function openDatabase(path = DEFAULT_DATABASE): EngineDatabase {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  initializeSchema(database);
  return database;
}

export function initializeSchema(database: EngineDatabase): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY,
      fingerprint TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      normalized_company TEXT NOT NULL,
      job_title TEXT NOT NULL,
      job_location TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL,
      source_url TEXT NOT NULL DEFAULT '',
      posting_date TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      signal_types TEXT NOT NULL DEFAULT '[]',
      multiple_active INTEGER NOT NULL DEFAULT 0,
      raw_text TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      company_description TEXT NOT NULL DEFAULT '',
      public_email TEXT NOT NULL DEFAULT '',
      contact_url TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      latitude REAL,
      longitude REAL,
      distance_km REAL,
      location_uncertain INTEGER NOT NULL DEFAULT 1,
      accepted INTEGER NOT NULL DEFAULT 0,
      rejection_reason TEXT NOT NULL DEFAULT '',
      review_status TEXT NOT NULL DEFAULT 'pending',
      imported_at TEXT NOT NULL,
      source_file TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS jobs_company_idx ON jobs(normalized_company);
    CREATE INDEX IF NOT EXISTS jobs_acceptance_idx ON jobs(accepted, distance_km);

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY,
      canonical_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      website TEXT NOT NULL DEFAULT '',
      domain TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      research_summary TEXT NOT NULL DEFAULT '',
      research_sources TEXT NOT NULL DEFAULT '[]',
      distance_km REAL,
      location_uncertain INTEGER NOT NULL DEFAULT 1,
      category TEXT NOT NULL DEFAULT 'other',
      classification TEXT NOT NULL DEFAULT '[]',
      offers TEXT NOT NULL DEFAULT '[]',
      contact_type TEXT NOT NULL DEFAULT '',
      contact_value TEXT NOT NULL DEFAULT '',
      contact_source TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT NOT NULL DEFAULT '',
      review_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_jobs (
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      PRIMARY KEY (company_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS generated_emails (
      company_id INTEGER PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      generated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY,
      occurred_at TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      outcome TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_log(entity_type, entity_id);
  `);
}

export function nowIso(): string {
  return new Date().toISOString();
}
