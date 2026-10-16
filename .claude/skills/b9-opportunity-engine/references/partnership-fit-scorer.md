# F. Commercial Fit Scorer — 0–100, hard gate at 65

Every prospect is scored before it can be delivered. Use
`tools/fit_score.py`, which exits non-zero if anything falls below the
threshold, and write the score into the ledger row.

**Superseded (runs 1–14):** a 1–10 band that explicitly "prioritizes, does
not eliminate", on the reasoning that Back Nine could partner with almost
any business. That reasoning is still true about *possibility* and no
longer governs *delivery*: it produced lists padded with businesses that
had no audience overlap and no credible two-way exchange. V2 keeps the
open-minded discovery and adds a closed gate at the end.

## The rubric

| Criterion | Points | What earns the top of the band |
|---|---|---|
| Audience overlap | 20 | They hold a defined group — staff, members, clients, guests, students, patients — that plausibly books a bay |
| Revenue potential | 20 | A realistic path to bookings, a corporate membership, an event, or paid TV placement |
| Proximity | 15 | Derived from the ring, not judged — `--km` sets it |
| Two-way value + likely reply | 15 | What B9 returns is concrete, and a real person will read the email |
| Timing | 10 | A verified, dated trigger (`trigger-timing-monitor.md`); evergreen scores 0 |
| Repeatability | 10 | Annual event, standing perk, recurring staff night — not one-off |
| Contact quality | 10 | Named decision-maker in a relevant role > published role address > generic inbox |

Proximity points by ring: 0–1 km 15, 1–3 km 14, 3–5 km 12, 5–10 km 10,
10–20 km 7, 20–30 km 5, 30–40 km 3, 40–50 km 1.

## Rules

- **65 is the floor for normal output.** Below it, the prospect goes to the
  rejection ledger with its score and is replaced.
- **Never inflate a score to reach a count.** An underfilled run with honest
  scores and a coverage audit is a good run; a full run of 66s that were
  really 50s is a bad one Neil finds out about later.
- Score before drafting. A rejected prospect must not have an email written
  for it.
- Audience overlap and revenue potential are 40 of the 100 points. A
  prospect scoring under 8 combined on those two is rejected regardless of
  total — proximity and a tidy contact do not make an opportunity.

## Worked example

Coldstream Truck Parts, 3240 48th Ave (ring 2), `parts@coldstreamtruckparts.ca`:

```
python3 tools/fit_score.py --name "Coldstream Truck Parts" \
    --audience 15 --revenue 14 --km 2 --value 12 --timing 5 --repeat 8 --contact 7
→ PASS 75/100
```

Audience 15: a shop floor plus the network of repair shops they supply.
Revenue 14: staff nights and group bookings from those shops. Timing 5:
seasonal slowdown is real but undated. Contact 7: a published role address,
not a named manager.

## What the old rubric still gets right

Discovery stays geographic and open — never restrict *who gets looked at*
by industry, and never assume a business must already want a golf
partnership. The gate is applied after the research, not before it.
