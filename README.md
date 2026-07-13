# Mamama — Pregnancy Safety Scanner

**Yuka for pregnancies.** Scan any product barcode and get a clear pregnancy or breastfeeding
safety verdict — from clinical research, not forum threads. Verdicts adapt as pregnancy
progresses and once nursing begins.

> ⚕️ Mamama is informational decision support, not medical advice. See
> [legal/medical-disclaimer.md](legal/medical-disclaimer.md).

## What's in this repo

| Path | What it is |
|---|---|
| `src/app/` | All screens (Expo Router): onboarding, scanner, verdict, history, profile, paywall, legal |
| `src/lib/engine.ts` | The verdict engine — conservative ingredient matching + stage-aware ratings |
| `src/data/safety/` | The proprietary safety database (food + cosmetics, 308 curated entries with clinical sources) |
| `src/lib/products.ts` | Barcode → product lookup (Open Food Facts + Open Beauty Facts) |
| `supabase/` | Optional backend: schema, account deletion, AI label reader (Claude) |
| `docs/` | Build spec, App Store launch runbook, task lists, roadmap, data-source strategy |
| `legal/` | Privacy policy, terms, medical disclaimer (host these before submission) |

## Run it (fastest path — no Mac needed)

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on an iPhone. The full flow works in Expo Go:
onboarding → camera scanning → verdicts → history. (Subscriptions are stubbed until the
EAS build — see `docs/TASKS.md`.)

Try barcode `3017620422003` (Nutella) via "Type barcode" if you have nothing to scan.

## Test & typecheck

```bash
npm test          # verdict-engine unit tests
npm run typecheck
```

## Ship it

The complete Windows → App Store runbook is in
[docs/APP_STORE_LAUNCH.md](docs/APP_STORE_LAUNCH.md). The short version:

```bash
npm i -g eas-cli
eas login
eas build --platform ios          # cloud macOS build, no Mac required
eas submit --platform ios         # → TestFlight → App Review
```

## Where to start reading

1. [docs/OVERVIEW.md](docs/OVERVIEW.md) — everything, in one place
2. [docs/BUILD_SPEC.md](docs/BUILD_SPEC.md) — the full product + technical spec
3. [docs/TASKS.md](docs/TASKS.md) — who does what to reach the App Store fastest
