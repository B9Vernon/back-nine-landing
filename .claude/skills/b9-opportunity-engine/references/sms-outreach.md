# SMS Outreach (command-gated)

Runs ONLY when Neil asks for text-message lists. Never runs automatically,
never suggests itself, never sends. Drafts and number lists only — Neil
sends from his own phone or texting tool.

## Job

Turn phone numbers already captured in the outreach log into batched SMS
lists with one generic invitation message. SMS reaches the ~76% of logged
businesses that never had a usable email, so it is the cheapest way to add
reach without any new discovery.

## Procedure

1. Extract phone numbers from `state/outreach-log.md` and any prospect TXT
   deliverables. Build with `tools/extract_phones.py`.
2. Keep local area codes only: **250, 778, 236**. Drop toll-free (800, 833,
   844, 855, 866, 877, 888) and out-of-province numbers — those ring call
   centres and head offices, not the local owner.
3. De-duplicate by number, and carry the business name alongside each one so
   Neil knows who he is texting when a reply comes back.
4. Batch into lists of 50 unless Neil asks otherwise.
5. Write one generic message — the same text for every number. SMS is not
   personalized the way the emails are.

## Message rules

1. Opens by naming Neil AND Back Nine. Unlike the emails, the sender must
   be identifiable from the message itself — there is no Gmail signature
   carrying it.
2. States why he is making contact, then asks a question.
3. Gives the email `vernon@backninegolf.ca` as the reply path, plus the
   website link `backninegolf.ca/local/vernonbc/`.
4. Ends with `Reply STOP to opt out.`
5. **Plain ASCII only.** No em dashes, no curly quotes, no accented
   characters. A single non-GSM-7 character flips the whole message to
   Unicode encoding, which cuts an SMS segment from 153 characters to 67
   and more than doubles the per-message cost. Use straight apostrophes and
   plain hyphens. `tools/extract_phones.py --check-message` enforces this.

## Why the identification and opt-out are not optional

Canada's anti-spam law treats a commercial text the same as a commercial
email. These numbers qualify under the "conspicuously published business
contact information" exemption — the business published the number, and the
message relates to their business — but that exemption only holds if the
message identifies the sender and offers a way to opt out. Rules 1 and 4
are what keep it lawful; do not let a rewrite drop them.

## Current asset

`B9-SMS-Invitation-Lists.txt` — 265 local numbers in 6 lists (five of 50,
one of 15), built 2026-07-26 from runs 1–8. Message approved by Neil:

```
Hi, Neil here from Back Nine Golf, Vernon's 24/7 indoor golf lounge on 45th
Ave. I'm putting local partnerships together - staff nights, two-way
customer perks, advertising on the TVs across our facility - and it all
makes more sense once you've actually stood in a bay. Would you like to
come by and have a look? Email me at vernon@backninegolf.ca
backninegolf.ca/local/vernonbc/
Reply STOP to opt out.
```

Reuse this wording unless Neil asks for a change. If he does, keep rules
1–5 intact and show him two options before building the final lists.
