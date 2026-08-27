#!/usr/bin/env python3
"""Verify a finished prospect TXT against every locked rule. Run before delivery.

This is the checklist that was previously re-derived from memory on every
run. It catches, in one command, every defect class that has actually
occurred in runs 1-8:

  * entries lost mid-write (run 3 silently dropped entries 76-100)
  * duplicate businesses vs. the log and within the file
  * missing or malformed footer links
  * greetings that lost the recipient's name
  * TV sentences that drifted off the locked wording, or that read as a
    free giveaway
  * regex-surgery scars from bulk edits (doubled spaces, orphaned commas,
    sentences ending mid-clause, unsubstituted {placeholders})
  * typed signature blocks, which the locked rules forbid

Usage:
    python3 tools/verify_deliverable.py "#9-B9-Partnerships.txt"
    python3 tools/verify_deliverable.py FILE --expect 200

Exit code is 0 only when every check passes.
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import (LINK, LOCKED_TV, LOCKED_TV_FAR, normalize,  # noqa: E402
                   normalize_strict, same_business, load_log,
                   identity, duplicate_reason, load_ledger,
                   contact_channel)

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')
DEFAULT_LEDGER = os.path.join(HERE, '..', 'state', 'ledger.jsonl')

# Abbreviations that legitimately end in "." mid-sentence, so the
# sentence-fragment scan does not flag them.
ABBREV = r'(?:Co|Ltd|Inc|St|Ave|Dr|Rd|Mr|Mrs|Ms|Jr|Sr|No|Dept|Est)'


class Report:
    def __init__(self):
        self.fails, self.warns, self.notes = [], [], []

    def check(self, ok, label, detail=''):
        (self.notes if ok else self.fails).append((label, detail))

    def warn(self, ok, label, detail=''):
        (self.notes if ok else self.warns).append((label, detail))

    def render(self):
        for label, detail in self.notes:
            print(f'  PASS  {label}' + (f' — {detail}' if detail else ''))
        for label, detail in self.warns:
            print(f'  WARN  {label}' + (f' — {detail}' if detail else ''))
        for label, detail in self.fails:
            print(f'  FAIL  {label}' + (f' — {detail}' if detail else ''))
        print()
        if self.fails:
            print(f'{len(self.fails)} check(s) FAILED — do not deliver this file yet.')
        elif self.warns:
            print(f'All checks passed with {len(self.warns)} warning(s) to eyeball.')
        else:
            print('All checks passed.')
        return 1 if self.fails else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--expect', type=int, help='expected number of entries')
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--ledger', default=DEFAULT_LEDGER)
    ap.add_argument('--email-only', action='store_true',
                    help='fail unless every To: line is a real email address. '
                         'This was the standing rule for runs 12-18 and is now '
                         'OPT-IN: it cut prospect counts from 200-250 a run to '
                         'single digits by discarding every business that '
                         'publishes a form or a phone number instead.')
    ap.add_argument('--logged-as', metavar='RUN_TAG',
                    help='this file is already logged under RUN_TAG; ignore its '
                         'own rows when checking for log overlap (use when '
                         're-verifying a delivered file)')
    ap.add_argument('--second-contact', action='store_true',
                    help='this file is a follow-up / second-touch batch, not '
                         'initial outreach. INVERTS the duplicate check: every '
                         'entry must ALREADY be in the log, and an entry that '
                         'is not is the failure — it means the run drifted back '
                         'into cold prospecting. Every other locked check still '
                         'applies unchanged.')
    args = ap.parse_args()

    text = open(args.file, encoding='utf-8').read()
    r = Report()
    print(f'\nVerifying {os.path.basename(args.file)}\n')

    # --- structure -------------------------------------------------------
    blocks = text.split('\n---\n\n')
    entries = blocks[1:]
    names = re.findall(r'^(\d+)\.[ ](.+)$', text, re.M)
    n = len(names)

    r.check(n > 0, 'file parses into numbered entries', f'{n} found')
    if args.expect:
        r.check(n == args.expect, 'entry count matches request',
                f'{n} of {args.expect}')
    nums = [int(x) for x, _ in names]
    r.check(nums == list(range(1, n + 1)), 'numbering is 1..N with no gaps')
    r.check(len(entries) == n, 'entry blocks match numbered headings',
            f'{len(entries)} blocks vs {n} headings')

    for field, pat in (('To:', r'^To: '), ('Subject:', r'^Subject: ')):
        c = len(re.findall(pat, text, re.M))
        r.check(c == n, f'every entry has a {field} line', f'{c} of {n}')

    # --- footer ----------------------------------------------------------
    r.check(text.count(LINK) == n, 'every entry carries the website link',
            f'{text.count(LINK)} of {n}')
    missing = [b.split('\n', 1)[0][:44] for b in entries
               if not b.rstrip().endswith(LINK)]
    r.check(not missing, 'link is the last line of every entry',
            '; '.join(missing[:3]))

    # --- greeting (locked rule 1, V2 form) -------------------------------
    # V2 requires the exact introduction sentence "My name is Neil." after a
    # greeting line that names the recipient. The runs 1-14 inline form
    # ("Hey X team, I'm Neil.") is superseded and fails here on purpose.
    greet = len(re.findall(r'^(?:Hi|Hey|Hello) [^\n,]+,\n\nMy name is Neil\.',
                           text, re.M))
    r.check(greet == n, 'every email opens "Hi <recipient>," then '
                        '"My name is Neil."', f'{greet} of {n}')
    _bodies_early = '\n'.join(m.group(1) for m in re.finditer(
        r'^Subject: [^\n]+\n\n(.+?)\n\nhttps://', text, re.S | re.M))
    intro = len(re.findall(r'\bMy name is Neil\.', _bodies_early))
    r.check(intro == n, 'exact introduction sentence present once per email',
            f'{intro} of {n}')
    old = re.findall(r"I'm Neil\b", text)
    r.check(not old, 'no superseded "I\'m Neil" introduction',
            f'{len(old)} found — rewrite as "My name is Neil."')
    r.check(not re.search(r'^(?:Hi|Hey|Hello),\s*$', text, re.M),
            'no bare greeting without a recipient')
    r.check("I'm Vernon" not in text and "It's Vernon" not in text,
            'Neil is never introduced as the city')

    # --- TV wording (locked rule 2a, forms A and B) ----------------------
    # Count inside email bodies only. The file header legitimately describes
    # the TV offer and must not be counted as an unlocked mention.
    body_text = '\n'.join(m.group(1) for m in re.finditer(
        r'^Subject: [^\n]+\n\n(.+?)\n\nhttps://', text, re.S | re.M))
    form_a = body_text.count(LOCKED_TV)
    form_b = len(LOCKED_TV_FAR.findall(body_text)) - form_a
    tv_locked = form_a + form_b
    tv_mentions = len(re.findall(r'\bTVs?\b', body_text))
    r.warn(tv_locked > 0, 'locked TV claim is present',
           f'{form_a} form A (local) + {form_b} form B (farther-out); '
           f'{n - tv_locked} entries omit it')
    r.check(tv_mentions <= tv_locked,
            'every TV mention carries the locked advertising claim',
            f'{tv_mentions} mentions vs {tv_locked} locked claims')
    bad = re.findall(r'feature you on our TVs|featured on our TVs|'
                     r'put you on our screens|free advertising', text)
    r.check(not bad, 'no TV wording that reads as a free giveaway',
            '; '.join(bad[:3]))

    # --- unverified claims about the RECIPIENT's own calendar (run 23) --
    # Run 23 shipped a first draft that told a volleyball club its tryout
    # season was starting, a bus-repair shop which month it was busiest, and
    # a farm it was in its hardest six weeks — none of it verified, all of
    # it stated as fact. This is a heuristic, not a hard gate: "your season",
    # "your busiest", "you're in the middle of" and similar constructions are
    # usually a guess dressed as a fact and deserve a human look, but a
    # legitimately sourced, dated trigger can use the same words. Warn, don't
    # fail — see the locked rule in website-research-email.md for what's
    # actually required (drop the claim, hedge it, or verify it first).
    calendar_claim = re.findall(
        r"your (?:season|busiest|slowest|slow season|busy season)\b|"
        r"you'?re (?:in the middle of|heading into|about to)\b|"
        r"which means (?:right now )?you'?re\b", body_text, re.I)
    r.warn(not calendar_claim,
           "no unhedged claim about the recipient's own calendar",
           f'{len(calendar_claim)} found — eyeball each one: is it a sourced,'
           f' dated trigger, or a guess? Example: {calendar_claim[0]!r}'
           if calendar_claim else '')

    # --- forbidden signature --------------------------------------------
    sig = re.findall(r'Best regards|Sincerely|Kind regards|Cheers,\s*\nNeil', text)
    r.check(not sig, 'no typed sign-off block', '; '.join(sig[:3]))

    # --- bulk-edit scars -------------------------------------------------
    # Scan email BODIES only. Headings ("21. iNFOTEL Multimedia") and To:
    # lines (domains, "acutruss.com/vernon") legitimately contain patterns
    # that look like broken prose.
    bodies = '\n'.join(m.group(1) for m in re.finditer(
        r'^Subject: [^\n]+\n\n(.+?)\n\nhttps://', text, re.S | re.M))

    r.check('  ' not in bodies, 'no doubled spaces')
    r.check(not re.search(r'\s,|,,|,\s*\.', bodies), 'no orphaned commas')
    r.check(not re.search(r'\{|\}', text), 'no unsubstituted {placeholders}')
    r.check(not re.search(r'\[(?:logo|Business|Name|#)\]', text),
            'no unfilled [placeholders] in bodies')
    # Python forbids variable-width lookbehind, so capture the preceding
    # token and filter out abbreviations and initials ("A.M.I.") afterwards.
    frag = [m.group(0).strip() for m in re.finditer(r'(\w+)\.\s+[a-z]', bodies)
            if not re.fullmatch(ABBREV, m.group(1), re.I)
            and not re.fullmatch(r'[A-Z]', m.group(1))]
    r.check(not frag, 'no sentence starting lowercase (regex-surgery scar)',
            '; '.join(repr(f) for f in frag[:3]))
    # Only articles and conjunctions — a sentence may validly end on a
    # preposition ("the kind of evening people are looking for."), but never
    # on "a"/"the"/"and". That was the run-3 scar: "...with a." / "...plus a."
    stub = re.findall(r"\b(?:a|an|the|and|plus)\.(?:\s|$)", bodies)
    r.check(not stub, 'no sentence ending on a dangling article or conjunction',
            '; '.join(repr(s) for s in stub[:3]))

    # --- rule 2b: nothing is free ----------------------------------------
    FREEBIE = [
        (r"\bon me\b|\bon us\b", '"on me/on us"'),
        (r"(?:I'd|we'd)\s+(?:also\s+|really\s+)?(?:like|love)\s+to\s+"
         r"(?:host|offer|put|treat|bring)\b", '"I\'d like to host/offer..."'),
        (r"\bdeserves?\b[^.]{0,40}\b(?:night|evening|afternoon|out)\b",
         '"deserves a night out"'),
        (r"\bno strings\b|\bmy shout\b|\bon the house\b", '"no strings"'),
        (r"would (?:also )?be welcome", '"would be welcome"'),
        (r"as a thank[- ]you", '"as a thank-you"'),
        (r"no catch|nothing attached to it", '"no catch"'),
        (r"the bays are yours", '"the bays are yours"'),
        (r"\bfor nothing\b", '"for nothing"'),
        (r"\bfree\b(?! (?:to|graze))|complimentary|no charge|our treat", '"free/complimentary"'),
    ]
    hits = []
    for pat, label in FREEBIE:
        for m in re.finditer(pat, bodies, re.I):
            hits.append(f'{label} -> ...{bodies[max(0, m.start()-28):m.end()+18]}...')
    r.check(not hits, 'nothing reads as free (locked rule 2b)',
            ' | '.join(hits[:3]))


    # --- V2 drafting rules (spec section 8) ------------------------------
    spam = re.findall(r'(?i)\b(?:unsubscribe|if you.{0,20}(?:rather|prefer) not '
                      r'to (?:hear|receive)|apolog\w+ for the (?:cold|unsolicited)|'
                      r'sorry for the (?:cold|unsolicited)|this is not spam|'
                      r'CASL)\b', bodies)
    r.check(not spam, 'no anti-spam explanation in the body',
            '; '.join(spam[:3]))
    callpush = re.findall(r'(?i)\b(?:give me a call|call me at|give us a call|'
                          r'jump on a (?:quick )?call|hop on a call|'
                          r'phone me)\b', bodies)
    r.check(not callpush, 'no phone call pushed (Neil has not asked for one)',
            '; '.join(callpush[:3]))

    # --- duplicates ------------------------------------------------------
    keys = [normalize(b) for _, b in names]
    dupes = {k for k in keys if keys.count(k) > 1}
    r.check(not dupes, 'no duplicate businesses inside this file',
            '; '.join(list(dupes)[:3]))

    # --- Universal Duplicate Guard (module H) ----------------------------
    # Compares every axis the spec lists — name, alias, core name, website
    # domain, email, email domain, phone, street address — not the trading
    # name alone. Name-only matching let 18 real double-contacts through
    # across runs 2-13.
    tos_by_num = dict(zip([num for num, _ in names],
                          re.findall(r'^To: (.+)$', text, re.M)))
    # EVERY ledger row is a business that was already written to — the ledger
    # is derived from outreach-log.md, which only records outreach. A
    # rejection_reason on such a row is a historical duplicate marker
    # ("duplicate of X — do not contact again"), not a note that the business
    # was never contacted. Skipping those rows let run 17 draft an email to
    # Cambium Cider Co, which run 7 had already emailed on the same address
    # and explicitly flagged. All 89 marked rows carry status "email created".
    prior = [rec for rec in load_ledger(args.ledger)
             if not (args.logged_as and rec.get('run') == args.logged_as)]
    if prior:
        idx = {a: {} for a in ('email', 'domain', 'email_domain', 'phone',
                               'address_key')}
        by_core = {}
        for rec in prior:
            by_core.setdefault(rec['core_key'], []).append(rec)
            for axis in idx:
                if rec.get(axis):
                    idx[axis].setdefault(rec[axis], rec)
        overlap = []
        for num, b in names:
            cand = identity(b, contact=tos_by_num.get(num, ''))
            pool = list(by_core.get(cand['core_key'], []))
            for axis in idx:
                if cand.get(axis) and cand[axis] in idx[axis]:
                    pool.append(idx[axis][cand[axis]])
            for rec in pool:
                why = duplicate_reason(cand, rec)
                if why:
                    overlap.append((num, b, why))
                    break
        if args.second_contact:
            # A follow-up batch writes to businesses already in the log on
            # purpose, so the initial-outreach check reads exactly backwards.
            # Inverting it rather than skipping it keeps the gate meaningful:
            # an entry with no prior contact means the run wandered back into
            # cold prospecting, which is the failure this mode has to catch.
            hit = {num for num, _b, _w in overlap}
            unknown = [(num, b) for num, b in names if num not in hit]
            r.check(not unknown,
                    'every entry is a business already in the log '
                    '(second-contact mode)',
                    '; '.join(f'#{num} {b}: no prior contact found'
                              for num, b in unknown[:4]))
        else:
            r.check(not overlap,
                    'no overlap with businesses already contacted (all axes)',
                    '; '.join(f'#{num} {b}: {w}' for num, b, w in overlap[:4]))
        print(f'  ....  checked against {len(prior)} live businesses on '
              f'name, alias, domain, email, phone and address\n')
    elif os.path.exists(args.log):
        logged = [row['name'] for row in load_log(args.log)
                  if not (args.logged_as and row['note'] == args.logged_as)]
        by_key = {}
        for nm in logged:
            by_key.setdefault(normalize_strict(nm), []).append(nm)
        overlap = [(num, b, c) for num, b in names
                   for c in by_key.get(normalize_strict(b), ())
                   if same_business(b, c)]
        r.check(not overlap,
                'no overlap with businesses already in the outreach log',
                '; '.join(f'#{num} {b} = "{c}"' for num, b, c in overlap[:4]))
        print(f'  ....  ledger missing — fell back to name-only matching '
              f'against {len(logged)} logged businesses\n')

    # --- contact channel -------------------------------------------------
    # Replaces the withdrawn email-only rule of runs 12-18. Every To: line
    # must declare a channel Neil can act on — a bare email, "FORM <url>" or
    # "PHONE <number>". An unlabelled contact-page URL is still rejected;
    # that was the real defect email-only was reaching for. But a business is
    # no longer discarded merely for publishing a form instead of an address.
    tos = re.findall(r'^To: (.+)$', text, re.M)
    chans = [(t, contact_channel(t)) for t in tos]
    unusable = [t for t, c in chans if c is None]
    r.check(not unusable, 'every To: line declares a usable contact channel',
            f'{len(unusable)} malformed: '
            + '; '.join(t[:40] for t in unusable[:3]))
    mix = {c: sum(1 for _, x in chans if x == c)
           for c in ('email', 'form', 'phone')}
    print(f"  Channels: {mix['email']} email, {mix['form']} form, "
          f"{mix['phone']} phone\n")

    if args.email_only:
        bad = [t for t, c in chans if c != 'email']
        r.check(not bad, 'every To: line is a real email address',
                f'{len(bad)} without one: ' + '; '.join(b[:34] for b in bad[:3]))

    return r.render()


if __name__ == '__main__':
    sys.exit(main())
