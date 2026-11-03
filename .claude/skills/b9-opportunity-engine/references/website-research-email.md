# Website Research Email (LOCKED RULES)

The core, proven workflow: research a company's real website/online presence,
then produce one copy-and-paste Gmail-ready email. Preserve this workflow's
research depth, tone, and quality. These rules are absolute.

## Locked email rules

1. The email body ALWAYS opens with a greeting personal to the recipient,
   on its own line, then the introduction sentence **verbatim**:

   ```
   Hi Katie,

   My name is Neil. I run Back Nine Golf, the 24/7 indoor golf lounge here
   in Vernon. …
   ```

   - The greeting names who it is for. Verified first name when one is
     known (`Hi Katie,`); otherwise the business's short natural name
     (`Hi Triumph Coffee team,` — drop "The", location suffixes, legal
     suffixes, store numbers).
   - Never a bare `Hi,` — the greeting must name who it's for.
   - **Cold outreach only** — warm contacts (they replied, met Neil, or are a
     partner) get no introduction at all; see "Warm contacts" below.
   - The introduction is the exact sentence `My name is Neil.` — not
     "I'm Neil", not "I'm Vernon", not "It's Vernon", not "We are Back
     Nine", not any other variation.
   - Identify Neil as the owner of Back Nine Golf Vernon where it helps.

   **Superseded wording (runs 1-14):** the inline form
   `Hey [recipient] team, I'm Neil.` This was locked and shipped for
   fourteen runs. Neil's V2 upgrade brief replaces it with the exact
   sentence above; the split greeting keeps everything the old rule
   protected (the greeting still names the recipient, there is still no
   bare opener) while satisfying the new requirement. `verify_deliverable.py`
   enforces the new form and will fail a file written the old way.
2. NO typed sign-off block. No "Best regards," no name/title/phone/address
   lines — Gmail carries Neil's signature. End the message naturally with a
   simple question or soft next step.
   Example ending: "Would you be open to a quick conversation about something like this?"
2a. LOCKED TV-advertising wording — whenever an email mentions the facility
    TVs it must read as a paid partnership offering, never a freebie. There
    are TWO approved forms; both are Neil-approved and both must keep the
    claim wording intact.

    **Form A — local businesses (the TV offer is secondary).** Use this
    exact pattern, swapping in the business's name:
    "...and we'd love to talk about featuring [Business] as a partner on
    the TVs across our facility — 24/7 advertising seen by hundreds of
    people a week, with a QR code sending the people straight to your
    website."

    **Form B — farther-out businesses (the TV offer is the whole pitch).**
    Approved run 9. Used when the business is far enough away that a perk
    swap or staff-night trade isn't credible — Salmon Arm, Sicamous,
    Kelowna and beyond. The email says plainly that it is an advertising
    offer, explains what the Vernon audience is worth to that specific type
    of business, and carries this claim verbatim apart from the final noun:
    "24/7 advertising seen by hundreds of people a week, with a QR code
    sending them straight to your [website / menu / booking page]."
    Form B emails also offer a staff night on the simulators, since a
    distant team will still travel for an evening out.

    Never say "feature you on our TVs" or "we'll put you on our screens"
    without paid framing — those read as free advertising. The
    "hundreds of people a week" figure is the only audience claim approved
    for either form.
2b. LOCKED — NOTHING IS FREE. Staff nights, group nights, team
    evenings, tournaments, private bookings and events are all things a
    business BOOKS. They are never given away, and the email must never
    imply otherwise.

    BANNED phrasings (the email fails if any appear):
      "on me" / "on us" / "first round's on us"
      "I'd like to host you/your team/a group of them"
      "would be welcome at one of our staff nights"
      "as a thank-you" / "no catch" / "nothing attached to it"
      "the bays are yours" / "for nothing" / "our treat"
      "free", "complimentary", "no charge", "gift"

    APPROVED phrasings — state that we run them, invite a conversation,
    never offer them as a gift:
      "we run staff nights for teams across the valley — happy to send
       over how they work"
      "we do a lot of group bookings for teams like yours"
      "worth knowing we host workplace nights and private bookings"
      "if your team ever wants a night out, that's something we set up
       regularly"

    Do NOT swing the other way and start listing prices or hard-selling
    "you can buy events and extras here". Neil's instruction is simply
    that it must not read as free. State the offering plainly and let him
    quote on the reply.

3. AFTER the soft close, every email ends with exactly two footer elements,
   in this order:
   - the Back Nine Vernon website link on its own line:
     `https://backninegolf.ca/local/vernonbc/`
   - the Back Nine Vernon logo image directly BELOW the link
     (canonical file: `../assets/b9-vernon-logo.png` — the square black
     logo with the b9 mark, "BACK NINE®" in white and "VERNON" in green).
   In plain-text TXT deliverables, include the link line in every email
   body; the logo image itself is added when composing in Gmail (pasted
   below the link, or carried in the Gmail signature). Never write a
   placeholder like "[logo]" inside the email body text.
4. Never sent automatically. Drafts only — Neil reviews and sends manually.

## Per-company procedure

1. Review the official website / public online presence.
2. Understand what the company does and who they serve.
3. Notice something specific, useful, or complimentary (1–2 real details).
4. Choose the single most relevant Back Nine partnership angle
   (see `partnership-angle-matcher.md`) — one angle, not a menu.
5. Write one concise email: subject + body.

## Never assert the recipient's own calendar (locked, run 23)

Run 23's first draft told a volleyball club its tryout season was starting,
told a bus-repair shop which month its crews were busiest, told a farm it was
in its hardest six weeks, and told a stereo shop when its phone starts
ringing — none of it verified, all of it presented as fact. This is exactly
what `trigger-timing-monitor.md` already prohibits ("Never infer an event, a
date, an anniversary or a milestone... Do not manufacture urgency") but the
rule lived in a file the drafting step wasn't reading against. It is now
locked here, at the point where the email actually gets written.

- A dated, sourced trigger (an event, an anniversary, a published date) may be
  stated as fact — that's what module D / `trigger-timing-monitor.md` verifies.
- Anything about the RECIPIENT's own internal calendar, busy season, sales
  cycle, or schedule that was not independently confirmed is a guess. Either
  drop it, or turn it into an explicit question/conditional ("if X is ever
  something you're planning...", "whenever your slow season lands...").
  Never write it as a statement of fact about a business you found in a
  tenant list or directory and have not otherwise verified.
- A general, already-documented seasonal pattern for the region (the Vernon
  shape in `trigger-timing-monitor.md` — outdoor trades slowing in fall, for
  example) may be referenced as a general trend. It may not be presented as
  something true of the specific recipient unless verified for them.
- The calendar date itself (what month it currently is) is always fine to
  reference — that's not a claim about anyone's business.

## Warm contacts — no self-introduction (locked, run 25)

The `My name is Neil.` introduction is for people who have never heard from
Neil. Run 25 wrote year-end invitations to 32 businesses that had already
replied to him — most of whom he had met — and opened every one with the
cold introduction. Neil's ruling:

> "I have already introduced myself to these people and most of them I have
> met. Don't say I am Neil the owner of Back Nine. They already know that.
> Re-word the emails' opening to a sentence that we already know each other
> ... something more professional."

So, for anyone who has replied to Neil, met him, or is an active partner:

- **No introduction.** Not "My name is Neil.", not "I own / run Back Nine",
  not "the owner of Back Nine". The greeting line stays (`Hi Lisa,`).
- **Open the way you'd write to someone you know**, then pick up their own
  reply: "I hope all is well at the studio. I'm following up on the quote I
  sent on September 19..." / "Good to be back in touch, and congratulations
  again to you and your brother." Professional, not chummy — no "hey,
  remember me?"
- **Only mention an in-person meeting that Gmail shows happened** (a "thanks
  for coming by today" email, a confirmed time). Otherwise use a line that's
  true either way: "since we last connected", "good to be back in touch".
- **Personal details only if they shared them** (Colton's wedding, Travis's
  procedure, Megan being unwell), and only warmly.
- Vary the openings across a batch; every other locked rule still applies.

Verify with `tools/verify_deliverable.py FILE --warm` — it fails any
self-introduction and implies `--second-contact`. The cold rule above is
unchanged for everyone else.

**Mixed batches (run 26).** Neil: "If I have contacted them before then
don't have the opening sentence saying who I am." When one file mixes first
contacts with businesses he has already emailed, decide PER ENTRY:

- "Contacted before" means an email Gmail's Sent folder shows going to that
  business — not a log row. Most log rows are drafts ("email created") or
  form/phone listings that were never emailed.
- Record each confirmed send in the log as `| sent DATE (Gmail)` (or
  `| replied DATE | ...`). The ledger turns that into
  `sent_status: confirmed`.
- No reply yet? Open on the earlier note itself ("You may remember my note
  from July about...", "I wrote to you in July with..."), never "Hi again"
  with nothing behind it. Met in person? Say where.
- Verify with `tools/verify_deliverable.py FILE --mixed`: it fails a
  confirmed-sent entry that re-introduces Neil, and a first-contact entry
  that doesn't.
- Search Sent by the company's DOMAIN and by every address the log has ever
  held, not only the one being used now (run 28). Three businesses that
  looked like first contacts had been emailed at a different address.
  An old shawbiz.ca inbox, a named person, and a June invitation sent before
  the engine existed.

## Who to pick for year-end parties (locked, run 27 feedback)

Neil, on #27: "WAY too many societies and non-profit companies. You need to be
smarter in the companies you choose. Think of golfers and golfing for people.
Mostly male as well. Not old people and nursing homes. Offices and companies
with around 30 people and under."

Choose businesses whose staff are the kind of people who golf:

- **Yes:** trades and contractors (electrical, plumbing, HVAC, roofing,
  excavation, building), auto dealers and shops, equipment and industrial
  suppliers, manufacturers and machine shops, real estate and mortgage
  offices, insurance and financial brokers, law and accounting firms,
  engineering and surveying firms, construction and logistics companies,
  breweries and distributors, sales offices. Roughly 5-30 staff.
- **No:** non-profits, societies, foundations, charities, churches, museums
  and galleries, schools, seniors' residences and care homes, government
  agencies, health-authority bodies, and 100+ staff organisations.
- **Use sparingly:** dental, optometry, physio and salon staffs (mostly
  women, small teams) and retail shops. Only if little else is left nearby.
- Score "audience_overlap" low (max 8) for anything in the No list, so it
  fails the 65 floor on its own.

## Year-end invitation wording (locked, run 27)

Neil retired the run 24-26 closer ("If a Christmas or year-end night is on
the list, it's quoted by the group. Worth a quick chat?"). He wanted the email
to get to the point sooner and to sell the idea: "doing the party at a
restaurant you only get to chat with a few people, but at B9 you get your own
private bays and get to see everyone as well as be active or chill in the
lounges." He also rejected "Can I send you a few dates and a price?" and asked
for the direct question. The approved shape:

- **Subject:** `Does a year-end party at Back Nine interest you?`
- **Body order:** intro (cold only) or a warm opener on the earlier note,
  then the question, word for word or close to it: "Does having your
  Christmas or year-end party at Back Nine interest you?" The question comes
  early, not at the end.
- **Then the contrast,** tailored to the business: at a restaurant the crew
  sits at separate tables and you leave having talked to a handful of people.
  Here they get private bays together, everyone is in the same room, and people
  can jump in and play or just hang out in the lounge.
- **Then the 24/7 line,** tailored ("so it can start once the last patient's
  gone", "after the gallery closes"). For shift workers, keep it conditional:
  "if your people work shifts, ...".
- **No closing ask.** No "dates and quotes", no "worth a chat?", no "could
  you pass this on". The question already is the ask.
- Every other locked rule still applies: nothing free (not even "whenever
  they're free"), no food or bar, no season or calendar claims, no December
  pressure, no typed signature.

## Output format (exact, per business)

Emails only — no research metadata. Do NOT include category, location,
website, partnership-angle, fit-score, fit-notes, source, or duplicate-check
lines in the deliverable; that work still happens, it just stays internal.

```
[#]. [Business Name]
To: [verified public email address — no forms, no phone numbers]
Subject: [subject line]

Hi [recipient],

My name is Neil. [rest of body, ending with the soft-close question]

https://backninegolf.ca/local/vernonbc/
```

Separate entries with a `---` line. The file starts with a short header only
(title, date, public-contact note, CASL reminder) — nothing else.

## Voice

Concise, warm, specific, local, confident, professional, easy to reply to,
lightly persuasive. Not spammy, not desperate, not robotic, not long. The
email must show the business was actually looked at — mention one or two
specific details. It should feel like Neil starting a real local business
conversation, never mass outreach.

## Honesty rules

No misleading subject lines. Never imply an existing relationship or
partnership. No invented claims about Back Nine's customer numbers, TV
views, or results beyond the locked "hundreds of people a week" TV-traffic
line in rule 2a (Neil-approved) — everything else stays to verified facts.
