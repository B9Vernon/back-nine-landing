"""Shared helpers for the B9 Opportunity Engine tools.

The canonical business-name normalizer lives here and NOWHERE ELSE. Every
tool imports it. Runs 6-8 each hand-rolled their own version inside a
throwaway script, the versions disagreed on apostrophes, and duplicates
slipped through into finished lists three runs running. One definition
ends that.
"""

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
    r'\b(ltd|ltee|inc|corp|corporation|co|company|llp|llc|holdings|'
    r'enterprises|bc)\b'
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
    r'restaurant|cafe|centre|center|group|studio|services|service|society|'
    r'association|clinic|company)\b\s*$'
)


# Joining words that businesses add or drop freely. "Grace Bible Church of
# Vernon" and "Grace Bible Church Vernon" are the same congregation.
_STOP = re.compile(r'\b(of|the|and|at|for|in|on)\b')

# Organisational words dropped anywhere in the name, not just at the end.
# "Vernon Elks Lodge #45" and "Vernon Elks 45" are one lodge.
_ORGWORD = re.compile(r'\b(lodge|branch|chapter|no)\b')


def normalize_strict(name: str) -> str:
    """Strips legal suffixes, towns, trailing descriptors and joining words."""
    s = _ORGWORD.sub(' ', _STOP.sub(' ', normalize(name)))
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
