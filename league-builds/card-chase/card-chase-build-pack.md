# THE CARD CHASE — Eight-Round League Portal Build Pack

Build date: 2026-07-12; updated 2026-07-23  
Status: Complete creative build; owner-controlled values remain as placeholders. Nothing has been published or entered in the portal.

## 1. Event name

**THE CARD CHASE**

Public descriptor: **Eight rounds. Eight checkpoints. Stay in the chase.**

## 2. Event concept

An eight-round, two-person scramble season framed as a journey through eight competitive checkpoints. Each round advances the league story: early position, mid-season rivalry, late pressure, and a decisive final destination. The engine does not prescribe scoring, standings, handicap method, courses, tees, or schedule; Back Nine Vernon supplies those values.

## 3. Seasonal connection

Built for the late-summer-to-fall transition in Vernon. It lets outdoor golfers carry their season rivalries inside as daylight shortens and indoor demand returns. The eight-round commitment is intentionally positioned for the approaching fall indoor season rather than the middle of peak summer.

## 4. Professional-golf connection

Broad inspiration comes from the official 2026 professional fall calendar: an eight-event stretch in which players compete for future eligibility. The Card Chase borrows only the emotional idea of an eight-stop run with something meaningful at the end. It uses original Back Nine naming, graphics, and copy and does not imply affiliation or use protected tour marks, event names, logos, players, or likenesses.

## 5. Competitive hook

**Every round is a checkpoint. Every team can move. Round eight is the destination.**

The concept makes regular participation feel consequential without inventing a scoring system. Two-person teams have a position to protect, ground to gain, and a reason to return.

## 6. Poster / hero-image asset brief

- Primary asset: 1080 × 1350 px, PNG, sRGB; optional 1080 × 1080 and 1080 × 1920 variants.
- Design: premium “Copper Route” map over deep navy. A single illuminated fairway line travels through eight numbered checkpoints; checkpoint 1 is green, checkpoint 8 is gold, and checkpoints 2–7 are copper-outlined. Dark modern simulator architecture sits behind the route with one golfer in silhouette and no visible pro branding.
- Hierarchy: THE CARD CHASE → “Eight rounds. Eight checkpoints.” → “2-PERSON SCRAMBLE” → `{{EVENT_DATES}}` → Back Nine Vernon emblem.
- Placement: event name in upper third; route line through middle; date band above lower quarter; logo bottom-right inside a 5% safe margin.
- Palette: page dark `#07090D`, deep navy `#10171F`, Back Nine green `#96CB39`, copper `#F0A57A`, championship gold `#D4AF57`, info blue `#39B8DE`.
- Assets: exact Back Nine Vernon emblem from `NIB2/public/assets/b9-emblem.png`; optional approved simulator-bay photo from `landing-page-files/assets/`. Do not redraw the logo.
- Crop: keep name, checkpoints 1 and 8, dates, and logo intact. Side atmosphere may crop for square/story variants.
- Generation prompt: “Photorealistic premium indoor golf simulator interior at night, deep navy and charcoal architecture, one golfer in poised silhouette facing a luminous virtual fairway, subtle warm copper route line with eight tasteful circular checkpoints flowing toward a distant gold destination, controlled cinematic lighting, restrained Back Nine green accents, sophisticated championship atmosphere, high contrast, ample clean negative space for typography, at most one golf ball visible, no text, no logos, no brands, no trophies, no professional players, vertical 4:5 composition.”
- Export: `b9-card-chase-poster-1080x1350.png`, PNG or JPG ≥80% quality. Host at public HTTPS for the portal poster field.

## 7. In-depth sales-focused description

### 1 — Strong opening hook

One good night can start a run. Eight rounds decide whether you can finish it. The Card Chase turns every visit into another checkpoint—with a position to protect, ground to gain, and a reason to come back ready.

### 2 — Event overview

The Card Chase is an eight-round, two-person scramble league at Back Nine Vernon running `{{EVENT_DATES}}`. Teams compete under the league rules, scoring, settings, and schedule confirmed by Back Nine Vernon.

### 3 — Why players will want in

This is a complete season arc, not a one-off simulator booking. Every round adds weight. Every return visit brings a new chance to move. The finish means more because the field has travelled all eight checkpoints together.

### 4 — Competitive experience

Early rounds create the story. Middle rounds turn familiar names into real rivals. Late rounds bring pressure: protect your place, close the gap, or produce the round that changes everything. Round eight is where the chase ends.

### 5 — Social and community value

Compare rounds, follow familiar teams, choose a partner who complements your game, and keep the group talking between checkpoints. The league gives Vernon golfers a shared competition to return to as the season moves indoors.

### 6 — Prize and reward section

**PLAY FOR MORE THAN BRAGGING RIGHTS. TOP THREE TEAMS WIN PRIZES.** First, second, and third place will all be rewarded. Choose your partner, compete through all eight rounds, and earn your finish. Exact prize contents remain to be confirmed.

### 7 — Important event information

- Rounds: 8
- Dates: `{{EVENT_DATES}}`
- Registration deadline: `{{REGISTRATION_DEADLINE}}`
- Player format: 2-person scramble
- Participant limit: `{{PARTICIPANT_LIMIT}}`
- Member fee: `{{MEMBER_FEE}}`
- Non-member fee: `{{NON_MEMBER_FEE}}`
- Full Swing event code: `{{FULL_SWING_EVENT_CODE}}`

### 8 — Three-step registration

1. Register and pay with Back Nine Vernon: https://backninegolf.ca/local/vernonbc/tournaments/
2. Complete the event-specific Beyond the Grass setup: `{{BEYOND_THE_GRASS_URL}}` (the general verified page is used in the draft HTML until replaced).
3. Join on FS Compete: https://auth.fullswingapps.com/ and enter `{{FULL_SWING_EVENT_CODE}}`.

### 9 — Golf Canada Record & Reward

After each round, open the Golf Canada app, select **Back Nine Indoor Golf — Vernon**, and record the indoor session before leaving the bay. It takes about 10 seconds. Ask the rest of the group to record theirs too. Recording helps keep indoor and outdoor golf activity connected and supports Back Nine Vernon's presence in Canada's growing off-course golf community. No handicap or exposure guarantee is claimed.

### 10 — Final urgency and registration CTA

Eight rounds are waiting. The top three teams win prizes, and your team cannot reach the podium from outside the field. **CLAIM MY SPOT NOW.**

### 11 — Secondary membership pathway

Eight rounds reward the golfer who keeps showing up. Members can practise between checkpoints on their schedule, 24/7. **MAKE BACK NINE YOUR GOLF HOME:** https://backninegolf.ca/local/vernonbc/memberships/

## 8. Prize and reward section

The confirmed prize structure is first, second, and third place team prizes. Exact prize contents remain open and must not be invented. Do not add purse amounts, percentages, sponsor contributions, or guaranteed values without confirmation.

## 9. Three-step registration section

The portal HTML contains three numbered, thumb-friendly buttons using verified Back Nine and FS Compete links plus the verified Beyond the Grass general page as a functional temporary default. Replace the general Beyond the Grass link with the event-specific URL before publishing.

## 10. Golf Canada app section

The HTML uses the clickable “Golf Canada — Open the App” badge plus verified iOS and Android links, exact facility name **Back Nine Indoor Golf — Vernon**, app-first instructions, and compliant language. No reward is shown because none was confirmed.

## 11. Secondary membership section

One quiet block ties eight-round consistency to 24/7 practice and links to the verified Vernon memberships page. It remains visually secondary to registration.

## 12. Complete portal-ready HTML

- Portal fragment: `card-chase-portal.html`
- Notepad/copy-paste copy: `card-chase-portal.txt`
- Inline CSS only; no JavaScript, document shell, external CSS, or bare `#` links.
- Back Nine emblem and simulator photo are embedded as self-contained data URIs.

## 13. Image and value replacement list

No image URLs need replacement; the emblem and facility image are embedded.

Before publishing, replace these owner-controlled values everywhere they appear:

- `{{EVENT_DATES}}` — confirmed eight-round date range or round dates.
- `{{REGISTRATION_DEADLINE}}` — confirmed deadline (pack copy only; not used as CTA pressure in HTML).
- `{{PARTICIPANT_LIMIT}}` — confirmed field limit.
- `{{MEMBER_FEE}}` — exact member fee.
- `{{NON_MEMBER_FEE}}` — exact non-member fee.
- `{{FULL_SWING_EVENT_CODE}}` — exact code from the portal description.

## 14. Link replacement list

- Replace `https://www.beyondthegrass.com/compete` in the HTML with the event-specific Beyond the Grass URL once supplied.
- Back Nine registration: verified and filled.
- FS Compete: verified and filled.
- Golf Canada iOS/Android: verified and filled.
- Memberships: verified and filled.

## 15. Optional sponsor ideas

- **Route Partner:** a local automotive, travel, or logistics business attached to the eight-checkpoint journey.
- **Final Checkpoint Partner:** a local hospitality or golf retailer attached only to round eight and confirmed prizes.
- **Practice Partner:** a local golf service or fitter supporting between-round improvement.

No sponsor is represented as committed.

## 16. Consistency check

Passed concept, originality, seasonal, copy, compliance, link, HTML, contrast, mobile, CTA, and conduct checks. The build contains all 11 sales sections and all 17 pack items; uses eight rounds, two-person scramble, and top-three team prizes consistently; invents no prize contents or other controlled event values; uses only verified public links; contains no protected pro-golf branding; and has not been saved or published to the portal.

## 17. Recommended connections

One grouped owner input is required before final portal use: provide the confirmed dates, registration deadline, participant limit, member and non-member fees, Full Swing event code, exact first/second/third place prize contents, and the event-specific Beyond the Grass URL. An approved read-and-type browser session is optional later for `FILL B9 PORTAL`; it would be used only to verify rendering and fill approved fields, stopping before Save/Publish/Update/Submit.
