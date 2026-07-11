"""B9 Public Business Contact Researcher — adaptive source rotation.

Maintains a lightweight source-history memory (data/source_history.json) and
selects a varied source mix for each activated run. Selection is adaptive —
no fixed percentages — and favours:

  * sources not used recently
  * sources with unreviewed sections remaining
  * newly discovered sources (never used)
  * sources matching the requested industry/geography
  * sources with low previous duplicate rates
  * sources that are currently available (not failing / not cooling down)

This module only reads and writes the local history file. It performs no
network access and never runs on its own — it is invoked by the operator
during an explicit RUN.

Source-history record shape (per source):
  {
    "name": str, "url": str, "category": str,
    "last_used": "YYYY-MM-DD" | null,
    "sections_reviewed": [str],          # e.g. directory pages/letters done
    "sections_remaining": bool,          # more unreviewed sections exist?
    "useful_results": int,               # accepted contacts credited
    "duplicates": int,                   # rejected-as-duplicate count
    "failures": int,                     # access/parse failures
    "status": "ok" | "failing" | "blocked",
    "cooldown_until": "YYYY-MM-DD" | null
  }

CLI:
  python source_rotation.py select [N] [--category cat] : pick N sources (default 10)
  python source_rotation.py report                      : show history summary
  python source_rotation.py record <url> --used [--useful N] [--dupes N]
                                          [--fail] [--cooldown DAYS]
                                          [--section NAME] [--no-more-sections]
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
HISTORY_PATH = os.path.join(HERE, "..", "data", "source_history.json")
REGISTRY_PATH = os.path.join(HERE, "..", "data", "source_registry.json")


# --------------------------------------------------------------------------
# Persistence
# --------------------------------------------------------------------------

def load_history(path: str = HISTORY_PATH) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"sources": {}}


def save_history(history: dict, path: str = HISTORY_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(history, fh, indent=2, sort_keys=True)


def load_registry(path: str = REGISTRY_PATH) -> list:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh).get("candidate_sources", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _default_entry(name: str = "", url: str = "", category: str = "") -> dict:
    return {
        "name": name, "url": url, "category": category,
        "last_used": None,
        "sections_reviewed": [],
        "sections_remaining": True,
        "useful_results": 0,
        "duplicates": 0,
        "failures": 0,
        "status": "ok",
        "cooldown_until": None,
    }


def _entry_for(history: dict, url: str, name: str = "", category: str = "") -> dict:
    sources = history.setdefault("sources", {})
    if url not in sources:
        sources[url] = _default_entry(name, url, category)
    return sources[url]


# --------------------------------------------------------------------------
# Adaptive selection
# --------------------------------------------------------------------------

def _days_since(datestr, today: date) -> int:
    if not datestr:
        return 10_000  # never used -> very stale -> high priority
    try:
        return (today - date.fromisoformat(datestr)).days
    except ValueError:
        return 10_000


def _score(entry: dict, today: date, category: str = "") -> float:
    """Higher = pick sooner. Adaptive, no fixed percentages."""
    if entry.get("status") == "blocked":
        return -1.0
    cd = entry.get("cooldown_until")
    if cd:
        try:
            if date.fromisoformat(cd) > today:
                return -1.0
        except ValueError:
            pass
    score = 0.0
    # recency: not-used-recently and never-used sources float to the top
    score += min(_days_since(entry.get("last_used"), today), 60) / 6.0  # 0..10
    # unreviewed sections remain -> still productive ground
    if entry.get("sections_remaining", True):
        score += 4.0
    # usefulness vs duplicates from past runs
    used = entry.get("useful_results", 0)
    dupes = entry.get("duplicates", 0)
    total = used + dupes
    if total:
        score += 6.0 * (used / total)   # productive sources
        score -= 3.0 * (dupes / total)  # high-duplicate sources deprioritized
    else:
        score += 3.0                     # unknown sources get a fair shot
    # reliability
    score -= min(entry.get("failures", 0), 5) * 1.5
    if entry.get("status") == "failing":
        score -= 4.0
    # requested industry/geography match
    if category and category.lower() in (entry.get("category") or "").lower():
        score += 5.0
    return score


def select_sources(n: int = 10, category: str = "", today: date | None = None,
                   history: dict | None = None, registry: list | None = None) -> list:
    """Pick an adaptive, varied source mix for this run.

    Merges the candidate registry with source history (newly discovered
    sources in history but not in the registry are included too), scores
    every non-blocked source, and returns the top N with category variety:
    no category may take more than half the slots while other categories
    still have candidates.
    """
    today = today or date.today()
    history = history if history is not None else load_history()
    registry = registry if registry is not None else load_registry()

    merged: dict[str, dict] = {}
    for item in registry:
        url = item.get("url") or item.get("name", "")
        if not url:
            continue
        entry = dict(_default_entry(item.get("name", ""), item.get("url", ""),
                                    item.get("category", "")))
        entry.update(history.get("sources", {}).get(url, {}))
        entry.setdefault("name", item.get("name", ""))
        merged[url] = entry
    for url, entry in history.get("sources", {}).items():
        if url not in merged:
            merged[url] = {**_default_entry(), **entry, "url": url}

    scored = sorted(
        ((_score(e, today, category), e) for e in merged.values()),
        key=lambda t: t[0], reverse=True,
    )
    picked, per_cat = [], {}
    cap = max(2, n // 2)  # variety guard: no category hogs the run
    for s, e in scored:
        if s < 0 or len(picked) >= n:
            break
        cat = e.get("category") or "uncategorized"
        if per_cat.get(cat, 0) >= cap and any(
            s2 >= 0 and (e2.get("category") or "uncategorized") != cat
            for s2, e2 in scored if e2 not in picked
        ):
            continue
        picked.append(e)
        per_cat[cat] = per_cat.get(cat, 0) + 1
    return picked


# --------------------------------------------------------------------------
# Recording outcomes (source-history memory)
# --------------------------------------------------------------------------

def record_use(url: str, useful: int = 0, dupes: int = 0, failed: bool = False,
               cooldown_days: int = 0, section: str = "",
               more_sections: bool | None = None, name: str = "",
               category: str = "", history: dict | None = None,
               save: bool = True) -> dict:
    history = history if history is not None else load_history()
    entry = _entry_for(history, url, name, category)
    entry["last_used"] = date.today().isoformat()
    entry["useful_results"] = entry.get("useful_results", 0) + useful
    entry["duplicates"] = entry.get("duplicates", 0) + dupes
    if section and section not in entry["sections_reviewed"]:
        entry["sections_reviewed"].append(section)
    if more_sections is not None:
        entry["sections_remaining"] = more_sections
    if failed:
        entry["failures"] = entry.get("failures", 0) + 1
        entry["status"] = "failing" if entry["failures"] < 3 else "blocked"
    elif entry.get("status") == "failing":
        entry["status"] = "ok"
    if cooldown_days:
        entry["cooldown_until"] = (date.today() + timedelta(days=cooldown_days)).isoformat()
    if save:
        save_history(history)
    return entry


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    sel = sub.add_parser("select")
    sel.add_argument("n", nargs="?", type=int, default=10)
    sel.add_argument("--category", default="")

    sub.add_parser("report")

    rec = sub.add_parser("record")
    rec.add_argument("url")
    rec.add_argument("--used", action="store_true")
    rec.add_argument("--useful", type=int, default=0)
    rec.add_argument("--dupes", type=int, default=0)
    rec.add_argument("--fail", action="store_true")
    rec.add_argument("--cooldown", type=int, default=0)
    rec.add_argument("--section", default="")
    rec.add_argument("--no-more-sections", action="store_true")

    args = p.parse_args()
    if args.cmd == "select":
        picked = select_sources(args.n, args.category)
        print(json.dumps([
            {"name": e.get("name"), "url": e.get("url"),
             "category": e.get("category"), "last_used": e.get("last_used")}
            for e in picked
        ], indent=2))
    elif args.cmd == "report":
        hist = load_history()
        rows = [
            {"name": e.get("name"), "url": u, "last_used": e.get("last_used"),
             "useful": e.get("useful_results", 0), "dupes": e.get("duplicates", 0),
             "status": e.get("status"), "cooldown_until": e.get("cooldown_until")}
            for u, e in sorted(hist.get("sources", {}).items())
        ]
        print(json.dumps(rows, indent=2))
    elif args.cmd == "record":
        entry = record_use(
            args.url, useful=args.useful, dupes=args.dupes, failed=args.fail,
            cooldown_days=args.cooldown, section=args.section,
            more_sections=(False if args.no_more_sections else None),
        )
        print(json.dumps(entry, indent=2))


if __name__ == "__main__":
    main()
