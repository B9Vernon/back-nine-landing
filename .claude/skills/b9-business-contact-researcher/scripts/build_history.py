"""B9 Public Business Contact Researcher — build the deduplication index.

Scans previously returned contacts and ingested first-party lists so a new
RUN returns NEW contacts by default. Sources, in order:

  1. data/history.jsonl               (contacts returned by past RUNs)
  2. data/first_party_index.json      (ingested first-party lists)
  3. the project's prior result CSVs
  4. any extra CSV passed on the CLI

Usage:
  python build_history.py [extra_results.csv ...]

Prints a small summary; writes the merged index to data/history_index.json.
"""
from __future__ import annotations

import json
import os
import sys

from harvester import (
    load_history_from_csv,
    load_history_from_index_json,
    load_history_from_jsonl,
    merge_history,
)

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
# Repo-level CSVs that represent already-returned contacts.
DEFAULT_REPO_CSVS = [
    "back_nine_vernon_prospect_database.csv",
    "Fable 1 Contacts.csv",
]


def _repo_root() -> str:
    # skill lives at <root>/.claude/skills/<skill-name>/scripts
    return os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))


def build(extra_csvs=None) -> dict:
    histories = [
        load_history_from_jsonl(os.path.join(DATA, "history.jsonl")),
        load_history_from_index_json(os.path.join(DATA, "first_party_index.json")),
    ]
    root = _repo_root()
    for name in DEFAULT_REPO_CSVS:
        path = os.path.join(root, name)
        if os.path.exists(path):
            histories.append(load_history_from_csv(path))
    for extra in extra_csvs or []:
        histories.append(load_history_from_csv(extra))
    return merge_history(*histories)


if __name__ == "__main__":
    index = build(sys.argv[1:])
    serializable = {k: sorted(v) for k, v in index.items()}
    out_path = os.path.join(DATA, "history_index.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(serializable, fh, indent=0)
    print(json.dumps({
        "companies_known": len(index["companies"]),
        "emails_known": len(index["emails"]),
        "people_known": len(index["people"]),
        "person_company_pairs": len(index["person_company"]),
        "company_phone_pairs": len(index["company_phone"]),
        "index_written_to": out_path,
    }, indent=2))
