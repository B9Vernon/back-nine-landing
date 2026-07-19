# B9 Spectacle Event Designer — Visual Upgrade Layer

A support layer inside the B9 League & Tournament Engine. It does **not** replace or
rewrite any existing workflow — concept, sales copy, prize copy, three-step
registration, Golf Canada section, membership, portal fields, HTML builder, memory, and
every Vernon-controlled value stay exactly as the engine defines them. This layer
upgrades **presentation only**: it makes a finished event page look like a premium
sports campaign instead of a booking notice.

The event's *information* is owned by the engine. The event's *impact* is owned here.

## When this layer runs

- Automatically inside every `BUILD B9 LEAGUE` and `BUILD B9 TOURNAMENT` (applied as the
  page is styled — engine step 7, and reflected in the poster at step 8).
- On `UPDATE B9 EVENT` when the change touches design: portal HTML, poster, hero, CTA,
  prize section, registration presentation, Golf Canada section, membership section,
  mobile presentation, or any "make it look better / more exciting / more premium"
  request.

It never runs on its own. It activates only through the engine's own commands, and the
engine still obeys the ABSOLUTE ACTIVATION RULE — nothing happens in the background.

## The reaction to engineer

Every finished page must make a golfer feel: *this looks like a real event — I want to
be part of it.* Design to make them stop scrolling, read, explore, click a registration
button, compete for the prize, bring a friend or teammate, record their round with Golf
Canada, come back for the next event, and consider membership.

## Non-negotiable inheritance (never overridden by "make it pretty")

These engine rules win over any styling instinct:

- **No invented Vernon-controlled values** — dates, fees, limits, format, rules,
  prizes, purse, sponsors, event code, per-event links stay as supplied values or
  `{{PLACEHOLDERS}}` (see `templates/portal-build-pack.md`).
- **Verified links only** — never guess a URL. Use the verified defaults in
  `html-builder.md` / `three-step-registration.md`, Vernon-supplied links, or a
  placeholder listed for replacement.
- **Contrast rule (mandatory)** — never near-black text on dark navy/charcoal. Dark
  sections use `#F2F2F2` or a bright accent; near-black is only allowed as text on a
  bright element (button/badge).
- **Highlight/feature cards are stacked block elements — never `display:flex`.** Flex
  feature cards stretched on phones in Vernon's portal. Stack them (see the template).
- **Inline CSS only, zero JavaScript**, one contiguous copy-paste fragment, no
  doctype/html/head/body.
- **Images are self-contained** — external image hosts (including backninegolf.ca) are
  blocked from this environment, so embed brand logos and photos as optimized base64
  data URIs (per `html-builder.md`). "Public HTTPS URL" only applies to an asset Vernon
  confirms is publicly hosted; otherwise embed.
- **No fake urgency** — no countdown timers, no "spots filling fast" unless Vernon
  verifies it. Real field limits and supplied deadlines are fine.
- **No unauthorized pro-golf photography, logos, or player likenesses.**

## Visual standard

Bold · colourful · premium · modern · high-energy · immersive · polished · competitive ·
layered · easy to explore · unmistakably Back Nine Vernon.

Never ship: plain white pages, text-heavy walls, weak grey boxes, thin lifeless buttons,
tiny text, one-photo pages, generic golf templates, or anything that reads like an
ordinary booking form. Vibrant but controlled — never visual chaos.

## Colour system — build rhythm, don't monotone

Palette: green `#96CB39` · deep navy `#10171F` · page-dark `#07090D`/`#0D1520` · white
`#FFFFFF` · soft white `#F2F2F2` · charcoal `#333333` · gold `#D4AF57` · bright blue
`#39B8DE` · peach-copper `#F0A57A` (sparingly).

Alternate section backgrounds so the page moves. Proven combinations:

- navy background + green border; green block + dark navy text
- gold-framed prize block; bright-blue Golf Canada block; peach-copper social block
- white card inside a dark section; dark card with a colourful outline
- alternating bright/dark panels; multi-colour gradient accents

Signature device: **colourful borders and blocks** — thick green hero frame, gold prize
border, coloured left-rails, layered/offset borders, bright number badges, framed
photos, premium shadow/glow. Never thin generic grey outlines. Use radius, spacing,
depth, and contrast so sections feel tactile and clickable.

## Typography

Approved brand fonts when a connected/websafe asset exists (Parsi Bold, Novin Bold,
Eurostile Next Pro Extended Semi Bold, Helvetica Bold Italic). Do **not** distribute or
embed font files. Default to the reliable portal stack
`-apple-system,'Segoe UI',Roboto,sans-serif` and create hierarchy through size, weight,
case, and colour:

- **Event title** — large, bold, dominant
- **Opening hook** — short, competitive, strong
- **Section titles** — bright, uppercase, scannable
- **Prize message** — oversized, prominent
- **Body** — clean, short paragraphs, ≥16px
- **CTAs** — large, bold, unmistakable

Move the strongest sales lines out of paragraphs and into visual callouts.

## Design architecture (a visual journey, not stacked boxes)

Style the engine's sections as distinct experiences — not ten identical cards, not one
background colour end to end:

1 Hero experience · 2 Opening competition hook · 3 Prize teaser · 4 Event experience
overview · 5 Why players want in · 6 Competition highlights · 7 Image story · 8 Event
information (only supplied values/placeholders) · 9 Prize & reward feature · 10 Social /
team experience · 11 Three-step registration · 12 Golf Canada app · 13 Membership · 14
Final urgency · 15 Final registration CTA · 16 Branded footer.

Merge or drop sections the engine didn't populate (e.g. no dates → no dates strip); the
count is a menu, not a mandate. Keep the engine's canonical section order and IDs from
`html-builder.md` / the template — this list is how to *dress* them.

### Hero
Large hero image, event title, short competitive tagline, dates + format **when
supplied**, prize teaser, primary registration button, optional details/jump button,
bold colour treatment, Back Nine branding, dark overlay for legibility, bright frame.
Never open the hero with a long paragraph — the event must read in seconds. Big
mobile-friendly CTA.

### Image-rich
Use several purposeful images (hero, competition action, bay, reaction, team/social,
prize, Golf Canada app visual, final championship). Every image must strengthen
competition, emotion, social connection, prize value, urgency, premium atmosphere, or
brand recognition — never filler. Prefer real B9 Vernon bay/facility photos, approved
event/customer photos, Neil/Vernon character sheets, logo assets, or cinematic visuals
grounded in the real facility. All embedded base64, `max-width:100%`, alt text on every
image.

## Image creation & prompts

When image-generation tools are connected (e.g. Higgsfield), consider producing: hero,
portal poster, competition-action, prize, social/team, Golf Canada app visual, final
CTA. Ground every generation in the connected B9 references — facility, bays, character
sheets, logos, palette, wardrobe, prior approved designs.

When direct generation is unavailable, write a production-ready prompt per required
image. Every prompt states: exact B9 Vernon location · people shown · outfit · action ·
emotion · camera angle · lighting · colour palette · simulator screen content · Back
Nine logo placement · composition · aspect ratio · text-safe area · realism
requirements · negative constraints. Never a generic "golfer in a simulator" — describe
a specific cinematic moment inside Back Nine Vernon. (See `poster-visuals.md` and
`../templates/poster-brief.md`.)

## Interaction without JavaScript

Create an interactive feeling with safe inline HTML/CSS only: large CTA buttons, in-page
anchor/jump links to registration, linked cards, image buttons, clearly separated
progress-style registration steps, tap-friendly prize/membership cards, raised cards,
responsive button stacks, highlighted deadline/callout boxes, ribbons. Hover colour
changes are fine where supported but never required. Every clickable element must have a
real verified destination — nothing that looks clickable but does nothing, and no
JavaScript.

## CTA system

Strong, high-contrast, generously padded, rounded, coloured-shadow, full tap target on
mobile, short action wording. Style by role:

- **Primary** — bright green on dark navy (registration + final CTA)
- **Secondary** — bright blue/white with coloured outline (details/jump)
- **Prize** — gold with dark navy text
- **Golf Canada** — blue/green app button
- **Membership** — dark premium button with green or gold border

Approved wording (pick the clearest, then stay consistent): JOIN THE COMPETITION ·
REGISTER NOW · ENTER THE TOURNAMENT · JOIN THE LEAGUE · PLAY FOR THE PRIZE · BUILD YOUR
TEAM · VIEW EVENT DETAILS · OPEN THE GOLF CANADA APP · DOWNLOAD THE GOLF CANADA APP ·
EXPLORE B9 MEMBERSHIP · SECURE YOUR PLACE · CLAIM MY SPOT NOW. Never "Click Here",
"Learn More", or "Submit". **Do not randomly reword the registration action** across the
page — repeat one primary action consistently. The engine's verified defaults already
wire these buttons; keep those hrefs.

Place CTAs at: hero · after the first hook · after the prize section · inside
registration · after Golf Canada · final section. Multiple opportunities, not a button
in every paragraph.

## Section-specific design

- **Prize** — gold/green/bright-blue treatment, large headline, icon/image, strong
  border, spotlight effect, short competitive copy, dedicated CTA, "prize details to be
  announced" when unconfirmed. Communicates *something real to compete for* and *you
  must enter to win* — never an invented value. (Copy per `prize-copy.md`.)
- **Registration** — three large visual cards, big step number each, short explanation,
  unique colour (Step 1 green · Step 2 blue · Step 3 gold/peach-copper), large CTA,
  verified link, mobile spacing. Instantly obvious what to do. (Flow per
  `three-step-registration.md`; surface `{{FULL_SWING_EVENT_CODE}}` in step 3.)
- **Golf Canada** — app-first and modern: phone-style visual, bright app CTA, short
  three-step instruction, "record before you leave" + "about 10 seconds", group
  participation, confirmed reward only when supplied, iOS/Android buttons, QR for
  desktop when applicable. Exact facility name **Back Nine Indoor Golf — Vernon**.
  Visually prominent but secondary to registration. (Per `golf-canada.md`.)
- **Membership** — premium dark panel, bright border, lifestyle image, short headline,
  one clear CTA, brief copy. Secondary — never turn the page into a membership sale.
  (Per `membership.md`.)
- **Poster** — every full build includes a spectacular poster: title, competitive
  tagline, dates + format when supplied, prize message when appropriate, B9 logo, bold
  colour, cinematic facility-grounded visual, readable hierarchy, premium frame,
  mobile-friendly crop, small-size legibility. Portal version always; social-portrait
  and widescreen-hero versions when useful. (Per `poster-visuals.md`.)

## Mobile-first (most viewers are on a phone)

Design desktop and mobile together — never a desktop page that merely shrinks. Verify:
headlines wrap cleanly, buttons are easy to tap and full-width where appropriate, images
scale, sections stack logically, text stays readable, borders don't crowd content,
registration cards stay clear, **no horizontal scroll**, no tiny labels, no multi-column
block becomes unreadable. Confirm on a real phone-width render before delivery.

## Design variety (don't reskin one template)

Keep the brand while varying colour emphasis, hero composition, border style, image
treatment, card layout, section styling, typographic emphasis, emotional tone, and
seasonal feel across events. Visual identities to draw from: championship gold · winter
blue-and-green · high-energy team competition · spring-major atmosphere · dark survival
challenge · bright social scramble · premium member-guest · corporate cup · playoff
series · modern points race. Log each event's visual identity in
`../memory/event-log.md` so the next build looks different.

## Asset requests — be specific, never vague

When a stronger page needs assets, ask Vernon for the exact item and say why, whether
it's essential, and what you can still deliver without it. Examples: the exact B9 logo
lockup, approved font references, specific bay/facility photos, character sheets, sponsor
logos, prize/merchandise photos, prior approved posters/HTML, a per-event registration
or Beyond the Grass URL, the Golf Canada reward, the membership URL. Never ask for "brand
assets" in the abstract. (Protocol: `connections.md`.)

## Deliverables (fold into the engine's 17-item Portal Build Pack)

Add or upgrade, without removing any existing pack item: 1 Visual concept · 2 Colour
plan (primary/secondary/accent) · 3 Typography plan · 4 Hero design · 5 Poster (or
production-ready prompt) · 6 Image plan (each image + purpose) · 7 Image prompts when
generation is unavailable · 8 CTA system (wording/style/colour/destination) · 9
Interactive elements list · 10 Complete portal HTML · 11 Mobile review · 12 Visual
quality check.

## Visual quality audit (run silently before delivery — fix, then ship)

Confirm: visually spectacular and premium · bright B9 colours throughout · colourful
borders/blocks used · several meaningful images · powerful hero · prominent prize
section · registration instantly clear · large clear CTAs · feels interactive · every
clickable element has a real destination · zero JavaScript · strong mobile · typography
matches the B9 system · logo treatment accurate · contrast readable · not mostly white ·
not text-heavy · not repetitive · no unverified claims · no invented Vernon-controlled
detail · the page makes the event feel worth joining. If it does not create an immediate
desire to explore and register, redesign before delivering.

## Operating principle

Don't decorate the page — use colour, type, images, borders, blocks, layout,
interaction, and visual storytelling to sell the competition, the prize, the social
experience, the status, the excitement, and the chance to belong. The finished page
should feel closer to a premium sports-event landing page than a simulator booking
description — while every fact on it still comes from the engine and from Vernon.
