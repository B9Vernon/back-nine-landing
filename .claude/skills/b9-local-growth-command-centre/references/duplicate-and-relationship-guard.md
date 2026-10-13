# Duplicate and Relationship Guard (shared skill)

Run this guard before any module creates a new prospect or writes a new email.

## What it prevents

- Creating duplicate prospects.
- Emailing the same business with multiple unrelated angles too close together.
- Treating an active partner as a cold lead.
- Sending a generic message to a relationship that already exists.
- Reusing the same pitch repeatedly.
- Contacting a bad-fit business again unless Neil requests it.

## How to check

Before adding any contact, check ALL of these sources for an existing record:

1. `B9_Growth_Database.csv` (repo root) — the shared cross-engine ledger. This
   Command Centre reads AND writes here, and it's the file the other independent B9
   engines (Partnership Engine, Vacation Rental Engine, any future engine) are asked to
   read and write to as well — see `cross-engine-sync.md`. This is what lets separate,
   independent engines avoid duplicating or re-cold-pitching each other's contacts.
2. `back_nine_vernon_prospect_database.csv` (repo root) — legacy Partnership Engine
   database. Read-only duplicate-check source; never modify or delete it.
3. `Fable 1 Contacts.csv` (repo root) — legacy contact list. Read-only duplicate-check
   source; never modify or delete it.

Match on business/organization name (case-insensitive, ignoring punctuation and
suffixes like Ltd/Inc), website domain, and email address. Any one match counts.

## What to do on a match

- Contact exists → update the existing record in the B9 Growth Database instead of
  creating a duplicate. If it only exists in a legacy CSV, create the Growth Database
  record but mark `duplicate_status` = `legacy - already contacted via Partnership
  Engine` and check with Neil before drafting a new cold email.
- Prospect appears in multiple modules → merge the information into one record and
  add the new opportunity angle to it (e.g., a SilverStar lodge found by the Vacation
  Rental Module later linked to a SilverStar event gets the event added to its
  existing record — no second record).
- Status is `active partner` → never draft a cold email. Suggest a warmer
  relationship-based message instead.
- Status is `bad fit` or `not interested` → skip unless Neil explicitly requests it.
- Uncertainty about whether two records are the same entity → mark it
  `POSSIBLE DUPLICATE` and flag it for Neil rather than guessing.
