// Safe JSON file storage. Corrupt files are quarantined (renamed) instead of
// crashing the app; writes go to a temp file first so a crash mid-write never
// destroys existing data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.NIB2_DATA_DIR || path.join(__dirname, "..", "data");

export function dataPath(name) {
  return path.join(DATA_DIR, name);
}

export function readJson(file, fallback) {
  const full = dataPath(file);
  try {
    if (!fs.existsSync(full)) {
      writeJson(file, fallback);
      return structuredClone(fallback);
    }
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    // Broken JSON: quarantine the bad file, start fresh, keep the app alive.
    try {
      const backup = `${full}.corrupt-${Date.now()}.bak`;
      fs.renameSync(full, backup);
      console.warn(`NIB2: ${file} was corrupt. Quarantined to ${path.basename(backup)} and reset.`);
    } catch { /* quarantine is best-effort */ }
    writeJson(file, fallback);
    return structuredClone(fallback);
  }
}

export function writeJson(file, data) {
  const full = dataPath(file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const tmp = `${full}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, full);
}
