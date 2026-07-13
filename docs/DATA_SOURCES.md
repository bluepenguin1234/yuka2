# Data Sources & Coverage Strategy

*The hard part is the data: safety evidence is scattered across sources that disagree, so
verdict logic must encode medical caution without overclaiming. This doc is the contract for
how every database entry gets made.*

## Product data (what's in the thing being scanned)

| Source | Coverage | Notes |
|---|---|---|
| Open Food Facts | ~3.5M food products, strong EU/US | Free API, ingredients + additives_tags (E-numbers) + categories + ABV |
| Open Beauty Facts | ~500k cosmetics | Same API shape; INCI ingredient lists |
| (later) GS1/brand feeds | gap-filling | Only if scan demand justifies cost |
| (later) AI label reader | anything with a label | Photo → Claude vision; already built server-side |

## Safety evidence (what it means for pregnancy/nursing)

Tier 1 — always preferred, citable in-app:
- **MotherToBaby / OTIS** fact sheets — the gold standard for exposure summaries
- **NIH LactMed** — the breastfeeding database; effectively the entire `bf` column
- **ACOG** clinical guidance
- **FDA** (additives, GRAS, mercury-in-fish advisories), **NHS**, **EFSA** (E-numbers), **CDC**

Tier 2 — corroboration only, never sole source:
- EWG Skin Deep (hazard-flagging is broader than clinical consensus — useful as a caution
  signal, biased toward alarm), AAD, Mayo Clinic, peer-reviewed reviews.

## Curation rules (every entry, no exceptions)

1. **Conflict → stronger warning.** If FDA says fine and MotherToBaby says limit, we say limit.
2. **Stage-specific where real.** Retinoids: avoid pregnant/caution nursing. Sage & peppermint:
   fine pregnant/caution nursing (milk supply). Liquorice: escalates in later pregnancy.
3. **Real, checkable sources.** Org topic pages over invented deep links. Every entry 1–3.
4. **Dose context in the detail text** ("in food amounts" vs "supplemental doses") — verdicts
   are per-ingredient-presence, so the text must carry the nuance.
5. **Plain English, no fearmongering.** Summary ≤60 chars; detail 2–4 sentences a tired
   mother can absorb in a store aisle.
6. **Benign entries matter.** ~30% of the DB is "safe" entries so clean products read as
   informative reassurance, not an empty screen.

## Verdict-language contract (never violate)

- Red = "Not recommended" (guidance says avoid at this stage)
- Amber = "Use caution" (limit / discuss with provider)
- Green = "**No flags found**" — NEVER "safe"
- Gray = "Limited data" (we won't pretend)
- Coverage sentence always visible; disclaimer card on every verdict screen.

## How coverage grows (the moat mechanism)

1. Unresolved barcode → anonymous `coverage_gaps` row (barcode + stage only).
2. `coverage_demand` view ranks gaps by scan volume.
3. Weekly: top gaps get products identified → missing ingredients curated into the DB with
   the rules above → shipped (bundled now; OTA via `safety_ingredients` in v1.1).
4. Scan frequency by category tells us which category to open next (supplements and teas are
   the predicted front-runners from forum-demand research).

Each cycle makes the database — and the verdict quality — harder to rebuild from scratch.
That compounding curation, not the scanner, is the defensible asset.

## Current database state (v1.0, 2026-07-13)

- `src/data/safety/food.json` — 112 food ingredients & additives incl. E-numbers
- `src/data/safety/cosmetics.json` — 118 cosmetic/INCI entries
- `src/data/common-safe.ts` — ~150 benign coverage-only names (zero verdict weight)
- `src/data/product-rules.ts` — product-level: alcohol, energy drinks, unpasteurized
- Known soft spots (flagged during curation, worth a clinician pass): essential-oil
  trimester gradings lean on traditional contraindications more than trial data;
  butylparaben set stricter than its siblings deliberately; lavender t1=caution reflects
  common "no EOs in T1" guidance rather than hard evidence.
