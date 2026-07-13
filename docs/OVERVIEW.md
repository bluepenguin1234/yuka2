# Mamama — Comprehensive Overview

*Everything we need moving forward, in one document. Last updated: 2026-07-13.*

## 1. What this is

A mobile app ("Yuka for pregnancies") that scans a product barcode at the shelf and returns a
clear **pregnancy / breastfeeding safety verdict with reasoning**, cross-referencing
ingredients against clinical safety guidance. What-to-Expect forums leave a mother piecing
answers together herself; Mamama gives the verdict at the shelf, from clinical research.

**Working name:** Mamama (inferred from your pitch — trivially changeable in `app.json`,
one find-and-replace before submission if you want something else).

## 2. Product principles

1. **Caution without overclaiming.** Any flagged ingredient dominates the verdict; a clean
   result reads "No flags found," never "Safe"; thin data reads "Limited data." When sources
   disagree, we show the stronger warning.
2. **Stage-aware.** Verdicts shift by trimester and again for nursing. With a due date set,
   the stage advances automatically.
3. **Every rating cites sources.** MotherToBaby, NIH LactMed, ACOG, FDA, NHS, EFSA — tappable
   in every ingredient row.
4. **Coverage grows where demand points.** Every unrecognized barcode is logged (anonymously);
   the most-scanned gaps get curated next. This is the moat: a safety database that deepens
   with each scan and gets harder to rebuild over time.

## 3. Current state (v1.0 — built 2026-07-13)

**Done and working in this repo:**
- Full Expo (React Native + TypeScript) app, Expo SDK 57, runs today in Expo Go on an iPhone
- Yuka-style flow: welcome carousel → stage select (+ optional due date) → account (optional)
  → scanner-first tabs (History · Scan · Profile)
- Barcode scanning (EAN-13/8, UPC-A/E) + manual barcode entry
- Product lookup: Open Food Facts + Open Beauty Facts (millions of products, free APIs)
- Verdict engine with 308-entry curated safety database (food additives, E-numbers,
  cosmetic/INCI ingredients), stage-specific ratings, cited sources
- Product-level rules (alcoholic beverages, energy drinks, unpasteurized products)
- History (on-device), profile/stage management, paywall UI (Yuka-style
  choose-your-price annual), legal screens, medical disclaimers throughout
- Optional Supabase backend (fully coded, switches on via env vars): email accounts,
  scan sync, anonymous coverage-gap telemetry, account deletion (App Store requirement),
  AI label-reader edge function (Claude vision)
- Unit-tested verdict engine; typechecked; App Store-compliant copy and permission strings

**Deliberately deferred to the EAS-build phase (stubs in place):**
- RevenueCat purchases (native module — can't run in Expo Go)
- AI label photo scanning UI (backend function is written)
- OTA safety-database updates (server table + schema ready)

## 4. The flow (mirrors Yuka, adapted for App Store rules)

Research finding: Yuka **forces** name+email+password signup before scanning. Apple guideline
5.1.1 ("let people use the app without a login if it lacks significant account-based
features") makes copying that a top rejection risk for a new app. So Mamama keeps Yuka's
exact flow shape but makes the account step skippable. Same feel, compliant.

Yuka's pricing (researched): **annual-only "choose your price"** — three tiers (~$10/$15/$20),
identical features, framed as supporting independence (no ads, no data sales). Mamama adopts
exactly this: `mamama_premium_annual_10/15/20`.

Free: unlimited scanning + verdicts (trust compounds; a mother who relied on it for one baby
pulls it out again for the next). Premium: AI label reader, alternatives, search-without-scan,
synced unlimited history, early-access categories.

## 5. Business model

- Subscription (above). Database updates and new categories arrive continuously → recurring
  value → recurring price. No ads ever (also a 5.1.3 health-data compliance requirement).
- 50 early users from parenting groups reveal category demand + coverage holes
  (the `coverage_gaps` table + `coverage_demand` view are already built for this).
- Later: healthcare partnerships (OB/midwife practices as distribution), APAC expansion
  (Open Food Facts has international coverage; verdict engine is locale-independent).

## 6. Key documents

| Doc | Purpose |
|---|---|
| [BUILD_SPEC.md](BUILD_SPEC.md) | Full build spec — hand to any engineer/agent to continue |
| [APP_STORE_LAUNCH.md](APP_STORE_LAUNCH.md) | Step-by-step Windows → App Store runbook |
| [TASKS.md](TASKS.md) | Claude-can-do vs Brian-must-do, ordered for fastest launch |
| [ROADMAP.md](ROADMAP.md) | v1.1+ — AI, forums/Instagram trust loop, APAC, healthcare |
| [GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md) | Conversion mechanics: store page, onboarding funnel, paywall, retention |
| [DATA_SOURCES.md](DATA_SOURCES.md) | Where safety evidence comes from, how coverage grows |
| [yuka-appstore-research.md](yuka-appstore-research.md) | Raw research: Yuka flow, review guidelines, EAS |
| [../legal/](../legal/) | Privacy policy, terms, medical disclaimer (need hosting) |

## 7. Critical constraints (do not lose these)

1. **Never use diagnostic/treatment language** anywhere — app, store listing, marketing.
   "Informational decision support." Apple reviews health apps with greater scrutiny (1.4.1).
2. **Health-context data must never touch ads/marketing SDKs** (5.1.3). Current build has
   zero third-party trackers; keep it that way.
3. **Apple prefers health apps from legal entities** (5.1.1(ix)). Enroll the Developer
   account as an LLC if possible.
4. **In-app account deletion must exist if accounts exist** — already built
   (Profile → Delete account → `delete-account` edge function).
5. **Paywall must show price + duration prominently** (3.1.2) — already in the paywall UI.
6. The verdict engine must stay conservative — when in doubt, warn. This is both a safety
   position and the trust moat.
