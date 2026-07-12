"""B9 Public Business Contact Researcher — export contacts to a downloadable CSV.

Input: a JSON file (or stdin) that is a list of contact objects with keys
matching the Contact dataclass (person_name, company_name, phone, emails, ...).
Output: a CSV with EXACTLY three columns — Name, Phone, Email — where Name is
"Person Name — Company Name" (or just the company when no person is verified),
and two emails are joined with "; ".

Usage:
  python export_csv.py contacts.json out.csv
  cat contacts.json | python export_csv.py - out.csv
"""
from __future__ import annotations

import json
import sys

from harvester import Contact, enforce_two_email_max, normalize_phone, write_csv


def load_contacts(raw: str) -> list:
    data = json.loads(raw)
    contacts = []
    for item in data:
        raw_phone = item.get("phone", "")
        c = Contact(
            person_name=item.get("person_name", ""),
            company_name=item.get("company_name", ""),
            title=item.get("title", ""),
            # standardize the phone; keep the original if it can't be parsed
            phone=normalize_phone(raw_phone) or raw_phone,
            emails=list(item.get("emails", [])),
            email_kinds=item.get("email_kinds", {}),
        )
        enforce_two_email_max(c)
        contacts.append(c)
    return contacts


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: python export_csv.py <contacts.json|-> <out.csv>")
        raise SystemExit(2)
    src, out = sys.argv[1], sys.argv[2]
    raw = sys.stdin.read() if src == "-" else open(src, encoding="utf-8").read()
    contacts = load_contacts(raw)
    write_csv(contacts, out)
    print(f"wrote {len(contacts)} contacts to {out}")
