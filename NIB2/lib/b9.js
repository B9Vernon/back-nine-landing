// B9 Command Centre bridge.
//
// The "B9 Command Centre" is a Claude Live Artifact. Artifacts run sandboxed
// inside claude.ai and expose NO external API — a separate app like NIB2 cannot
// read a live artifact's state directly. Rather than fake a connection, NIB2
// reads a local sync file that YOU populate: data/b9-command-centre.json.
//
// How to feed it (any of these):
//   1. Manual: paste the artifact's current data/JSON into the sync file.
//   2. Export: have the artifact output JSON, save it to the sync file.
//   3. Future: point a real API/webhook at POST /api/b9 to push updates.
//
// NIB2 then reads it via the get_b9_data tool and the dashboard B9 panel.

import { readJson, writeJson, dataPath } from "./store.js";
import fs from "node:fs";

const FILE = "b9-command-centre.json";

const EMPTY = {
  updatedAt: null,
  source: "manual",
  data: null,
};

export function readB9() {
  // Only auto-create the file if it truly doesn't exist yet.
  if (!fs.existsSync(dataPath(FILE))) writeJson(FILE, EMPTY);
  const b9 = readJson(FILE, EMPTY);
  return {
    updatedAt: b9.updatedAt ?? null,
    source: b9.source ?? "manual",
    data: b9.data ?? null,
  };
}

// Overwrite the sync file (used by POST /api/b9 for webhook/manual push).
export function writeB9(data, source = "manual") {
  const entry = { updatedAt: new Date().toISOString(), source: String(source), data };
  writeJson(FILE, entry);
  return entry;
}

export function b9Status() {
  const b9 = readB9();
  return {
    connected: b9.data !== null,
    updatedAt: b9.updatedAt,
    source: b9.source,
  };
}
