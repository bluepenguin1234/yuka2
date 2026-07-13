# Roadmap

## v1.0 — Launch (now)
Scanner + verdicts + stage-awareness + history. Free. The goal is trust and scan volume:
every scan either validates coverage or points at the next gap.

## v1.1 — Premium + conversion machine (weeks 2–4)
- RevenueCat subscriptions via RevenueCat Paywalls (remote A/B: choose-your-price annual vs
  $49.99/yr + 7-day trial — see GROWTH_PLAYBOOK.md)
- Conversion onboarding: ~12-screen outcome-led funnel with a frictionless 3-screen quiz,
  instrumented end-to-end with PostHog (75%+ reach-paywall target)
- AI label reader (photo → Claude vision → structured verdict; backend already written) —
  the premium hero feature and the answer to "no barcode" products
- Native review prompt after the 3rd successful scan (expo-store-review)
- Stage-change push notifications ("your trimester changed — so did your verdicts")
- Expo Updates for OTA fixes; OTA safety-DB refresh from `safety_ingredients`
- App icon/splash refinement, dark mode

## v1.2 — Trust loop (months 2–3)
- Safer-alternatives engine ("this moisturizer instead") — starts editorial, becomes data
- Search without scanning (premium)
- Share cards ("Mamama says…") sized for Instagram stories + parenting forums — the
  organic growth mechanic: every shared verdict is an ad with a citation
- In-app "was this verdict helpful?" → verdict-quality telemetry
- Exit offer on "Manage subscription": questionnaire → ~$24.99/yr retention offer for
  non-annual subscribers (disclosed to App Review; see GROWTH_PLAYBOOK.md)
- Supplements & prenatal-vitamin category; teas category (top forum topic)

## v2 — Moat deepening (months 3–6)
- Medications category (OTC first) — highest caution bar, LactMed-backed, biggest demand
- Community-reported products feeding the curation queue (Yuka's crowdsourcing playbook,
  now with a justification for accounts)
- Coverage dashboards from coverage_demand → publish "most-asked products" content (SEO)
- Healthcare partnerships: OB/midwife practices hand patients a QR code; practice-branded
  onboarding. Positions Mamama as the thing providers recommend instead of "don't Google it"
- Data licensing conversations (aggregate, anonymized category-demand insights for CPG) —
  never individual health data

## v3 — APAC + scale (months 6–12)
- Localization: start with markets where Open Food Facts coverage is strong (Japan strong
  packaged-goods data; also AU/SG as English-first APAC beachheads)
- Region-specific guidance layers (e.g., Japan's MHLW differs from FDA on some additives) —
  the schema already supports per-entry sources; add per-region risk overrides
- Android release (same codebase — `eas build --platform android` already works)
- Second-baby retention: "nursing → new pregnancy" stage transitions, family sharing

## North-star metrics
1. Weekly scans per active user (trust)
2. Coverage rate: % of scans returning a confident verdict (moat)
3. Verdict → premium conversion after AI label reader ships (revenue)
4. K-factor from share cards + friend referrals (growth)
