# Windows → App Store Launch Runbook

*Every step from this repo to a live App Store listing, no Mac required. Costs: $99/yr Apple
Developer Program. EAS free tier (15 iOS builds/month) covers the launch. Timeline if
unblocked: ~1–2 weeks, dominated by Apple enrollment + review.*

## Phase 0 — Accounts (start TODAY, these gate everything)

1. **Apple Developer Program** — developer.apple.com/programs → Enroll ($99/yr).
   - ⚠️ Apple guideline 5.1.1(ix): health-info apps "should be submitted by a legal entity."
     Enrolling as an **LLC** is the safer route (needs a D-U-N-S number — free, ~5 biz days;
     total ~7–10 days). Individual enrollment (1–3 days) usually works for informational
     apps but is the #1 thing a reviewer could cite. Decision = speed vs. risk; LLC also
     limits personal liability for a pregnancy-safety product (recommended).
2. **Expo account** — expo.dev, free tier is enough.
3. (Optional now, needed for premium) **RevenueCat** account, free tier.
4. (Optional) **Supabase** project for accounts/telemetry — the app ships fine without it.

## Phase 1 — Verify on device (today, 10 minutes)

```bash
cd yuka2 && npm install && npx expo start
```
Install **Expo Go** on an iPhone, scan the QR, run the full flow, scan real products.

## Phase 2 — First cloud build

```bash
npm i -g eas-cli
eas login
eas init            # links the project (creates the EAS project id)
eas build --platform ios --profile production
```
- EAS builds on Expo's macOS VMs and **auto-creates signing credentials** — say yes to
  letting EAS manage certificates/profiles when prompted (needs the Apple Developer login).
- Bundle ID is already set: `com.mamama.app` (change in `app.json` if you own a domain
  and prefer e.g. `io.mamama.app` — decide BEFORE first build).

## Phase 3 — App Store Connect setup

1. appstoreconnect.apple.com → My Apps → **＋ New App**: iOS, name **Mamama — Pregnancy
   Scanner** (≤30 chars), primary language EN-US, bundle ID from Phase 2, SKU `mamama-001`.
2. Note the **Apple ID number** of the app → paste into `eas.json` → `submit.production.ios.ascAppId`.
3. **App Privacy (nutrition labels)** — declare honestly:
   - Data collected: *Health & Fitness* (pregnancy stage — only if Supabase accounts are on),
     *Contact Info: email* (optional accounts), *Identifiers: none*, *no tracking*, no
     third-party advertising. If shipping WITHOUT Supabase env vars: "Data Not Collected"
     (barcode lookups to Open Food Facts carry no identity).
4. **Privacy policy URL** — host `legal/privacy-policy.md` (fastest: GitHub Pages on the
   yuka2 repo, or mamama.app if you buy the domain). Also required in-app: already in
   Profile → legal.
5. Age rating questionnaire: Medical/Treatment Information = "Infrequent/Mild"; 12+ typical.
6. Category: **Health & Fitness** (primary), Medical (secondary alternative: leave empty —
   Medical invites stricter review).

## Phase 4 — Subscriptions (can follow the free launch — see note)

App Store Connect → Features → In-App Purchases → Subscription group "Mamama Premium" →
three auto-renewable yearly products: `mamama_premium_annual_10` $9.99,
`mamama_premium_annual_15` $14.99, `mamama_premium_annual_20` $19.99. Wire RevenueCat per
BUILD_SPEC §9, rebuild, resubmit.

**Speed play (recommended): submit v1.0 free-only** (paywall hidden until
`BILLING_AVAILABLE`), add subscriptions in v1.1. Removes the riskiest review surface (3.1.2)
from the first submission and ships days sooner.

## Phase 5 — TestFlight

```bash
eas submit --platform ios --latest
```
- Auth from Windows: App Store Connect **API key** (Users & Access → Integrations → App Store
  Connect API → Team Keys → generate; EAS will prompt and store it). 
- Internal testing: you + up to 100 testers, live instantly.
- External testing: the 50 parenting-group early users → needs a one-time beta review
  (<24–48h). Collect coverage gaps + verdict disagreements for two weeks — this data IS the
  product.

## Phase 6 — Submission

Metadata to prepare (I can draft all copy — say the word). Full conversion strategy:
[GROWTH_PLAYBOOK.md](GROWTH_PLAYBOOK.md).
- Title `Mamama: Pregnancy Scanner` · subtitle `Food & cosmetic safety check` (no repeated
  words between them — every word is an ASO keyword).
- Keyword field: `breastfeeding,nursing,ingredients,trimester,barcode,baby,safe,expecting,mom,label`.
- Screenshots: 6.9" (1320×2868) + 6.5" (1284×2778) sets. First screenshot = verdict screen
  with the verdict badge popping out 3D-style + outcome caption (see playbook for the full
  6-shot set). Take on-device from TestFlight; frame in Figma/Canva.
- Description + promo text (outcome-led), support URL (GitHub Pages page is fine).
- **App Review notes (paste-ready template):**
  > Mamama is an informational decision-support tool for expecting and nursing mothers. It
  > is not a medical device and provides no diagnosis or treatment. Verdicts summarize
  > published guidance from MotherToBaby (OTIS), the NIH Drugs and Lactation Database
  > (LactMed), ACOG, FDA, NHS and EFSA; every ingredient rating cites its sources in-app,
  > and a "not medical advice — consult your provider" disclaimer appears on every verdict
  > screen. Product data comes from Open Food Facts/Open Beauty Facts. Uncertain results
  > display as "Limited data" rather than a safety claim. Demo: tap "Type barcode" on the
  > Scan tab and enter 3017620422003. No account is required; accounts are optional and can
  > be deleted in-app (Profile → Delete account).
- Submit → 90% of reviews complete within 24h (first submissions up to ~72h).

## Phase 7 — If rejected (don't panic — respond same-day)

| Citation | Likely complaint | Response |
|---|---|---|
| 1.4.1 | "Medical claims" | Point to disclaimers, sources, "informational" framing; offer to add wording they specify |
| 5.1.1 | Account/data questions | Accounts optional + deletable; demo without account |
| 3.1.2 | Subscription clarity | Ship free-only (Phase 4 note) or screenshot the paywall fine print |
| 2.1 | "Couldn't test" | Reply with the manual-barcode demo steps |

Precedent working in our favor: SafeMom, Little Bean, and Pregnancy Safe all passed review
as informational pregnancy-safety scanners.

## Ongoing

- `eas build` + `eas submit` for each release; `autoIncrement` handles build numbers.
- Expo Updates (OTA) can ship JS-only fixes without review once configured (v1.1).
- Watch coverage_demand weekly → curate top gaps → ship DB updates.
