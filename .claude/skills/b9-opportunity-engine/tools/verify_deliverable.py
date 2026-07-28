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
from b9lib import LINK, LOCKED_TV, LOCKED_TV_FAR, normalize, load_log  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')

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
    ap.add_argument('--email-only', action='store_true',
                    help='fail unless every To: line is a real email address '
                         '(the standing rule since run 12)')
    ap.add_argument('--logged-as', metavar='RUN_TAG',
                    help='this file is already logged under RUN_TAG; ignore its '
                         'own rows when checking for log overlap (use when '
                         're-verifying a delivered file)')
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

    # --- greeting --------------------------------------------------------
    greet = len(re.findall(r"Hey .+?, I'm Neil\.", text))
    r.check(greet == n, 'every email opens with a named personal greeting',
            f'{greet} of {n}')
    r.check("Hey, I'm Neil" not in text, 'no bare "Hey, I\'m Neil" greeting')
    r.check("I'm Vernon" not in text, 'Neil is never introduced as the city')

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

    # --- duplicates ------------------------------------------------------
    keys = [normalize(b) for _, b in names]
    dupes = {k for k in keys if keys.count(k) > 1}
    r.check(not dupes, 'no duplicate businesses inside this file',
            '; '.join(list(dupes)[:3]))

    if os.path.exists(args.log):
        # A file already written to the log overlaps with itself; --logged-as
        # excludes that run's own rows so the check stays meaningful.
        logged = {normalize(row['name']): row['name']
                  for row in load_log(args.log)
                  if not (args.logged_as and row['note'] == args.logged_as)}
        overlap = [(num, b) for (num, b) in names if normalize(b) in logged]
        r.check(not overlap,
                'no overlap with businesses already in the outreach log',
                '; '.join(f'#{num} {b}' for num, b in overlap[:4]))
        print(f'  ....  checked against {len(logged)} logged businesses\n')

    # --- contact quality (informational) ---------------------------------
    tos = re.findall(r'^To: (.+)$', text, re.M)
    EMAIL = re.compile(r'[^\s@]+@[^\s@]+\.[a-z]{2,}', re.I)
    emails = sum(1 for t in tos if EMAIL.search(t))
    phones = sum(1 for t in tos if re.search(r'\b\d{3}[-.]\d{3}[-.]\d{4}\b', t))
    print(f'  Contact mix: {emails} with a direct email, {phones} with a phone, '
          f'{n - emails - phones} form/site only\n')

    if args.email_only:
        bad = [t for t in tos if not EMAIL.search(t)]
        r.check(not bad, 'every To: line is a real email address',
                f'{len(bad)} without one: ' + '; '.join(b[:34] for b in bad[:3]))
        # A To: line carrying an email AND a phone still leaks the phone into
        # Neil's Gmail To: field, so flag it.
        noisy = [t for t in tos if EMAIL.search(t)
                 and re.search(r'\b\d{3}[-.]\d{3}[-.]\d{4}\b', t)]
        r.check(not noisy, 'To: lines contain the email only, nothing appended',
                '; '.join(x[:40] for x in noisy[:3]))

    return r.render()


if __name__ == '__main__':
    sys.exit(main())
