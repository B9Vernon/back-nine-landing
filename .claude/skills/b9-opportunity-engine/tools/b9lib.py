"""Shared helpers for the B9 Opportunity Engine tools.

The canonical business-name normalizer lives here and NOWHERE ELSE. Every
tool imports it. Runs 6-8 each hand-rolled their own version inside a
throwaway script, the versions disagreed on apostrophes, and duplicates
slipped through into finished lists three runs running. One definition
ends that.
"""

import os
import re

LOG_LINE = re.compile(
    r'- \[(?P<status>[^\]]+)\] (?P<name>[^|]+) \| (?P<category>[^|]+) \| '
    r'(?P<contact>[^|]+) \| (?P<date>[^|]+) \| (?P<note>.+)'
)

ENTRY = re.compile(
    r'^(?P<num>\d+)\.[ ](?P<name>.+)\nTo: (?P<to>.+)\nSubject: (?P<subject>.+)\n\n'
    r'(?P<body>.+?)\n\n(?P<link>https://\S+)\s*$',
    re.S,
)

LINK = "https://backninegolf.ca/local/vernonbc/"

# Form A — local emails, TV offer secondary (locked rule 2a).
LOCKED_TV = ("24/7 advertising seen by hundreds of people a week, with a QR "
             "code sending the people straight to your website.")

# Form B — farther-out emails, TV offer is the whole pitch (locked rule 2a).
# Same approved claim; only the final noun varies (website / menu / booking
# page / tasting-room page / listings).
LOCKED_TV_FAR = re.compile(
    r'24/7 advertising seen by hundreds of people a week, with a QR code '
    r'sending (?:them|the people) straight to your [a-z\- ]+'
)

# Legal suffixes never distinguish two businesses.
_SUFFIX = re.compile(
    r'\b(ltd|ltee|inc|corp|corporation|co|company|llp|llc|holdings?|'
    r'enterprises?|bc)\b'
)

# Town qualifiers DO sometimes distinguish two businesses ("RE/MAX Vernon" and
# "RE/MAX Lumby" are different offices), so they get handled separately from
# legal suffixes — see same_business().
_TOWNS = (
    'vernon', 'coldstream', 'lumby', 'armstrong', 'enderby', 'lavington',
    'oyama', 'winfield', 'kelowna', 'west kelowna', 'westbank', 'lake country',
    'salmon arm', 'sicamous', 'sorrento', 'spallumcheen', 'cherryville',
    'silver star', 'silverstar', 'downtown',
)


def normalize(name: str) -> str:
    """Canonical form used for every duplicate comparison in the engine.

    Apostrophes are DELETED, not turned into spaces, so "Sweet Caroline's
    Bakery" and "Sweet Carolines Bakery" collapse to the same key. Getting
    this wrong is what let duplicates through in runs 6-8.
    """
    s = re.sub(r'\(.*?\)', '', name)          # drop parentheticals
    s = s.lower()
    s = s.replace("'", "").replace("’", "")   # straight + curly apostrophes
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return ' '.join(s.split())


def towns_in(name: str):
    """Town qualifiers present in a name."""
    n = normalize(name)
    return {t for t in _TOWNS if re.search(rf'\b{t}\b', n)}


# Trailing descriptors that businesses add or drop between listings. Stripping
# these caught 8 duplicates the suffix+town rule alone still missed, e.g.
# "Sparkling Hill Resort" vs "Sparkling Hill Resort and Spa".
_TRAIL = re.compile(
    r'\b(and |& )?(spa|conference cent(re|er)|orchard|resort|inn|store|shop|'
    r'restaurant|cafe|centre|center|group|studio|services?|society|'
    r'association|clinic|company|printing|rental|child ?care|early learning|'
    r'day ?care|preschool|supply|supplie|sale)\b\s*$'
)


# Joining words that businesses add or drop freely. "Grace Bible Church of
# Vernon" and "Grace Bible Church Vernon" are the same congregation.
_STOP = re.compile(r'\b(of|the|and|at|for|in|on)\b')

# Organisational words dropped anywhere in the name, not just at the end.
# "Vernon Elks Lodge #45" and "Vernon Elks 45" are one lodge.
_ORGWORD = re.compile(r'\b(lodge|branch|chapter|no)\b')

# Abbreviations businesses expand or contract freely between listings. Run 13
# nearly double-contacted "Greater Vernon Minor Hockey Assn" (batch-200) as
# "Greater Vernon Minor Hockey Association" because of this.
_ABBREV = (
    (r'\bassns?\b', 'association'), (r'\bassocs?\b', 'association'),
    (r'\bsocs?\b', 'society'), (r'\bdepts?\b', 'department'),
    (r'\bctrs?\b', 'centre'), (r'\bcenters?\b', 'centre'),
    (r'\bmgmt\b', 'management'), (r'\bsvcs?\b', 'service'),
)


def _singular(token: str) -> str:
    """Crude singulariser. "Blue Haven Pools & Spas" and "Blue Haven Pool &
    Spa" are one company; run 13 found both in the log as separate rows.
    Over-collapsing costs at most one prospect, under-collapsing costs a
    double-contact, so this errs toward collapsing."""
    if len(token) > 3 and token.endswith('s') and not token.endswith('ss'):
        return token[:-1]
    return token


def normalize_strict(name: str) -> str:
    """Strips legal suffixes, towns, trailing descriptors and joining words."""
    s = normalize(name)
    for pat, repl in _ABBREV:
        s = re.sub(pat, repl, s)
    # Merge runs of single letters: "J C Bradley" and "JC Bradley" are one
    # jeweller, "A-1 Machine" and "A1 Machine" one shop. Run 14 caught the
    # first of those only because the verifier flagged it.
    s = re.sub(r'\b(?:[a-z0-9] )+[a-z0-9]\b',
               lambda m: m.group(0).replace(' ', ''), s)
    s = ' '.join(_singular(t) for t in s.split())
    s = _ORGWORD.sub(' ', _STOP.sub(' ', s))
    for t in sorted(_TOWNS, key=len, reverse=True):
        s = re.sub(rf'\b{t}\b', ' ', s)
    s = _SUFFIX.sub(' ', s)
    s = ' '.join(s.split())
    for _ in range(4):                      # peel repeated trailing words
        new = _TRAIL.sub('', s).strip()
        if new == s or not new:
            break
        s = new
    return ' '.join(s.split())


def same_business(a: str, b: str) -> bool:
    """True when two names almost certainly denote the same business.

    Runs 2-8 double-contacted 32 businesses because exact matching treated
    "Bean Scene Coffee House" and "Bean Scene Coffee House Vernon" as two
    different companies. The rule that fixes it without creating false
    matches:

      same core name (suffixes and towns stripped), AND
      the town qualifiers do not CONFLICT.

    So "Pinnacle Roofing" == "Pinnacle Roofing Vernon" (one names a town,
    the other doesn't), but "RE/MAX Vernon" != "RE/MAX Lumby" (two towns
    that disagree) and "Kal Tire Lumby" != "Kal Tire Head Office" (the
    non-town qualifier survives stripping and differs).
    """
    ka, kb = normalize_strict(a), normalize_strict(b)
    if not ka or ka != kb:
        return False
    ta, tb = towns_in(a), towns_in(b)
    if ta and tb and not (ta & tb):
        return False        # different towns — different branches
    return True


def load_log(path):
    """Yield dicts for every logged business."""
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            m = LOG_LINE.match(line.rstrip('\n'))
            if m:
                d = m.groupdict()
                yield {k: v.strip() for k, v in d.items()}


def load_entries(path):
    """Yield dicts for every entry in a deliverable TXT file."""
    text = open(path, encoding='utf-8').read()
    for block in text.split("\n---\n\n")[1:]:
        m = ENTRY.match(block.strip() + "\n")
        if m:
            d = m.groupdict()
            yield {k: v.strip() for k, v in d.items()}
        else:
            yield {'num': None, 'raw': block}


# ---------------------------------------------------------------------------
# V2 — universal identity keys (module H, Universal Duplicate Guard)
#
# Name matching alone missed real duplicates for 14 runs: the same business
# reached under a second address, a second employee, or a rebranded name.
# These keys let the guard compare a candidate on every axis the spec lists
# (name, alias, parent, domain, email, email domain, phone, street address)
# instead of on the trading name alone.
# ---------------------------------------------------------------------------

# Free mailbox providers. A shared @gmail.com does NOT make two businesses
# the same company, so the email-domain axis has to ignore them.
FREE_MAIL = frozenset((
    'gmail.com', 'shaw.ca', 'telus.net', 'outlook.com', 'hotmail.com',
    'yahoo.ca', 'yahoo.com', 'icloud.com', 'live.ca', 'live.com',
    'protonmail.com', 'me.com', 'aol.com', 'msn.com',
))

# Domains many genuinely separate decision-makers share. A municipal
# department, a school district school, a health-authority site and a
# realty franchise all publish under one domain while holding different
# audiences and different decision-makers, so a domain match here is a
# REVIEW signal, never an automatic duplicate.
SHARED_DOMAINS = frozenset((
    'vernon.ca', 'rdno.ca', 'sd22.bc.ca', 'interiorhealth.ca', 'gov.bc.ca',
    'okanagan.bc.ca', 'ubc.ca', 'royallepage.ca', 'remax.ca', 'remax.net',
    'century21.ca', 'exprealty.ca', 'sutton.com', 'coldwellbanker.ca',
    'edwardjones.com', 'sunlife.com', 'ig.ca', 'rbc.com', 'bmo.com',
    'cibc.com', 'scotiabank.com', 'td.com', 'shaw.ca',
))

_EMAIL_RE = re.compile(r'[^\s<>@,;]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
_URL_RE = re.compile(r'https?://([^/\s]+)|(?:^|\s)((?:[a-z0-9\-]+\.)+[a-z]{2,})(?:/|\s|$)', re.I)

# Street-type words that businesses write half a dozen ways.
_STREET = (
    (r'\bavenue\b', 'ave'), (r'\bstreet\b', 'st'), (r'\broad\b', 'rd'),
    (r'\bdrive\b', 'dr'), (r'\bboulevard\b', 'blvd'), (r'\bplace\b', 'pl'),
    (r'\bcourt\b', 'ct'), (r'\bcrescent\b', 'cres'), (r'\bhighway\b', 'hwy'),
    (r'\bnorth\b', 'n'), (r'\bsouth\b', 's'), (r'\beast\b', 'e'),
    (r'\bwest\b', 'w'), (r'\bunit\b', ''), (r'\bsuite\b', ''), (r'\bste\b', ''),
)


def email_of(text):
    """First real email address in a blob of text, lowercased, or None."""
    if not text:
        return None
    m = _EMAIL_RE.search(text)
    if not m:
        return None
    addr = m.group(0).lower().strip('.,;:')
    # Redactions and format templates are not addresses. Search results
    # routinely show "[email protected]" or a company's pattern
    # ("{first}{last}@company.com", "firstname.lastname@co.ca"); building an
    # address from either is the forbidden pattern-guess.
    if addr.startswith('email@') or 'protected' in addr:
        return None
    if re.search(r'[{}\[\]<>()]', m.group(0)):
        return None
    local = addr.split('@', 1)[0]
    if local in ('first', 'firstname', 'lastname', 'firstlast', 'flast',
                 'first.last', 'firstname.lastname', 'initiallast',
                 'name', 'yourname', 'example', 'user'):
        return None
    return addr


def email_domain_of(text):
    """Registrable-ish domain of an email, or None for free mailboxes."""
    addr = email_of(text)
    if not addr:
        return None
    dom = addr.split('@', 1)[1]
    return None if dom in FREE_MAIL else dom


def domain_of(text):
    """Website root domain from a URL or bare host, or None.

    Falls back to the email's domain so a business known only by its
    address still gets a domain key.
    """
    if not text:
        return None
    for m in _URL_RE.finditer(text):
        host = (m.group(1) or m.group(2) or '').lower()
        host = host.split(':')[0].lstrip('.')
        if host.startswith('www.'):
            host = host[4:]
        if host and '.' in host and not host.endswith('.'):
            return host
    return email_domain_of(text)


def phone_key(text):
    """Last 10 digits of a North American phone number, or None."""
    if not text:
        return None
    for m in re.finditer(r'(?:\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}', text):
        digits = re.sub(r'\D', '', m.group(0))
        if len(digits) >= 10:
            return digits[-10:]
    return None


def address_key(text):
    """Normalized civic address: '2801 35 ave'.

    Two businesses at one civic address are one target — Vernon Landscape &
    Stone Supply and Vernon Landscape Centre (both 4620 23 St) went out
    twice because no matcher compared addresses. Unit designators are
    stripped first, while the punctuation that marks them is still intact,
    so "220-2801 35 Ave" and "2801 35th Avenue Unit 220" agree.

    Directories write two different things with a leading dash, and the
    spacing is what tells them apart:

        "220-2801 35 Ave"    unspaced -> 220 is a unit, drop it
        "1A-7861 Hwy 97"     unspaced -> 1A is a unit, drop it
        "4508 - 29th Street" spaced   -> 4508 is the civic number, keep it

    A spaced-out unit prefix ("220 - 2801 35 Ave") is therefore kept, which
    only costs a missed address match; the name, domain, email and phone
    axes still apply.
    """
    if not text:
        return None
    s = text.lower()
    s = re.sub(r'\b[a-z]\d[a-z]\s*\d[a-z]\d\b', ' ', s)          # postal code
    s = re.sub(r'\b(?:unit|suite|ste|bldg|building)\s*[#]?\s*\w{1,5}\b', ' ', s)
    s = re.sub(r'#\s*\w{1,5}\b', ' ', s)
    s = re.sub(r'^[\s,]*\w{1,5}[-\u2013](?=\d)', ' ', s)           # unspaced unit
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    for pat, repl in _STREET:
        s = re.sub(pat, repl, s)
    s = re.sub(r'\b(\d+)(st|nd|rd|th)\b', r'\1', s)               # 29th -> 29
    s = ' '.join(s.split())
    m = re.search(
        r'\b(\d+[a-z]?)\s+((?:[a-z0-9]+\s+){0,2}?)(ave|st|rd|dr|blvd|pl|ct|'
        r'cres|hwy|way|ln|lane|terr|trail|close|gate|loop|bay)\b', s)
    if not m:
        return None
    num, mid, typ = m.group(1), ' '.join(m.group(2).split()), m.group(3)
    # "27 St" is a street name, not a civic address. Vernon civic numbers
    # are three to five digits; anything shorter with no street name behind
    # it produced false address collisions (The Beauty Bar vs Vinterra
    # Wellness, both listed only as "27 St").
    if len(re.sub(r'\D', '', num)) < 3:
        return None
    return ' '.join(x for x in (num, mid, typ) if x)


CHANNEL_FORM = re.compile(r'^FORM\s+(https?://\S+)$')
CHANNEL_PHONE = re.compile(r'^PHONE\s+(\+?[\d(][\d\-.\s()]{7,}\d)$')
_BARE_EMAIL = re.compile(r'^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$', re.I)


def contact_channel(to_line):
    """Classify a deliverable's To: line as 'email', 'form', 'phone' or None.

    Runs 12-18 required every To: line to be an email address, and the
    prospect count fell from 200-250 a run to single digits — not because
    Vernon ran out, but because 74-99% of the businesses runs 2-11 delivered
    were reached by phone or web form. Run 8 shipped 200 businesses with 4
    emails between them.

    The rule was a fix for a real problem: a bare contact-page URL sitting in
    a To: line is useless when the To: line is being pasted into Gmail. The
    answer is to say which channel each entry is, so Neil can send the emails
    in one pass, fill the forms in another, and make the calls in a third —
    not to throw the business away.
    """
    to_line = (to_line or '').strip()
    if _BARE_EMAIL.match(to_line):
        return 'email'
    if CHANNEL_FORM.match(to_line):
        return 'form'
    if CHANNEL_PHONE.match(to_line):
        return 'phone'
    return None


def address_unit(text):
    """The unit/suite designator inside an address, or None if there is none.

    `address_key` deliberately drops the unit so that one business written
    two ways ("220-2801 35 Ave" and "2801 35th Avenue Unit 220") produces
    one key. That is right for a single tenant and wrong for a plaza: Vernon
    is full of multi-tenant addresses, and collapsing them made the civic
    number alone stand for every tenant in the building. KAL Fitness
    (11-100 Kalamalka Lake Rd) was reported as a duplicate of Chemac
    Industries (100 Kalamalka Lake Rd) — two unrelated businesses in the
    Kalamalka Business Park — which is exactly the kind of false match that
    hides fresh prospects.

    Kept separate from the key rather than folded into it, so
    duplicate_reason() can require the civic address to match AND the units
    to be compatible. A missing unit still matches anything at that address,
    so the original protection survives.
    """
    if not text:
        return None
    s = text.lower()
    s = re.sub(r'\b[a-z]\d[a-z]\s*\d[a-z]\d\b', ' ', s)          # postal code
    m = re.search(r'\b(?:unit|suite|ste|bldg|building)\s*[#]?\s*(\w{1,5})\b', s)
    if not m:
        m = re.search(r'#\s*(\w{1,5})\b', s)
    if not m:
        m = re.search(r'^[\s,]*(\w{1,5})[-–](?=\d)', s)       # unspaced unit
    return m.group(1) if m else None


# ---------------------------------------------------------------------------
# V2 — the prospect ledger (spec §10, persistent learning)
#
# state/outreach-log.md stays exactly as it is: append-only, human-readable,
# 1,876 rows of history. The ledger is DERIVED from it and extended with the
# richer V2 fields, so no history is discarded and no second source of truth
# is created. tools/migrate_ledger.py rebuilds it from the log at any time.
# ---------------------------------------------------------------------------

LEDGER_FIELDS = (
    'name', 'aliases', 'parent', 'name_key', 'core_key', 'towns',
    'domain', 'email', 'email_domain', 'phone', 'address_key', 'address_unit',
    'category', 'community', 'ring', 'distance_km',
    'score', 'opportunity_type', 'status', 'draft_status', 'sent_status',
    'source_urls', 'date_checked', 'run', 'rejection_reason',
)


def identity(name, contact='', website='', address='', **extra):
    """Build the identity half of a ledger record from whatever is known.

    `contact` is the free-text contact field the log has always carried; it
    may hold an email, a phone, a URL, or a mix, so every key extractor is
    run over it.
    """
    blob = ' '.join(str(x) for x in (contact, website, address) if x)
    rec = {
        'name': name,
        'aliases': list(extra.pop('aliases', ())),
        'parent': extra.pop('parent', None),
        'name_key': normalize(name),
        'core_key': normalize_strict(name),
        'towns': sorted(towns_in(name)),
        'domain': domain_of(website) or domain_of(blob),
        'email': email_of(contact) or email_of(blob),
        'email_domain': email_domain_of(contact) or email_domain_of(blob),
        'phone': phone_key(blob),
        'address_key': address_key(address) or address_key(blob),
        'address_unit': address_unit(address) or address_unit(blob),
    }
    rec.update(extra)
    return rec


def load_ledger(path):
    """Yield ledger records. Missing file yields nothing."""
    import json
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)


def duplicate_reason(cand, rec):
    """Why `cand` is the same business as ledger record `rec`, or None.

    Axes, in the order the spec lists them. Each is checked independently
    so a rebrand that changes the name is still caught by its domain, and a
    second employee at a contacted business is caught by its email domain.
    """
    if cand.get('name_key') and cand['name_key'] == rec.get('name_key'):
        return f'name matches "{rec["name"]}"'

    ck = cand.get('core_key')
    if ck and ck == rec.get('core_key'):
        ta, tb = set(cand.get('towns') or ()), set(rec.get('towns') or ())
        if not (ta and tb and not (ta & tb)):
            return f'same business as "{rec["name"]}"'

    for alias in rec.get('aliases') or ():
        if cand.get('name_key') == normalize(alias):
            return f'alias of "{rec["name"]}"'
    for alias in cand.get('aliases') or ():
        if normalize(alias) == rec.get('name_key'):
            return f'alias of "{rec["name"]}"'

    if cand.get('email') and cand['email'] == rec.get('email'):
        return f'same email as "{rec["name"]}"'
    dom = cand.get('domain')
    if dom and dom == rec.get('domain') and dom not in SHARED_DOMAINS:
        return f'same website domain as "{rec["name"]}" ({dom})'
    ed = cand.get('email_domain')
    if ed and ed == rec.get('email_domain') and ed not in SHARED_DOMAINS:
        return (f'same email domain as "{rec["name"]}" '
                f'({ed}) — one business, one initial email')
    if cand.get('phone') and cand['phone'] == rec.get('phone'):
        return f'same phone as "{rec["name"]}"'
    if cand.get('address_key') and cand['address_key'] == rec.get('address_key'):
        # Same civic address. Whether that means "same business" depends on
        # what is known about the units, and every other axis has already been
        # tried above — so reaching here means the civic number is the ONLY
        # thing these two share.
        #
        #   both units known    -> same unit is the same business
        #   neither unit known  -> the original protection: Vernon Landscape &
        #                          Stone Supply and Vernon Landscape Centre are
        #                          both "4620 23 St" and are one target
        #   exactly one known   -> a multi-tenant building. The civic number
        #                          alone is not evidence, and treating it as
        #                          evidence blocked four real prospects in run
        #                          18: Village Green Shopping Centre matched
        #                          Chatters Hair Salon (unit 530) — a mall
        #                          against a shop inside it — and North
        #                          Okanagan Orthodontics (unit 300) matched
        #                          Central Barbers. An orthodontist is not a
        #                          barbershop.
        ua, ub = cand.get('address_unit'), rec.get('address_unit')
        if (ua == ub) if (ua and ub) else not (ua or ub):
            return f'same street address as "{rec["name"]}" ({rec["address_key"]})'
    return None
