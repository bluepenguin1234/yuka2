# Mamama — Full Build Specification (v1.0)

*Standalone spec: an engineer or agent with only this document and the repo can continue the
build. Status markers: ✅ built · 🔧 stubbed (wire in EAS-build phase) · 🔜 next release.*

---

## 1. Product definition

**One-liner:** Scan a product barcode, get a pregnancy/breastfeeding safety verdict with
clinical reasoning, adjusted to the user's exact stage.

**User:** Expecting and nursing mothers deciding at the shelf ("can I eat/use this?").
Secondary: partners doing the shopping, TTC users (treated as trimester 1 — strictest).

**Core loop:** scan → verdict in <3s → read reasoning → trust grows → scan more →
(premium) → tells pregnant friends.

**Anti-goals:** Never diagnose. Never overclaim safety. Never monetize health data with ads.

## 2. Architecture

```
┌─ iPhone (Expo / React Native / TypeScript) ────────────────┐
│ Expo Router screens (src/app)                              │
│ Verdict engine (src/lib/engine.ts)  ← pure, unit-tested    │
│ Bundled safety DB (src/data/safety/*.json) ← works offline │
│ AsyncStorage: profile, history (offline-first)             │
└────────┬──────────────────────────────┬────────────────────┘
         │ barcode lookup               │ optional (env-gated)
         ▼                              ▼
  Open Food Facts /             Supabase (auth, scan sync,
  Open Beauty Facts APIs        coverage_gaps telemetry,
  (public, free)                edge functions: delete-account,
                                analyze-label → Claude API)
```

Decisions and why:
- **Expo + EAS**: only sane Windows→App Store path (cloud macOS builds). Expo Go = instant
  device testing during development.
- **Bundled DB**: verdicts must work in a store aisle with bad reception. OTA updates come
  later via the `safety_ingredients` table (schema exists).
- **Backend optional**: `src/lib/supabase.ts` returns `null` client if env vars absent; every
  backend call is fire-and-forget and never blocks the scan flow.

## 3. Repo map

| Path | Contents |
|---|---|
| `src/app/_layout.tsx` | Root stack + ProfileProvider |
| `src/app/index.tsx` | Redirect: onboarded ? tabs : onboarding |
| `src/app/onboarding/{welcome,stage,account}.tsx` | 3-slide carousel → stage+due date → optional email account |
| `src/app/(tabs)/{history,scan,profile}.tsx` | Main tabs, scanner is home |
| `src/app/product/[barcode].tsx` | Fetch → analyze → verdict screen |
| `src/app/paywall.tsx` | Choose-your-price annual (Yuka model) |
| `src/app/legal/[doc].tsx` | Disclaimer / privacy / terms viewer |
| `src/lib/` | engine, products, profile, history, supabase, purchases, theme, types, legal-content |
| `src/data/` | safety DB JSONs, common-safe whitelist, product-level rules |
| `src/__tests__/engine.test.ts` | Engine + stage-derivation tests |
| `supabase/` | schema.sql + 2 edge functions |
| `docs/`, `legal/` | This spec, runbooks, policies |

## 4. Data model (`src/lib/types.ts`)

```ts
Stage   = 't1' | 't2' | 't3' | 'bf'
Risk    = 'safe' | 'caution' | 'avoid'          // per-ingredient, per-stage
Verdict = 'avoid' | 'caution' | 'ok' | 'unknown' // per-product

SafetyEntry {
  id, name, category: 'food'|'cosmetic',
  aliases: string[],        // lowercase; E-numbers ("e211"), INCI names
  risks: Record<Stage, Risk>,
  summary,                  // ≤60 chars, shown collapsed
  detail,                   // 2–4 sentences, cautious clinical tone
  sources: {name, url}[]    // real orgs only: MotherToBaby, LactMed, ACOG, FDA, NHS, EFSA, EWG
}
```

Profile: `{onboarded, stage, dueDate?, email?, premium}` in AsyncStorage
(`mamama_profile_v1`). History: last 200 scans (`mamama_history_v1`).

## 5. Verdict engine (src/lib/engine.ts) — the heart

Matching pipeline per product:
1. Normalize every ingredient string (lowercase, strip accents via NFD, hyphens→spaces,
   strip punctuation). `"Benzophenone-3"` → `"benzophenone 3"`.
2. **Exact match** against alias map, else **token-boundary phrase match** (padded-includes,
   so `"salicylic acid 2"` hits `"salicylic acid"` but `"sausage"` never hits `"sage"`).
3. E-number pass over Open Food Facts `additives_tags`.
4. Full-ingredients-text sweep for multi-word aliases missed by per-ingredient parsing.
5. Common-safe whitelist (water, flour…, `src/data/common-safe.ts`) counts toward coverage
   but carries **zero verdict weight** — risky things must live in the safety DB, never there.
6. Product-level rules (`src/data/product-rules.ts`): alcohol ≥0.5% ABV or alcohol category
   → avoid (caution when nursing, with timing guidance); energy drinks → avoid;
   unpasteurized/raw-milk tags → avoid (listeria).

Verdict resolution (strict precedence):
```
any avoid → AVOID ("Not recommended")
any caution → CAUTION ("Use caution")
no ingredients listed → UNKNOWN ("Limited data")
coverage = recognized/total ≥ 0.5 → OK ("No flags found")   ← never the word "safe"
else → UNKNOWN
```
Coverage line is always shown: "We recognized 9 of 12 listed ingredients for Trimester 2."

Stage derivation (`src/lib/profile.ts#currentStage`): `bf` sticky; else if dueDate:
weeksPregnant = 40 − weeksUntilDue; <14→t1, <28→t2, else t3. **This is how thresholds shift
automatically as pregnancy progresses.**

## 6. Safety database (src/data/safety/)

230 curated entries (food.json + cosmetics.json), generated with clinical caution rules and
schema-validated. Curation rules (also for all future entries):
- Conservative on conflict — encode the stronger warning.
- Real source URLs only; org topic pages when deep links are uncertain.
- Stage differences encoded where clinically real (retinoids: avoid pregnant / caution
  nursing; sage & peppermint: fine pregnant / caution nursing — milk supply; liquorice:
  worse late pregnancy).
- Include benign entries (folic acid, niacinamide, hyaluronic acid…) so clean products
  produce reassuring, informative screens — not fear.

Growth loop: `coverage_gaps` table logs every unresolved barcode (anonymous: barcode+stage
only). `coverage_demand` view ranks gaps by scan count → that ranking is the curation queue.

## 7. Screens spec (all ✅ built)

1. **Welcome** — 3 slides: verdict-at-the-shelf / stage-aware / careful-by-design. Skippable.
2. **Stage select** — T1/T2/T3/Breastfeeding cards + optional due date (auto-advance).
3. **Account** — email+password via Supabase when configured, prominent "Skip for now"
   (Apple 5.1.1 — do NOT copy Yuka's forced signup). Sign in with Apple 🔜 only if social
   logins are ever added (then it becomes mandatory per 4.8).
4. **Scan (home tab)** — camera permission pre-prompt with plain-language promise ("no photos
   taken or stored") → CameraView with corner-bracket frame, current-stage chip, haptic on
   hit, 2.5s re-scan lock, manual barcode entry modal (also the desktop/testing path).
5. **Product verdict** — product card (image/name/brand/source) → big color verdict badge →
   coverage line → product warnings → per-ingredient rows (tap to expand: detail, stage note,
   tappable sources) → unreviewed-ingredients toggle → disclaimer card. Not-found state logs
   the gap and says coverage grows from exactly these misses.
6. **History** — device-local list, verdict pills, re-tap re-analyzes fresh (stage may have
   advanced!).
7. **Profile** — stage chips, due-date note, premium card, account (sign out / delete
   account), clear history, legal links, data attribution.
8. **Paywall (modal)** — three annual tiers $9.99/$14.99/$19.99, identical features, Yuka's
   "independence" framing, restore purchases, full auto-renewal fine print (3.1.2).

Design system (`src/lib/theme.ts`): warm cream bg `#FBF7F1`, deep green brand `#0E5A4A`,
coral accent `#E8654F`; verdict red/amber/green/gray with soft tinted backgrounds; radius
10/16/24; SF system type ramp. Light-mode only v1 (`userInterfaceStyle: "light"`).

## 8. Backend (supabase/) — optional, fully coded

`schema.sql`: profiles, scans, coverage_gaps (anon-insert, operator-read), safety_ingredients
(public-read, service-role-write), coverage_demand view. RLS on everything.
Edge functions: `delete-account` (5.1.1 compliance), `analyze-label` (🔧 Claude
`claude-sonnet-5` vision → structured JSON verdict; needs `ANTHROPIC_API_KEY` secret).
Client env: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (.env, gitignored).

## 9. Monetization wiring (🔧 EAS-build phase)

1. App Store Connect: create 3 auto-renewable subscriptions in one group ("Mamama Premium"):
   `mamama_premium_annual_10/15/20` @ $9.99/$14.99/$19.99 per year.
2. RevenueCat: free account → attach the 3 products to one "premium" entitlement.
3. `npx expo install react-native-purchases` (requires dev build, not Expo Go).
4. Replace the stub in `src/lib/purchases.ts`: `Purchases.configure({apiKey})`,
   `getOfferings()`, `purchasePackage()`, set `BILLING_AVAILABLE = true`, flip
   `profile.premium` from the entitlement.
5. Free tier keeps unlimited scanning + verdicts (trust-first; Yuka does the same).

## 10. Testing

- ✅ Unit: engine matching, false-positive guard, E-numbers, stage-specific risk, verdict
  precedence, coverage thresholds, due-date trimester derivation (`npm test`).
- Manual device pass (Expo Go): onboarding, permission grant/deny, scan real products
  (food + cosmetic + alcohol), manual entry, not-found, history, stage switch changes verdict.
- 🔜 Maestro or Detox E2E once flows stabilize; snapshot tests for verdict screen states.

## 11. App Store compliance checklist (built into the product)

- [x] Camera permission string explains exactly why (no photos stored)
- [x] Medical disclaimer at onboarding footer*, every verdict screen, Profile, store copy
- [x] No diagnostic/treatment language anywhere
- [x] Optional accounts (5.1.1(v)) + in-app account deletion (5.1.1(x))
- [x] Paywall shows price+duration prominently, restore button, renewal terms (3.1.2)
- [x] No third-party ads/trackers; health context never leaves the device except opt-in
  account sync (5.1.3)
- [ ] Privacy policy + terms hosted at public URLs (Brian — see TASKS.md)
- [ ] App Review notes: cite methodology + data sources (template in APP_STORE_LAUNCH.md)
- [ ] Privacy nutrition labels declared in App Store Connect (guide in APP_STORE_LAUNCH.md)

*welcome slide 3 states the careful-by-design position; the full disclaimer is one tap away
everywhere else.

## 12. v1.1+ (see ROADMAP.md)

AI label reader UI (photo → analyze-label), search-without-scan, safer alternatives,
OTA DB updates, supplements/medications categories, dark mode, localization (APAC),
Sign in with Apple + social, healthcare-partner referral codes.
