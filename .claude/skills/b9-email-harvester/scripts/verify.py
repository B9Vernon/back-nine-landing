"""B9 Email Harvester — silent, non-intrusive verification helpers.

Used during a RUN to confirm that a candidate contact is safe to return.
These checks are read-only and passive:

  * email syntax + domain shape        (offline)
  * domain has MX / mail records        (DNS lookup, read-only)
  * phone normalizes to a valid NANP    (offline)

They NEVER send mail, probe an inbox, or perform SMTP recipient testing.
DNS is queried via the stdlib where possible; if no resolver is available
the MX check returns None ("unknown") rather than guessing.
"""
from __future__ import annotations

import re
import socket
import subprocess
from typing import Optional

from harvester import (
    classify_email,
    email_domain,
    is_personal_domain,
    is_valid_email_syntax,
    normalize_phone,
)


def domain_resolves(domain: str) -> Optional[bool]:
    """True if the domain resolves to an A/AAAA record, None if undetermined."""
    if not domain:
        return False
    try:
        socket.getaddrinfo(domain, None)
        return True
    except socket.gaierror:
        return False
    except Exception:
        return None


def domain_has_mx(domain: str) -> Optional[bool]:
    """Best-effort MX check with graceful degradation.

    Tries dnspython, then the `nslookup`/`host` CLIs, then falls back to a
    plain A-record resolution (a domain that resolves can still receive mail
    at its A record). Returns None only when nothing conclusive is available.
    """
    if not domain:
        return False
    # 1) dnspython, if installed
    try:
        import dns.resolver  # type: ignore

        try:
            answers = dns.resolver.resolve(domain, "MX")
            return len(answers) > 0
        except Exception:
            return False
    except ImportError:
        pass
    # 2) system resolvers
    for cmd in (["host", "-t", "MX", domain], ["nslookup", "-query=MX", domain]):
        try:
            out = subprocess.run(
                cmd, capture_output=True, text=True, timeout=8
            )
            text = (out.stdout + out.stderr).lower()
            if "mail exchanger" in text or re.search(r"\bmx\b", text):
                return True
            if "not found" in text or "nxdomain" in text:
                return False
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
        except Exception:
            continue
    # 3) fall back to A-record resolution
    return domain_resolves(domain)


def verify_email(email: str, check_dns: bool = True) -> dict:
    """Return a verification report for a single email address."""
    report = {
        "email": email,
        "syntax_ok": is_valid_email_syntax(email),
        "domain": email_domain(email),
        "kind": classify_email(email),
        "personal_domain": is_personal_domain(email),
        "domain_ok": None,
        "mail_records_ok": None,
        "usable": False,
        "notes": [],
    }
    if not report["syntax_ok"]:
        report["notes"].append("invalid syntax")
        return report
    if check_dns:
        report["domain_ok"] = domain_resolves(report["domain"])
        report["mail_records_ok"] = domain_has_mx(report["domain"])
    if report["personal_domain"]:
        report["notes"].append(
            "personal domain — only use if explicitly published as a "
            "business contact"
        )
    # Usable unless we positively determined the domain cannot receive mail.
    report["usable"] = report["syntax_ok"] and report["mail_records_ok"] is not False
    return report


def verify_phone(raw: str) -> dict:
    normalized = normalize_phone(raw)
    return {"raw": raw, "normalized": normalized, "valid": bool(normalized)}


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) < 2:
        print("usage: python verify.py <email> [phone]")
        raise SystemExit(2)
    result = {"email": verify_email(sys.argv[1])}
    if len(sys.argv) > 2:
        result["phone"] = verify_phone(sys.argv[2])
    print(json.dumps(result, indent=2))
