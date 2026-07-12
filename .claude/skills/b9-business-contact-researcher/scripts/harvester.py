"""B9 Public Business Contact Researcher — core library.

Pure, dependency-free helpers used during a harvest RUN for validation,
normalization, deduplication, provenance, and CSV export. Network-dependent
verification (MX lookups, source health) lives in separate modules so this
one stays testable offline.

Nothing in this module collects contacts. It only processes data that the
operator has already gathered from public sources during an explicit RUN.
"""
from __future__ import annotations

import csv
import io
import json
import re
from dataclasses import dataclass, field, asdict
from datetime import date
from typing import Iterable, Optional

# --------------------------------------------------------------------------
# Email validation & classification
# --------------------------------------------------------------------------

# Deliberately conservative RFC-ish pattern. We validate syntax only; we never
# probe an inbox or send mail to confirm deliverability.
_EMAIL_RE = re.compile(
    r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@"
    r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,}$"
)

PERSONAL_DOMAINS = {
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
    "yahoo.com", "ymail.com", "icloud.com", "me.com", "aol.com", "proton.me",
    "protonmail.com", "shaw.ca", "telus.net", "gmx.com",
}

# Local-parts that indicate a role/management address rather than a person.
ROLE_LOCALPARTS = {
    "info", "contact", "hello", "office", "admin", "sales", "reception",
    "enquiries", "inquiries", "bookings", "reservations", "events",
    "management", "manager", "gm", "owner", "frontdesk", "front.desk",
    "team", "mail", "general", "service", "customerservice", "support",
    "accounts", "accounting", "hr", "careers", "jobs", "marketing",
    "partnerships",
}


def normalize_email(email: str) -> str:
    return (email or "").strip().strip("<>").lower()


def is_valid_email_syntax(email: str) -> bool:
    email = normalize_email(email)
    if not email or len(email) > 254:
        return False
    return bool(_EMAIL_RE.match(email))


def email_domain(email: str) -> str:
    email = normalize_email(email)
    return email.split("@", 1)[1] if "@" in email else ""


def email_localpart(email: str) -> str:
    email = normalize_email(email)
    return email.split("@", 1)[0] if "@" in email else ""


def is_personal_domain(email: str) -> bool:
    return email_domain(email) in PERSONAL_DOMAINS


def classify_email(email: str) -> str:
    """Return one of: 'direct', 'role', 'general', 'personal', 'invalid'.

    'direct'   -> named person on a company domain (priority 1/2)
    'role'     -> role/management address on a company domain (priority 3)
    'general'  -> company-domain catch-all like info@ (priority 4)
    'personal' -> gmail/outlook/etc; only usable if explicitly published as a
                  business contact (operator judgement, flagged here)
    'invalid'  -> fails syntax
    """
    if not is_valid_email_syntax(email):
        return "invalid"
    local = email_localpart(email)
    base = local.split("+", 1)[0]
    if is_personal_domain(email):
        return "personal"
    if base in ROLE_LOCALPARTS or base in {"info", "general", "contact"}:
        # role vs general: info/contact/general read as company catch-alls
        if base in {"info", "contact", "hello", "mail", "general", "office"}:
            return "general"
        return "role"
    return "direct"


# --------------------------------------------------------------------------
# Phone normalization (Canada / US, NANP)
# --------------------------------------------------------------------------

def normalize_phone(raw: str) -> str:
    """Standardize a North American phone number to '(NXX) NXX-XXXX'.

    Returns '' if the input does not look like a NANP number. Extensions are
    preserved as ' x123' when present.
    """
    if not raw:
        return ""
    ext = ""
    m = re.search(r"(?:ext\.?|x|#)\s*(\d{1,6})\s*$", raw, re.IGNORECASE)
    if m:
        ext = f" x{m.group(1)}"
        raw = raw[: m.start()]
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) != 10:
        return ""
    area, prefix, line = digits[:3], digits[3:6], digits[6:]
    # NANP: area and exchange codes cannot start with 0 or 1.
    if area[0] in "01" or prefix[0] in "01":
        return ""
    return f"({area}) {prefix}-{line}{ext}"


# --------------------------------------------------------------------------
# Company / entity normalization for deduplication
# --------------------------------------------------------------------------

_LEGAL_SUFFIXES = [
    "ltd", "ltd.", "limited", "inc", "inc.", "incorporated", "llc", "llp",
    "corp", "corp.", "corporation", "co", "co.", "company", "gmbh", "plc",
    "and sons", "& sons", "enterprises", "holdings", "group",
]
_AMPERSAND = re.compile(r"\s*&\s*")
_PUNCT = re.compile(r"[^\w\s]")
_WS = re.compile(r"\s+")


def normalize_company(name: str) -> str:
    """Collapse legal name / operating name / spelling variants to one key."""
    if not name:
        return ""
    s = name.lower().strip()
    s = _AMPERSAND.sub(" and ", s)
    s = _PUNCT.sub(" ", s)
    s = _WS.sub(" ", s).strip()
    tokens = s.split()
    while tokens and tokens[-1] in {t.replace(".", "") for t in _LEGAL_SUFFIXES}:
        tokens.pop()
    # also drop multiword suffixes
    joined = " ".join(tokens)
    for suf in ("and sons", "enterprises", "holdings", "group"):
        if joined.endswith(" " + suf):
            joined = joined[: -(len(suf) + 1)].strip()
    return joined


def normalize_person(name: str) -> str:
    if not name:
        return ""
    s = name.lower().strip()
    s = _PUNCT.sub(" ", s)
    return _WS.sub(" ", s).strip()


# --------------------------------------------------------------------------
# Contact records & provenance
# --------------------------------------------------------------------------

@dataclass
class Contact:
    """A candidate contact plus hidden provenance (never shown in output)."""
    person_name: str = ""
    company_name: str = ""
    title: str = ""
    phone: str = ""
    emails: list = field(default_factory=list)          # up to 2
    # hidden provenance
    company_website: str = ""
    name_source: str = ""
    title_source: str = ""
    email_sources: dict = field(default_factory=dict)   # email -> source url
    phone_source: str = ""
    email_kinds: dict = field(default_factory=dict)     # email -> classify_email
    date_checked: str = field(default_factory=lambda: date.today().isoformat())
    confidence: str = "medium"                            # low/medium/high

    def output_name(self) -> str:
        if self.person_name and self.company_name:
            return f"{self.person_name} — {self.company_name}"
        return self.company_name or self.person_name

    def output_email(self) -> str:
        return "; ".join(self.emails[:2])

    def company_key(self) -> str:
        return normalize_company(self.company_name)

    def person_key(self) -> str:
        return normalize_person(self.person_name)

    def to_provenance(self) -> dict:
        return asdict(self)


def enforce_two_email_max(contact: Contact) -> Contact:
    """Keep at most two emails, best-first by priority, drop weak duplicates."""
    priority = {"direct": 0, "role": 1, "general": 2, "personal": 3, "invalid": 9}
    seen = set()
    ranked = []
    for e in contact.emails:
        ne = normalize_email(e)
        if not ne or ne in seen:
            continue
        seen.add(ne)
        kind = contact.email_kinds.get(ne) or classify_email(ne)
        if kind == "invalid":
            continue
        ranked.append((priority.get(kind, 5), ne))
    ranked.sort(key=lambda t: t[0])
    contact.emails = [e for _, e in ranked[:2]]
    return contact


# --------------------------------------------------------------------------
# History / deduplication
# --------------------------------------------------------------------------

HISTORY_KEYS = ("companies", "emails", "people", "person_company", "company_phone")


def _empty_history() -> dict:
    return {k: set() for k in HISTORY_KEYS}


def _index_record(hist: dict, person: str, company: str, phone: str, emails) -> None:
    """Add one prior/first-party record's match keys to a history dict."""
    pk = normalize_person(person)
    ck = normalize_company(company)
    ph = normalize_phone(phone)
    if ck:
        hist["companies"].add(ck)
    if pk:
        hist["people"].add(pk)
    if pk and ck:
        hist["person_company"].add(f"{pk}|{ck}")
    if ck and ph:
        hist["company_phone"].add(f"{ck}|{ph}")
    for e in emails:
        ne = normalize_email(e)
        if ne:
            hist["emails"].add(ne)


def load_history_from_csv(path: str) -> dict:
    """Read a prior-results or first-party CSV into dedup index sets.

    Tolerant of several schemas: the project's legacy schema
    (business_name, contact_page_url, main_public_phone, general_public_email),
    the visible-output schema (Name, Phone, Email), and common CRM-export
    headers (company/organization, first/last name, email, phone).
    Returns a dict with the HISTORY_KEYS sets.
    """
    hist = _empty_history()
    try:
        with open(path, "r", encoding="utf-8-sig", newline="") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                # Normalize headers: lowercase, and treat spaces/hyphens as
                # underscores so "First Name" / "Phone Number" match too.
                norm = {
                    re.sub(r"[\s-]+", "_", (k or "").strip().lower()): (v or "").strip()
                    for k, v in row.items()
                }
                biz = (
                    norm.get("business_name") or norm.get("company")
                    or norm.get("company_name") or norm.get("organization")
                    or norm.get("name") or ""
                )
                person = (
                    norm.get("person_name") or norm.get("contact_name")
                    or norm.get("full_name") or ""
                )
                if not person and (norm.get("first_name") or norm.get("last_name")):
                    person = f"{norm.get('first_name', '')} {norm.get('last_name', '')}".strip()
                # "Name" output rows may be "Person — Company"
                if "—" in biz:
                    p, _, comp = biz.partition("—")
                    person = person or p
                    biz = comp
                phone = (
                    norm.get("main_public_phone") or norm.get("phone")
                    or norm.get("phone_number") or norm.get("telephone") or ""
                )
                email_field = (
                    norm.get("general_public_email") or norm.get("email")
                    or norm.get("email_address") or ""
                )
                emails = [e for e in re.split(r"[;,]", email_field) if e.strip()]
                _index_record(hist, person, biz, phone, emails)
    except FileNotFoundError:
        pass
    return hist


def load_history_from_jsonl(path: str) -> dict:
    hist = _empty_history()
    try:
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                rec = json.loads(line)
                _index_record(
                    hist,
                    rec.get("person_name", ""),
                    rec.get("company_name", ""),
                    rec.get("phone", ""),
                    rec.get("emails", []),
                )
    except FileNotFoundError:
        pass
    return hist


def load_history_from_index_json(path: str) -> dict:
    """Load a saved index (e.g. data/first_party_index.json) back into sets."""
    hist = _empty_history()
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        for k in HISTORY_KEYS:
            hist[k] = set(data.get(k, []))
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return hist


def merge_history(*histories: dict) -> dict:
    out = _empty_history()
    for h in histories:
        for k in out:
            out[k] |= h.get(k, set())
    return out


def is_previously_returned(contact: Contact, history: dict) -> bool:
    """True if this contact is already known and must not be returned as new.

    A contact counts as previously known when ANY of these match prior
    results or an ingested first-party list:
      - an email address (this also covers the company fallback email)
      - person AND company together
      - normalized company AND phone
      - a company-only row for a company already returned
    """
    for e in contact.emails:
        if normalize_email(e) in history.get("emails", set()):
            return True
    pk, ck = contact.person_key(), contact.company_key()
    if pk and ck and f"{pk}|{ck}" in history.get("person_company", set()):
        return True
    ph = normalize_phone(contact.phone)
    if ck and ph and f"{ck}|{ph}" in history.get("company_phone", set()):
        return True
    if ck and not contact.person_name and ck in history.get("companies", set()):
        # company-only row already returned before
        return True
    return False


def dedup_batch(contacts: Iterable[Contact]) -> list:
    """Remove within-batch duplicates by company+email+person."""
    seen_company, seen_email, seen_person, out = set(), set(), set(), []
    for c in contacts:
        ck, pk = c.company_key(), c.person_key()
        eks = {normalize_email(e) for e in c.emails}
        if eks & seen_email:
            continue
        if pk and pk in seen_person:
            continue
        if ck and not c.person_name and ck in seen_company:
            continue
        out.append(c)
        seen_company.add(ck)
        seen_email |= eks
        if pk:
            seen_person.add(pk)
    return out


# --------------------------------------------------------------------------
# CSV export (visible schema only: Name, Phone, Email)
# --------------------------------------------------------------------------

def contacts_to_rows(contacts: Iterable[Contact]) -> list:
    return [
        {"Name": c.output_name(), "Phone": c.phone, "Email": c.output_email()}
        for c in contacts
    ]


def write_csv(contacts: Iterable[Contact], path: str) -> str:
    rows = contacts_to_rows(contacts)
    with open(path, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["Name", "Phone", "Email"])
        writer.writeheader()
        writer.writerows(rows)
    return path


def rows_to_csv_string(contacts: Iterable[Contact]) -> str:
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=["Name", "Phone", "Email"])
    writer.writeheader()
    writer.writerows(contacts_to_rows(contacts))
    return buf.getvalue()
