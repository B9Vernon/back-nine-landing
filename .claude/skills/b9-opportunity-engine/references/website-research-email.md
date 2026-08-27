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
