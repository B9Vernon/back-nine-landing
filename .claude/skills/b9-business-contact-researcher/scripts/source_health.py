"""B9 Public Business Contact Researcher — source discovery & health checks.

Run at the start of each harvest to rank the current best Vernon-area sources
and to pick the most reliable *permitted* collection method for each one, in
this order: structured data -> sitemap -> RSS -> public directory -> rendered
page. It reads robots.txt and honours disallow rules; if a source rejects
automated access, it is flagged so the operator switches to another legitimate
public source instead of forcing it.

This module performs read-only HTTP GETs of public discovery endpoints
(robots.txt, sitemap.xml, feeds). It does not log in, solve CAPTCHAs, or
bypass any access control.
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlparse

USER_AGENT = "B9-EmailHarvester/1.0 (+public-business-directory research; respects robots.txt)"
TIMEOUT = 12


def _get(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.status, resp.read(200_000).decode("utf-8", "replace")


def robots_allows(base_url: str, path: str = "/") -> dict:
    """Very small robots.txt check for our user-agent / '*'.

    Returns {'reachable': bool, 'allowed': bool|None, 'sitemaps': [...]}.
    A missing robots.txt is treated as allowed (standard behaviour).
    """
    parsed = urlparse(base_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    result = {"reachable": False, "allowed": None, "sitemaps": []}
    try:
        status, body = _get(robots_url)
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError):
        # No robots.txt reachable -> default allow.
        result["allowed"] = True
        return result
    if status >= 400:
        result["allowed"] = True
        return result
    result["reachable"] = True
    disallows, applies = [], False
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, _, val = line.partition(":")
        key, val = key.strip().lower(), val.strip()
        if key == "user-agent":
            applies = val == "*" or "b9" in val.lower()
        elif key == "disallow" and applies:
            disallows.append(val)
        elif key == "sitemap":
            result["sitemaps"].append(val)
    allowed = True
    for rule in disallows:
        if rule and path.startswith(rule):
            allowed = False
            break
    result["allowed"] = allowed
    return result


def discover_methods(base_url: str) -> dict:
    """Probe a source for the best permitted collection method."""
    report = {
        "url": base_url,
        "reachable": False,
        "status": None,
        "robots_allowed": None,
        "sitemaps": [],
        "has_rss": False,
        "has_sitemap": False,
        "recommended_method": None,
        "notes": [],
    }
    robots = robots_allows(base_url)
    report["robots_allowed"] = robots["allowed"]
    report["sitemaps"] = robots["sitemaps"]
    if robots["allowed"] is False:
        report["notes"].append("robots.txt disallows this path — skip, use another source")
        report["recommended_method"] = "skip"
        return report
    try:
        status, body = _get(base_url)
        report["reachable"] = True
        report["status"] = status
    except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as exc:
        report["notes"].append(f"unreachable: {exc}")
        return report
    lowered = body.lower()
    if 'application/rss+xml' in lowered or '<rss' in lowered or '/feed' in lowered:
        report["has_rss"] = True
    # sitemap probe
    for cand in report["sitemaps"] or [urljoin(base_url, "/sitemap.xml")]:
        try:
            st, _ = _get(cand)
            if st < 400:
                report["has_sitemap"] = True
                break
        except Exception:
            continue
    if 'application/ld+json' in lowered or 'schema.org' in lowered:
        report["recommended_method"] = "structured-data"
    elif report["has_sitemap"]:
        report["recommended_method"] = "sitemap"
    elif report["has_rss"]:
        report["recommended_method"] = "rss"
    else:
        report["recommended_method"] = "rendered-page"
    return report


def check_registry(registry_path: str) -> list:
    with open(registry_path, "r", encoding="utf-8") as fh:
        registry = json.load(fh)
    out = []
    for entry in registry.get("candidate_sources", []):
        url = entry.get("url")
        if not url:
            continue
        report = discover_methods(url)
        report["name"] = entry.get("name")
        report["category"] = entry.get("category")
        out.append(report)
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python source_health.py <url|--registry path>")
        raise SystemExit(2)
    if sys.argv[1] == "--registry":
        print(json.dumps(check_registry(sys.argv[2]), indent=2))
    else:
        print(json.dumps(discover_methods(sys.argv[1]), indent=2))
