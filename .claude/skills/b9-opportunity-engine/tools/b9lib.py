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

# Legal suffixes and location qualifiers that never distinguish two businesses.
_NOISE = re.compile(
    r'\b(ltd|ltee|inc|corp|corporation|co|company|llp|llc|society|association|'
    r'holdings|enterprises|group|bc|vernon|coldstream|lumby|armstrong|enderby|'
    r'lavington|oyama|winfield)\b'
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


def normalize_strict(name: str) -> str:
    """Aggressive form: also strips legal suffixes and town qualifiers.

    Used only to SURFACE possible matches for human review, never to
    auto-reject — it collapses genuinely different businesses (e.g.
    "Kal Tire Lumby" and "Kal Tire Vernon" are separate branches).
    """
    s = _NOISE.sub(' ', normalize(name))
    return ' '.join(s.split())


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
