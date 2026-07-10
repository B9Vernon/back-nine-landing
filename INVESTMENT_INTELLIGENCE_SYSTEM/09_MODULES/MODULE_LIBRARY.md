# MODULE LIBRARY — reusable procedures (invoked by commands in 00/COMMANDS.md)
M01 GLOBAL-RESEARCH-DISCOVERY: assemble/refresh Top-10 panel per 02/ACTIVE_RESEARCH_PANEL rules.
M02 RESEARCH-QUALITY-SCORE: 10-criterion 0-5 rubric; drop sources scoring <30/50.
M03 SYNTHESIS: cross-source agreement/disagreement matrix → theme candidates.
M04 THEME-RANK: 18-factor rubric (03/THEME_SCORECARDS format).
M05 CHAIN-MAP: demand origin → 1st/2nd/3rd degree → bottlenecks → losers (03/ECONOMIC_CHAIN_MAPS format).
M06 DISCOVERY-10: per theme, ~10 non-obvious CA/US-listed names, favouring 2nd/3rd degree + bottleneck owners.
M07 VERIFY-SECURITY: ticker→legal name, exchange, currency, type, listing status, provider,
    strategy, dist. frequency+amount+dates, MER, leverage, holdings. Fail → AMBIGUOUS, no analysis.
M08 BUSINESS-QUALITY: company checklist (mandate §14a) / fund checklist (§14b).
M09 DIVIDEND-SAFETY: streak, payout (EPS+FCF), coverage, balance sheet, policy language.
M10 DISTRIBUTION-SOURCE: split dividends/interest/premiums/gains/ROC from fund tax docs (T3 breakdowns, provider reports).
M11 YIELD-TRAP-DETECT: flags = falling NAV, cuts, ROC masking, leverage, coverage<1, dilution,
    vol dependence, refinancing dependence. ≥2 flags → not ACT-eligible.
M12 ETF-LOOKTHROUGH: resolve to underlying issuers; aggregate across portfolio.
M13 OVERLAP: factor buckets (US mega-cap, CA banks, CA energy, crypto-vol, rates, short-vol structure).
M14 TAX-LOCATE: per 04/ACCOUNT_LOCATION rules; output one line; flag professional confirmation.
M15 VALUATION: ≥2 methods per security type; grade Deeply attractive→Extremely expensive.
M16 SIGNAL-MONITOR: filings/dividends/guidance since last run; classify thesis state.
M17 RED-TEAM: independent bear case BEFORE conviction assignment; has veto/demotion authority.
M18 THESIS-BREAKERS: define condition/metric/threshold/source/distance/priority/response; no invented thresholds.
M19 STRESS-TEST: 20+ scenario grid (mandate §22); one-word grades.
M20 CONVICTION-SCORE: 0-100. Weights: filters 20, thesis durability 12, business quality 12,
    dividend/distribution safety 12, valuation 10, total return 10, downside 8, overlap 6,
    evidence quality 5, red-team 5. Hard vetoes override any score: failed filter, broken
    thesis, unreliable data, unsustainable distribution, unresolved red-team concern.
M21 CLASSIFY: map score+vetoes → position classification (mandate §24).
M22 REPLACE-ANALYZE: side-by-side per mandate §26; must state main reason NOT to replace.
M23 ALERT-PRIORITIZE: Critical/Important/Monitor/Suppressed; no price-noise alerts.
M24 FRESHNESS-VALIDATE: every displayed number has retrieved+effective dates; stale → flag/suppress.
M25 DUPE-SUPPRESS: hash-based (08/DUPLICATE_ALERTS.md).
M26 HEALTH-CHECK: sources up, tickers mapped, reconciliations, logs written.
