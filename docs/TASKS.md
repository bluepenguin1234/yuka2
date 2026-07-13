# Launch Task Board — fastest path to the App Store

*Two lists, honestly divided. Everything not on your list, I do.*

**Status 2026-07-13 (evening):** GitHub repo live (bluepenguin1234/yuka2) · GitHub Pages
live (privacy URL: https://bluepenguin1234.github.io/yuka2/privacy.html) · EAS project
linked (@suchanekbs/mamama) · icon set + store copy + beta kit done · DB at 308 entries.
**The ONLY remaining blocker for TestFlight is Apple Developer enrollment (#1).**

## ✅ Already done (2026-07-13)

Full app built and typechecked (scanner, verdict engine, ~240-entry cited safety DB,
onboarding, history, profile, paywall UI, legal screens), optional Supabase backend coded
(schema + account-deletion + AI label-reader functions), engine unit tests, EAS config,
this documentation set, git repo initialized.

## 🧑‍💻 Brian must do (nobody else can — ordered; start #1 and #2 today)

| # | Task | Time | Blocks |
|---|---|---|---|
| 1 | **Enroll in Apple Developer Program** ($99/yr). Recommended: as an LLC (see APP_STORE_LAUNCH.md Phase 0 — D-U-N-S takes ~5 days, start now). Individual is faster but weaker for a health app. | 15 min + wait | Everything |
| 2 | **Create free Expo account** at expo.dev, then run `eas login` once | 5 min | Builds |
| 3 | **Test in Expo Go**: `npm install && npx expo start`, scan QR with iPhone, run the flow, scan ~10 real products | 30 min | Confidence |
| 4 | **Decide the name.** "Mamama" is my working name; App Store name ≤30 chars. Check name availability in App Store Connect when creating the app | 10 min | Store listing |
| 5 | **Host privacy policy + terms** (fastest: enable GitHub Pages on the yuka2 repo → I've written the files in legal/) and paste URLs into App Store Connect | 15 min | Submission |
| 6 | **Create the app record** in App Store Connect + privacy nutrition labels (exact answers written in APP_STORE_LAUNCH.md Phase 3) | 30 min | Submission |
| 7 | **Approve screenshots + store copy** (I draft, you approve) | 15 min | Submission |
| 8 | **Run `eas build` / `eas submit`** (I can babysit; the Apple + ASC API-key logins are yours) | 30 min active | TestFlight |
| 9 | **Recruit the 50 early users** from parenting groups → TestFlight external link | ongoing | The data moat |
| 10 | Later, for premium: App Store Connect subscription products + RevenueCat account + **Paid Apps agreement & banking/tax forms** in ASC | 1 hr | Revenue |
| 11 | Optional now: create Supabase project, paste its URL/anon key into `.env`, run `supabase/schema.sql`, deploy the 2 edge functions | 30 min | Accounts/telemetry |

**The critical path is #1.** Apple enrollment approval (1–3 days individual, ~7–10 LLC) is
the only thing between this repo and TestFlight.

## 🤖 Claude can do (ask in any session)

**Before submission**
- Draft all App Store copy: description, subtitle, keywords, promo text, review notes
- Design + generate the app icon and splash (currently Expo defaults — say the word)
- Onboard more safety-DB categories (supplements, teas, medications) with the same
  schema + citation rules
- Add a "Trimester 0 / trying to conceive" stage, or any flow tweak
- Set up GitHub Pages for the legal docs the moment the repo is on GitHub
- Write the TestFlight beta-tester welcome email + feedback form

**EAS-build phase**
- Wire RevenueCat end-to-end (purchases.ts is pre-structured for it) + RevenueCat Paywalls
  remote A/B (pricing models in GROWTH_PLAYBOOK.md)
- Build the v1.1 conversion onboarding (12-screen quiz funnel) + PostHog funnel wiring
- Build the AI label-reader UI on the existing `analyze-label` function
- Add the native review prompt (3rd-scan trigger) + stage-change notifications
- Configure Expo Updates for OTA JS fixes
- Screenshot set with 3D pop-out mockups (first-shot spec in GROWTH_PLAYBOOK.md)

**After launch**
- Weekly coverage_demand review → new DB entries
- App Review rejection responses (same-day turnaround, templates ready)
- v1.1: search-without-scan, alternatives engine, dark mode, localization

## Suggested sequence (fastest humanly possible)

```
Day 0  : #1 Apple enrollment submitted, #2 Expo account, #3 device test
Day 0-2: I draft store copy + icon; you host legal docs (#5)
Day 1-3: Apple approval lands → #6 app record → eas build → eas submit
Day 3-4: TestFlight internal; invite first parents (#9)
Day 4-7: External beta review → 50 early users scanning
Day 7+ : Submit v1.0 (free-only) → App Review ~24-72h → LIVE
Week 2+: Subscriptions (#10) in v1.1 + AI label reader
```
