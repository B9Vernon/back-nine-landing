"""B9 Public Business Contact Researcher — first-party contact-list ingestion.

Ingests contact files the operator is authorized to use (CRM exports, prior
research results, membership inquiries, booking records, event registrations,
website form submissions, opted-in lists) and folds them into the
deduplication memory so those contacts are never returned as "new."

Uploaded files are used ONLY to:
  * normalize names
  * standardize emails and phone numbers
  * remove duplicates / merge matching records
  * prevent existing contacts from being returned as new

They are never used to message anyone or create outreach. Only the match
keys needed for deduplication are retained in data/first_party_index.json —
not the full uploaded records.

Usage:
  python ingest_first_party.py <file.csv> [more.csv ...]
  python ingest_first_party.py --show          # summary of current index
  python ingest_first_party.py --reset         # clear the first-party index
"""
from __future__ import annotations

import json
import os
import sys

from harvester import (
    HISTORY_KEYS,
    load_history_from_csv,
    load_history_from_index_json,
    load_history_from_jsonl,
    merge_history,
)

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(HERE, "..", "data", "first_party_index.json")


def _summary(hist: dict) -> dict:
    return {
        "companies_known": len(hist.get("companies", ())),
        "emails_known": len(hist.get("emails", ())),
        "people_known": len(hist.get("people", ())),
        "person_company_pairs": len(hist.get("person_company", ())),
        "company_phone_pairs": len(hist.get("company_phone", ())),
    }


def ingest(paths: list, index_path: str = INDEX_PATH) -> dict:
    """Merge the given files into the persistent first-party index."""
    existing = load_history_from_index_json(index_path)
    parts = [existing]
    per_file = {}
    for path in paths:
        if not os.path.exists(path):
            per_file[path] = "NOT FOUND — skipped"
            continue
        if path.lower().endswith((".jsonl", ".ndjson")):
            hist = load_history_from_jsonl(path)
        else:
            hist = load_history_from_csv(path)
        per_file[path] = _summary(hist)
        parts.append(hist)
    merged = merge_history(*parts)
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    with open(index_path, "w", encoding="utf-8") as fh:
        json.dump({k: sorted(merged[k]) for k in HISTORY_KEYS}, fh, indent=0)
    return {"files": per_file, "index_totals": _summary(merged),
            "index_path": os.path.abspath(index_path)}


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        raise SystemExit(2)
    if args[0] == "--show":
        print(json.dumps(_summary(load_history_from_index_json(INDEX_PATH)), indent=2))
        return
    if args[0] == "--reset":
        if os.path.exists(INDEX_PATH):
            os.remove(INDEX_PATH)
        print("first-party index cleared")
        return
    print(json.dumps(ingest(args), indent=2))


if __name__ == "__main__":
    main()
