"""Offline unit tests for the B9 Public Business Contact Researcher pipeline.

Run:  python -m pytest tests/  (or)  python tests/test_harvester.py
No network required. These exercise validation, normalization, dedup, the
two-email cap, CSV export, adaptive source rotation, and first-party
ingestion — the logic that keeps output clean, new-only, and honest. They use
simulated records only; no live research is performed.
"""
import datetime
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

from harvester import (  # noqa: E402
    Contact,
    classify_email,
    contacts_to_rows,
    dedup_batch,
    enforce_two_email_max,
    is_previously_returned,
    is_valid_email_syntax,
    load_history_from_csv,
    normalize_company,
    normalize_email,
    normalize_phone,
    rows_to_csv_string,
    write_csv,
)
import source_rotation  # noqa: E402
import ingest_first_party  # noqa: E402


def check(name, cond):
    assert cond, f"FAILED: {name}"
    print(f"  ok: {name}")


def test_email_syntax():
    check("valid email", is_valid_email_syntax("Jane.Doe@example.com"))
    check("trims + lowercases", normalize_email("  <Jane@Example.COM> ") == "jane@example.com")
    check("reject no-at", not is_valid_email_syntax("janeexample.com"))
    check("reject spaces", not is_valid_email_syntax("jane doe@example.com"))
    check("reject no-tld", not is_valid_email_syntax("jane@localhost"))


def test_email_classify():
    check("direct", classify_email("jane.doe@acme.ca") == "direct")
    check("role", classify_email("sales@acme.ca") == "role")
    check("general", classify_email("info@acme.ca") == "general")
    check("personal", classify_email("janedoe@gmail.com") == "personal")
    check("invalid", classify_email("nope") == "invalid")


def test_phone():
    check("formats 10-digit", normalize_phone("2504751234") == "(250) 475-1234")
    check("strips +1", normalize_phone("+1 250 475 1234") == "(250) 475-1234")
    check("keeps extension", normalize_phone("250-475-1234 ext 22") == "(250) 475-1234 x22")
    check("rejects short", normalize_phone("475-1234") == "")
    check("rejects bad area", normalize_phone("050-475-1234") == "")
    check("passthrough existing", normalize_phone("(778) 475-9146") == "(778) 475-9146")


def test_company_norm():
    check("drops Ltd", normalize_company("Acme Roofing Ltd.") == "acme roofing")
    check("drops Inc", normalize_company("Acme Roofing Inc") == "acme roofing")
    check("ampersand", normalize_company("Smith & Sons") == "smith")
    check("case+punct", normalize_company("Acme, Roofing!") == "acme roofing")
    check(
        "variants match",
        normalize_company("Acme Roofing Ltd") == normalize_company("acme roofing"),
    )


def test_two_email_cap():
    c = Contact(
        person_name="Jane Doe",
        company_name="Acme Ltd",
        emails=["jane@acme.ca", "info@acme.ca", "sales@acme.ca", "bad"],
    )
    enforce_two_email_max(c)
    check("max two emails", len(c.emails) == 2)
    check("direct first", c.emails[0] == "jane@acme.ca")
    check("drops invalid", "bad" not in c.emails)


def test_dedup_batch():
    a = Contact(person_name="Jane Doe", company_name="Acme Ltd", emails=["jane@acme.ca"])
    b = Contact(person_name="Jane Doe", company_name="Acme Inc", emails=["jane@acme.ca"])
    c = Contact(person_name="Bob Roe", company_name="Beta Co", emails=["bob@beta.ca"])
    out = dedup_batch([a, b, c])
    check("dedups by email", len(out) == 2)


def test_history_csv_and_prev():
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, encoding="utf-8") as fh:
        fh.write("business_name,contact_page_url,main_public_phone,general_public_email\n")
        fh.write("Acme Roofing Ltd,https://acme.ca,(250) 555-1000,info@acme.ca\n")
        path = fh.name
    hist = load_history_from_csv(path)
    os.unlink(path)
    check("history has company", "acme roofing" in hist["companies"])
    check("history has email", "info@acme.ca" in hist["emails"])
    check("history has company+phone", "acme roofing|(250) 555-1000" in hist["company_phone"])
    dup = Contact(company_name="Acme Roofing Inc", emails=["info@acme.ca"])
    check("detects prior email", is_previously_returned(dup, hist))
    fresh = Contact(person_name="New Person", company_name="Zeta Ltd", emails=["z@zeta.ca"])
    check("passes fresh", not is_previously_returned(fresh, hist))


def test_prev_person_company_and_phone():
    # CRM-style headers, no legacy schema
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, encoding="utf-8") as fh:
        fh.write("company,first_name,last_name,phone,email\n")
        fh.write("Beta Plumbing Ltd,Bob,Roe,250-555-2000,\n")
        path = fh.name
    hist = load_history_from_csv(path)
    os.unlink(path)
    check("person+company recorded", "bob roe|beta plumbing" in hist["person_company"])
    # same person+company but a DIFFERENT/new email -> still known (no re-return)
    dup = Contact(person_name="Bob Roe", company_name="Beta Plumbing Inc",
                  emails=["bob@betaplumbing.ca"])
    check("detects person+company", is_previously_returned(dup, hist))
    # same company + same phone, no person -> known
    dupc = Contact(company_name="Beta Plumbing", phone="(250) 555-2000")
    check("detects company+phone", is_previously_returned(dupc, hist))
    # genuinely different company, different phone -> new
    fresh = Contact(person_name="Bob Roe", company_name="Gamma Co", phone="(250) 555-9999",
                    emails=["bob@gamma.ca"])
    check("different company is new", not is_previously_returned(fresh, hist))


def test_first_party_ingestion():
    with tempfile.TemporaryDirectory() as d:
        crm = os.path.join(d, "crm.csv")
        with open(crm, "w", encoding="utf-8") as fh:
            fh.write("Company,Contact Name,Email,Phone\n")
            fh.write("Delta Signs Ltd,Dana Lee,dana@deltasigns.ca,250-555-3000\n")
        index_path = os.path.join(d, "first_party_index.json")
        result = ingest_first_party.ingest([crm], index_path=index_path)
        check("ingest counted email", result["index_totals"]["emails_known"] == 1)
        check("index file written", os.path.exists(index_path))
        from harvester import load_history_from_index_json
        hist = load_history_from_index_json(index_path)
        dup = Contact(person_name="Dana Lee", company_name="Delta Signs",
                      emails=["dana@deltasigns.ca"])
        check("ingested contact is known", is_previously_returned(dup, hist))


def test_source_rotation_selection():
    today = datetime.date(2026, 1, 15)
    registry = [
        {"name": "Chamber", "url": "https://a.test", "category": "chamber_directory"},
        {"name": "News", "url": "https://b.test", "category": "local_news"},
        {"name": "Tourism", "url": "https://c.test", "category": "tourism_directory"},
        {"name": "Muni", "url": "https://d.test", "category": "municipal"},
    ]
    history = {"sources": {
        # used yesterday, high duplicate rate -> should rank low
        "https://a.test": {"last_used": "2026-01-14", "useful_results": 1,
                           "duplicates": 20, "sections_remaining": False},
        # blocked -> excluded
        "https://b.test": {"status": "blocked"},
    }}
    picked = source_rotation.select_sources(2, today=today, history=history, registry=registry)
    urls = [e["url"] for e in picked]
    check("excludes blocked source", "https://b.test" not in urls)
    check("fresh sources preferred over stale-duplicative",
          "https://a.test" not in urls)
    check("returns requested count", len(picked) == 2)
    # category filter boosts matching category into the top slot
    picked_cat = source_rotation.select_sources(1, category="municipal", today=today,
                                                history=history, registry=registry)
    check("category filter honored", picked_cat[0]["url"] == "https://d.test")


def test_source_rotation_record():
    with tempfile.TemporaryDirectory() as d:
        hist_path = os.path.join(d, "source_history.json")
        source_rotation.record_use("https://x.test", useful=3, dupes=1,
                                    section="A-F", history=source_rotation.load_history(hist_path),
                                    save=False)
        # persist path variant
        h = source_rotation.load_history(hist_path)
        source_rotation.record_use("https://x.test", useful=3, dupes=1, section="A-F",
                                   history=h, save=False)
        source_rotation.save_history(h, hist_path)
        reloaded = source_rotation.load_history(hist_path)
        entry = reloaded["sources"]["https://x.test"]
        check("records useful", entry["useful_results"] == 3)
        check("records section", "A-F" in entry["sections_reviewed"])


def test_output_and_csv():
    c1 = Contact(person_name="Jane Doe", company_name="Acme Ltd", phone="(250) 475-1234",
                 emails=["jane@acme.ca", "info@acme.ca"])
    c2 = Contact(company_name="Beta Co", phone="(250) 555-0000", emails=["hello@beta.ca"])
    rows = contacts_to_rows([c1, c2])
    check("name has em-dash", rows[0]["Name"] == "Jane Doe — Acme Ltd")
    check("company-only name", rows[1]["Name"] == "Beta Co")
    check("emails semicolon-joined", rows[0]["Email"] == "jane@acme.ca; info@acme.ca")
    csv_str = rows_to_csv_string([c1, c2])
    check("csv header exact", csv_str.splitlines()[0] == "Name,Phone,Email")
    with tempfile.NamedTemporaryFile("r", suffix=".csv", delete=False) as fh:
        out_path = fh.name
    write_csv([c1, c2], out_path)
    with open(out_path, encoding="utf-8") as fh:
        content = fh.read()
    os.unlink(out_path)
    check("file written with 3 cols", content.splitlines()[0] == "Name,Phone,Email")


def main():
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        print(t.__name__)
        t()
    print(f"\nAll {len(tests)} test groups passed.")


if __name__ == "__main__":
    main()
