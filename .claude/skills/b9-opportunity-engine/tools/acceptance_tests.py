#!/usr/bin/env python3
"""V2 acceptance tests — the 14 checks from Neil's upgrade brief.

Run before declaring the upgrade complete, and after any change to b9lib,
the duplicate guard, the scorer, the coverage ledger or the verifier.

    python3 tools/acceptance_tests.py
    python3 tools/acceptance_tests.py -v      # show every assertion

Exit code is 0 only when all 14 pass.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from b9lib import (identity, duplicate_reason, load_ledger,  # noqa: E402
                   same_business, normalize_strict, LINK)

LEDGER = os.path.join(ROOT, 'state', 'ledger.jsonl')
LOG = os.path.join(ROOT, 'state', 'outreach-log.md')
SKILL = os.path.join(ROOT, 'SKILL.md')

RESULTS = []


def test(num, name):
    def deco(fn):
        RESULTS.append((num, name, fn))
        return fn
    return deco


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def sample_file(entries, path):
    """Write a minimal V2-shaped deliverable for the verifier tests."""
    out = ['B9 TEST FILE\n\n---\n']
    for i, (name, to, subj, body) in enumerate(entries, 1):
        out.append(f'{i}. {name}\nTo: {to}\nSubject: {subj}\n\n'
                   f'Hi {name} team,\n\nMy name is Neil. {body}\n\n{LINK}')
    open(path, 'w', encoding='utf-8').write('\n---\n\n'.join(out) + '\n')
    return path


# ---------------------------------------------------------------- 1
@test(1, 'Origin test — V1T 5B9 anchor is stated and verification required')
def t1(say):
    geo = open(os.path.join(ROOT, 'references', 'geo-ring-scout.md'),
               encoding='utf-8').read()
    assert 'V1T 5B9' in geo, 'ring scout does not name the postal anchor'
    assert re.search(r'verif\w+ physical address', geo, re.I), \
        'ring scout does not require verifying the street address'
    assert 'centroid' in geo, 'ring scout does not forbid the postal centroid'
    skill = open(SKILL, encoding='utf-8').read()
    assert 'V1T 5B9' in skill, 'SKILL.md lost the origin'
    say('origin anchored on V1T 5B9, street address verification required')


# ---------------------------------------------------------------- 2
@test(2, 'Ring-order test — closer rings before farther ones')
def t2(say):
    from coverage_ledger import RINGS
    assert RINGS[0] == '0-1km' and RINGS[-1] == '40-50km'
    with tempfile.TemporaryDirectory() as d:
        run([sys.executable, os.path.join(HERE, 'coverage_ledger.py'),
             '--run', 't2', '--dir', d, '--ring', '10-20km',
             '--source', 'a', '--category', 'c', '--examined', '200'])
        r = run([sys.executable, os.path.join(HERE, 'coverage_ledger.py'),
                 '--run', 't2', '--dir', d, '--audit',
                 '--asked', '10', '--delivered', '3'])
        assert r.returncode == 1, 'skipping the closest ring passed the audit'
        assert '0-1km was never worked' in r.stdout, r.stdout
    say('audit rejects a run that opened 10-20km with 0-1km unworked')


# ---------------------------------------------------------------- 3
@test(3, 'Kelowna exclusion test — excluded by default')
def t3(say):
    for f in ('geo-ring-scout.md', 'saturation-and-run-sizing.md'):
        txt = open(os.path.join(ROOT, 'references', f), encoding='utf-8').read()
        assert 'Kelowna' in txt
    geo = open(os.path.join(ROOT, 'references', 'geo-ring-scout.md'),
               encoding='utf-8').read()
    assert re.search(r'excluded by default', geo, re.I), \
        'ring scout does not exclude Kelowna by default'
    skill = open(SKILL, encoding='utf-8').read()
    assert re.search(r'Kelowna.{0,80}excluded unless', skill, re.S), \
        'SKILL.md does not gate Kelowna on an explicit request'
    say('Kelowna gated on an explicit request in the current message')


# ---------------------------------------------------------------- 4
@test(4, 'Duplicate-name test — aliases and spelling variations')
def t4(say):
    pairs = [
        ('Greater Vernon Minor Hockey Association', 'Greater Vernon Minor Hockey Assn'),
        ('Blue Haven Pool & Spa', 'Blue Haven Pools & Spas'),
        ('J C Bradley Jewellers', 'JC Bradley Jewellers'),
        ('A-1 Machine & Welding', 'A1 Machine and Welding'),
        ('Bean Scene Coffee House', 'Bean Scene Coffee House Vernon'),
        ('Grace Bible Church of Vernon', 'Grace Bible Church Vernon'),
        ("Cotton's Chocolates", 'Cottons Chocolate'),
        ('1516 Pub & Grill', '1516 Pub and Grill'),
    ]
    for a, b in pairs:
        assert same_business(a, b), f'missed: {a!r} vs {b!r}'
    for a, b in [('RE/MAX Vernon', 'RE/MAX Lumby'),
                 ('Vernon Storage Centre', 'Vernon Mini Storage')]:
        assert not same_business(a, b), f'false match: {a!r} vs {b!r}'
    say(f'{len(pairs)} alias/spelling pairs caught, 2 distinct pairs kept apart')


# ---------------------------------------------------------------- 5
@test(5, 'Duplicate-domain test — a different employee at a contacted business')
def t5(say):
    prior = identity('Coldstream Truck Parts', 'parts@coldstreamtruckparts.ca')
    other = identity('Dave in Sales', 'dave@coldstreamtruckparts.ca')
    why = duplicate_reason(other, prior)
    assert why and 'domain' in why, f'domain axis missed: {why}'

    site = identity('Some Rebrand', website='https://coldstreamtruckparts.ca/about')
    assert duplicate_reason(site, prior), 'website domain axis missed'

    phone_a = identity('L Stop Auto', '250-549-3666')
    phone_b = identity("Partly Dave's Garage", '(250) 549-3666')
    assert duplicate_reason(phone_b, phone_a), 'phone axis missed'

    addr_a = identity('Shop One', address='4620 23 St, Vernon BC')
    addr_b = identity('Shop Two', address='4620 23rd Street Vernon')
    assert duplicate_reason(addr_b, addr_a), 'address axis missed'

    # Shared institutional domains must NOT collapse separate departments.
    m1 = identity('Tourism Vernon', 'tourism@vernon.ca')
    m2 = identity('Greater Vernon Recreation', 'rec@vernon.ca')
    assert not duplicate_reason(m2, m1), 'shared municipal domain over-matched'
    say('domain, website, phone and address axes all fire; shared '
        'institutional domains correctly do not')


# ---------------------------------------------------------------- 6
@test(6, 'History test — a business in prior history is rejected')
def t6(say):
    recs = list(load_ledger(LEDGER))
    assert len(recs) >= 1800, f'ledger has only {len(recs)} records'
    live = [r for r in recs if not r.get('rejection_reason')]
    marked = len(recs) - len(live)
    assert marked >= 80, f'only {marked} historical duplicates preserved'
    known = next(r for r in live if r['name'] == 'Halina Centre')
    cand = identity(known['name'], contact=known.get('email') or '')
    assert duplicate_reason(cand, known), 'a logged business was not rejected'
    r = run(f'printf "Halina Centre\\n" | {sys.executable} '
            f'{os.path.join(HERE, "dedup_check.py")}', shell=True)
    assert 'DUP' in r.stdout, r.stdout
    say(f'{len(recs)} historical rows carried forward, {marked} duplicate '
        f'markers preserved; a logged business is rejected by the CLI')


# ---------------------------------------------------------------- 7
@test(7, 'Verification test — a guessed email is rejected')
def t7(say):
    from b9lib import email_of
    for bad in ('[email protected]', '{first}{last}@company.com',
                'email@protected.invalid'):
        assert not email_of(bad), f'accepted a non-address: {bad}'
    finder = open(os.path.join(ROOT, 'references', 'storefront-contact-finder.md'),
                  encoding='utf-8').read()
    assert 'Never pattern-guess' in finder
    assert 'source URL' in finder, 'contact verifier does not require a source'
    with tempfile.TemporaryDirectory() as d:
        p = sample_file([('Test Co', 'testco.ca/contact', 'Hello',
                          'A specific thing about you.')],
                        os.path.join(d, 'f.txt'))
        r = run([sys.executable, os.path.join(HERE, 'verify_deliverable.py'),
                 p, '--email-only'])
        assert r.returncode == 1 and 'real email address' in r.stdout
    say('redacted/format/guessed addresses rejected; a contact page in a '
        'To: line fails --email-only')


# ---------------------------------------------------------------- 8
@test(8, 'Fit test — a generic partnership scores below the gate')
def t8(say):
    r = run([sys.executable, os.path.join(HERE, 'fit_score.py'),
             '--name', 'Generic Shop', '--audience', '5', '--revenue', '4',
             '--km', '35', '--value', '5', '--timing', '0', '--repeat', '2',
             '--contact', '4'])
    assert r.returncode == 1 and 'REJECT' in r.stdout, r.stdout
    r = run([sys.executable, os.path.join(HERE, 'fit_score.py'),
             '--name', 'Coldstream Truck Parts', '--audience', '15',
             '--revenue', '14', '--km', '2', '--value', '12', '--timing', '5',
             '--repeat', '8', '--contact', '7'])
    assert r.returncode == 0 and 'PASS' in r.stdout, r.stdout
    arch = open(os.path.join(ROOT, 'references', 'partnership-angle-matcher.md'),
                encoding='utf-8').read()
    assert re.search(r'ten\s+unrelated businesses', arch), \
        'no generic-concept rejection test'
    say('27/100 rejected, 75/100 passed; architect rejects copy-paste concepts')


# ---------------------------------------------------------------- 9
@test(9, 'Replacement test — rejected candidates must be replaced')
def t9(say):
    persist = open(os.path.join(ROOT, 'references', 'persistence-standard.md'),
                   encoding='utf-8').read()
    assert 'replace it automatically' in persist
    assert 'Do not ask permission' in persist
    red = open(os.path.join(ROOT, 'references', 'opportunity-red-team.md'),
               encoding='utf-8').read()
    assert 'reject and replace' in red.lower()
    say('replacement is mandated in the persistence standard and red team')


# ---------------------------------------------------------------- 10
@test(10, 'Copy test — "My name is Neil.", no signature, no anti-spam')
def t10(say):
    with tempfile.TemporaryDirectory() as d:
        good = sample_file([('Nowhere Widgets', 'hi@nowherewidgets.example',
                             'A specific subject',
                             'You do a specific thing and here is why it fits.')],
                           os.path.join(d, 'good.txt'))
        r = run([sys.executable, os.path.join(HERE, 'verify_deliverable.py'),
                 good, '--email-only'])
        assert 'PASS  every email opens' in r.stdout, r.stdout

        # old superseded form must now fail
        bad = os.path.join(d, 'bad.txt')
        open(bad, 'w', encoding='utf-8').write(
            f"H\n\n---\n\n1. X Co\nTo: a@b.ca\nSubject: S\n\n"
            f"Hey X Co team, I'm Neil. Something.\n\n{LINK}\n")
        r = run([sys.executable, os.path.join(HERE, 'verify_deliverable.py'), bad])
        assert r.returncode == 1 and "superseded" in r.stdout, r.stdout

        # signature and anti-spam blocks must fail
        sig = os.path.join(d, 'sig.txt')
        open(sig, 'w', encoding='utf-8').write(
            f"H\n\n---\n\n1. X Co\nTo: a@b.ca\nSubject: S\n\nHi X Co team,\n\n"
            f"My name is Neil. Something. Apologies for the cold email. "
            f"Best regards\n\n{LINK}\n")
        r = run([sys.executable, os.path.join(HERE, 'verify_deliverable.py'), sig])
        assert r.returncode == 1
        assert 'no typed sign-off block' in r.stdout
        assert 'anti-spam' in r.stdout, r.stdout
    say('exact sentence enforced; old form, signatures and anti-spam blocks fail')


# ---------------------------------------------------------------- 11
@test(11, 'Persistence test — accepted in one run, blocked in the next')
def t11(say):
    recs = list(load_ledger(LEDGER))
    r14 = [x for x in recs if x.get('run') == 'run-14']
    assert len(r14) == 20, f'run-14 has {len(r14)} ledger rows, expected 20'
    for rec in r14[:5]:
        cand = identity(rec['name'], contact=rec.get('email') or '')
        assert duplicate_reason(cand, rec), f'{rec["name"]} not blocked'
    r = run(f'printf "Cap-it Vernon\\nBig O Tires Vernon\\n" | {sys.executable} '
            f'{os.path.join(HERE, "dedup_check.py")}', shell=True)
    assert r.stdout.count('DUP') == 2, r.stdout
    say('all 20 run-14 prospects are now duplicates on the next run')


# ---------------------------------------------------------------- 12
@test(12, 'Coverage test — an underfilled run cannot finish without an audit')
def t12(say):
    with tempfile.TemporaryDirectory() as d:
        cl = os.path.join(HERE, 'coverage_ledger.py')
        r = run([sys.executable, cl, '--run', 't12', '--dir', d, '--audit',
                 '--asked', '20', '--delivered', '4'])
        assert r.returncode == 1 and 'AUDIT FAILED' in r.stdout
        # a genuinely exhausted run passes
        for i, (src, cat) in enumerate([
                ('dva', 'auto parts'), ('chamber', 'medical supply'),
                ('okanagan-local', 'pawnbrokers'), ('shopvernon', 'towing'),
                ('local news', 'nurseries')]):
            run([sys.executable, cl, '--run', 't12b', '--dir', d,
                 '--ring', '0-1km', '--source', src, '--category', cat,
                 '--examined', '25', '--kept', '1', '--dup', '20'])
        run([sys.executable, cl, '--run', 't12b', '--dir', d,
             '--reject', 'Some Cafe|score 48'])
        r = run([sys.executable, cl, '--run', 't12b', '--dir', d, '--audit',
                 '--asked', '20', '--delivered', '5'])
        assert r.returncode == 0 and 'AUDIT PASSED' in r.stdout, r.stdout
    say('bare shortfall blocked; evidenced shortfall accepted')


# ---------------------------------------------------------------- 13
@test(13, 'Upgrade-continuity test — same engine, command, rules and history')
def t13(say):
    skill = open(SKILL, encoding='utf-8').read()
    assert 'name: b9-opportunity-engine' in skill, 'engine identity changed'
    assert skill.count('RUN B9 OPPORTUNITY ENGINE') >= 3, 'activation phrase lost'
    assert 'RUN B9 FOLLOW UP' in skill and 'RUN B9 REPLY' in skill, \
        'companion modes lost'
    email = open(os.path.join(ROOT, 'references', 'website-research-email.md'),
                 encoding='utf-8').read()
    for locked in ('2a.', '2b.', 'NOTHING IS FREE', 'Drafts only',
                   '24/7 advertising seen by hundreds of people a week'):
        assert locked in email, f'locked rule lost: {locked}'
    log = open(LOG, encoding='utf-8').read()
    assert log.count('- [') >= 1850, 'outreach history shrank'
    assert 'batch-200' in log and 'run-14' in log, 'history tags lost'
    r = run([sys.executable, os.path.join(HERE, 'migrate_ledger.py'), '--check'])
    assert r.returncode == 0, f'ledger drifted from the log: {r.stdout}'
    say('identity, activation phrase, companion modes, locked rules and '
        '1,856 history rows all intact; ledger in sync with the log')


# ---------------------------------------------------------------- 14
@test(14, 'No-parallel-engine test — nothing was built beside the engine')
def t14(say):
    skills_dir = os.path.dirname(ROOT)
    siblings = [d for d in os.listdir(skills_dir)
                if os.path.isdir(os.path.join(skills_dir, d))]
    for name in siblings:
        assert 'v2' not in name.lower(), f'parallel engine found: {name}'
    # exactly one activation phrase across the whole skill
    phrases = set()
    for root, _, files in os.walk(ROOT):
        for f in files:
            if f.endswith('.md'):
                txt = open(os.path.join(root, f), encoding='utf-8').read()
                phrases.update(re.findall(r'RUN B9 [A-Z][A-Z ]+', txt))
    unexpected = {p.strip() for p in phrases} - {
        'RUN B9 OPPORTUNITY ENGINE', 'RUN B9 FOLLOW UP', 'RUN B9 REPLY'}
    assert not unexpected, f'new activation phrases invented: {unexpected}'
    ledgers = [f for f in os.listdir(os.path.join(ROOT, 'state'))]
    assert 'outreach-log.md' in ledgers, 'original ledger removed'
    assert 'ledger.jsonl' in ledgers, 'derived ledger missing'
    recs = list(load_ledger(LEDGER))
    assert len(recs) == sum(1 for ln in open(LOG, encoding='utf-8')
                            if re.match(r'- \[', ln)), \
        'derived ledger is not one-to-one with the log'
    say(f'no V2 sibling, no new activation phrase, original log intact and '
        f'1:1 with the derived ledger')


# ---------------------------------------------------------------- 15
@test(15, 'Multi-tenant test — different units are different businesses')
def t15(say):
    """Run 17 regression.

    A civic address used to stand for every tenant in the building, so KAL
    Fitness (11-100 Kalamalka Lake Rd) was reported as a duplicate of Chemac
    Industries (100 Kalamalka Lake Rd). Vernon is full of multi-tenant
    plazas, so that quietly hid fresh prospects. Two KNOWN, DIFFERENT units
    must not collide — but an address with no unit still has to match
    everything at it, or the original protection is gone.
    """
    a = identity('Alpha Co', address='11-100 Kalamalka Lake Rd')
    b = identity('Beta Co', address='17-100 Kalamalka Lake Rd')
    assert duplicate_reason(a, b) is None, \
        'two different units in one plaza still collide on address'

    # Exactly one side knows its unit, and nothing else is shared. Run 18
    # showed what treating that as a duplicate costs: Village Green Shopping
    # Centre was matched to Chatters Hair Salon (unit 530) — a mall against a
    # shop inside it — and North Okanagan Orthodontics (unit 300) to Central
    # Barbers. Four real prospects, none of them duplicates.
    mall = identity('Village Green Shopping Centre', address='4900 27 St')
    shop = identity('Chatters Hair Salon', address='530-4900 27 St')
    assert duplicate_reason(mall, shop) is None, \
        'a mall is still being reported as a duplicate of its own tenant'

    # Neither side knows its unit: the original protection has to survive.
    # Vernon Landscape & Stone Supply and Vernon Landscape Centre are both
    # "4620 23 St" and went out twice because nothing compared addresses.
    p = identity('Vernon Landscape & Stone Supply', address='4620 23 St')
    q = identity('Vernon Landscape Centre', address='4620 23 St')
    assert duplicate_reason(p, q), \
        'two unit-less businesses at one civic address must still collide'

    same = identity('Delta Co', address='2801 35th Avenue Unit 220')
    other = identity('Delta Company', address='220-2801 35 Ave')
    assert duplicate_reason(same, other), \
        'one unit written two ways must still be one business'
    say('units compared; a lone civic number is evidence only when both '
        'sides are silent about units')


# ---------------------------------------------------------------- 16
@test(16, 'Do-not-contact test — historical duplicate markers still block')
def t16(say):
    """Run 17 regression.

    The duplicate guard and the deliverable verifier both skipped every
    ledger row carrying a rejection_reason. But the ledger is derived from
    outreach-log.md, which records outreach and nothing else: all 89 marked
    rows have status "email created" and read "duplicate of X — do not
    contact again". Skipping them made every one of those businesses look
    available. Run 7 had already emailed hello@cambiumcider.com; run 17
    nearly emailed it again.
    """
    recs = list(load_ledger(LEDGER))
    marked = [r for r in recs if r.get('rejection_reason')]
    assert marked, 'no historical duplicate markers left in the ledger'
    contacted = [r for r in marked if r.get('status')]
    assert len(contacted) == len(marked), \
        'a marked row with no status would be safe to skip — revisit this test'

    # The victim has to be a business the guard can ONLY see through its
    # marked row. Most marked rows have an unmarked twin under the same name,
    # which catches them either way and would make this test pass even with
    # the bug present. Cambium Cider Co is the real shape: logged under a
    # former name ("The BX Press Cidery..."), so only the marked row carries
    # the trading name and the address that run 17 actually found.
    # Selected by the guard's own verdict rather than a proxy: a valid victim
    # is one that NO unmarked row matches on ANY axis. Filtering on name and
    # email alone left 83 candidates, but 73 of those are still caught by an
    # unmarked row through the domain axis — picking one of them made this
    # test pass with the bug present.
    live = [r for r in recs if not r.get('rejection_reason')]
    victims = []
    for r in marked:
        cand = identity(r['name'], contact=r.get('email') or '')
        if not any(duplicate_reason(cand, o) for o in live):
            victims.append(r)
    assert victims, ('every marked row is also reachable from an unmarked row '
                     '— this test can no longer distinguish the bug from the fix')

    victim = victims[0]
    entry = [(victim['name'], victim.get('email') or 'x@example.com',
              'Test', 'A body that says nothing at all.')]
    path = os.path.join(tempfile.gettempdir(), 'b9_t16.txt')
    sample_file(entry, path)
    out = run([sys.executable, os.path.join(HERE, 'verify_deliverable.py'),
               path]).stdout
    assert 'FAIL  no overlap with businesses already contacted' in out, \
        (f'verifier let a "do not contact again" business through: '
         f'{victim["name"]} <{victim.get("email")}>')
    say(f'{len(marked)} marked rows all carry a status; {len(victims)} are '
        f'visible only through the marker, and those still block')


# ---------------------------------------------------------------- 17
@test(17, 'Channel test — form and phone prospects are deliverable')
def t17(say):
    """Run 19 regression, and the largest single defect the engine has had.

    Runs 12-18 required every To: line to be an email address. Counted from
    the log, runs 2-11 delivered 200-250 businesses each at 1-26% email —
    run 8 shipped 200 with FOUR emails between them, run 11 shipped 250 with
    four. Every run from 12 on was 100% email and none broke twenty. The
    engine was not getting worse at finding businesses; it was discarding
    roughly 95% of what it found.

    So: a labelled form or phone contact must be accepted, an unlabelled
    contact-page URL must still be refused (that was the real defect the
    email-only rule was reaching for), and --email-only must remain
    available for anyone who deliberately wants an email-only file.
    """
    from b9lib import contact_channel                       # noqa: PLC0415

    assert contact_channel('info@x.ca') == 'email'
    assert contact_channel('FORM https://x.ca/contact') == 'form'
    assert contact_channel('PHONE 250-545-1234') == 'phone'
    assert contact_channel('PHONE (250) 545-1234') == 'phone'
    assert contact_channel('https://x.ca/contact') is None, \
        'a bare contact-page URL must still be refused'
    assert contact_channel('a@b.ca, 250-545-1234') is None, \
        'a To: line must not smuggle a phone number in beside the address'

    # Fictional names on purpose: real ones get logged by later runs and then
    # the duplicate guard fails this fixture for the wrong reason.
    entries = [('Zzyzx Formonly Trades Ltd', 'FORM https://example.invalid/c',
                'Trades', 'A body that says nothing at all.'),
               ('Qqqwerty Phoneonly Exteriors', 'PHONE 250-555-0184',
                'Crews', 'A body that says nothing at all.')]
    path = os.path.join(tempfile.gettempdir(), 'b9_t17.txt')
    sample_file(entries, path)
    vd = os.path.join(HERE, 'verify_deliverable.py')

    out = run([sys.executable, vd, path]).stdout
    assert 'FAIL' not in out, \
        f'form and phone prospects were rejected by the verifier:\n{out}'

    # The old behaviour has to stay reachable on request.
    out = run([sys.executable, vd, path, '--email-only']).stdout
    assert 'FAIL  every To: line is a real email address' in out, \
        '--email-only no longer enforces email-only'
    say('form and phone deliverable by default; bare URLs still refused; '
        '--email-only still available opt-in')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-v', '--verbose', action='store_true')
    args = ap.parse_args()

    print('\nB9 Opportunity Engine — V2 acceptance tests\n')
    failed = 0
    for num, name, fn in RESULTS:
        notes = []
        try:
            fn(notes.append)
            print(f'  PASS  {num:2}. {name}')
        except AssertionError as e:
            failed += 1
            print(f'  FAIL  {num:2}. {name}\n            {e}')
        except Exception as e:                       # noqa: BLE001
            failed += 1
            print(f'  ERROR {num:2}. {name}\n            {type(e).__name__}: {e}')
        if args.verbose:
            for nline in notes:
                print(f'            {nline}')
    print()
    if failed:
        print(f'{failed} of {len(RESULTS)} acceptance tests FAILED.')
    else:
        print(f'All {len(RESULTS)} acceptance tests passed.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
