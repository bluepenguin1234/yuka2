# Beta Kit — the 50 early users

*Everything needed to recruit, onboard, and learn from the parenting-group beta.
Their scans are the product: every miss becomes a database entry.*

## Recruiting post (parenting groups / Facebook / Reddit r/BabyBumps etc.)

> **Beta testers wanted: scan any product, get a pregnancy-safety answer in seconds** 🤰
>
> I'm launching Mamama — think "Yuka for pregnancy." Point your camera at any barcode
> (food, skincare, drinks) and it checks the ingredients against clinical sources
> (MotherToBaby, LactMed, ACOG, FDA) and tells you: fine for your trimester, use caution,
> or avoid — with the reasoning and sources, not forum guesses.
>
> Looking for 50 expecting/nursing moms to try it free for two weeks before the App Store
> launch. You need an iPhone; setup takes 2 minutes via TestFlight. Your honest feedback
> (especially products it DOESN'T know yet) directly shapes what gets covered next.
>
> Comment or DM and I'll send the TestFlight link. 💚

*Rules note: many groups ban promo posts — message mods first, or ask members to DM.*

## Welcome email (send with the TestFlight invite)

> Subject: You're in — Mamama beta 🤍
>
> Hi {name},
>
> Thanks for helping test Mamama! Setup (2 min):
> 1. Install **TestFlight** from the App Store.
> 2. Tap your invite link: {TESTFLIGHT_LINK}
> 3. Open Mamama, pick your stage, and scan the first thing within reach.
>
> **What we'd love from you over the next two weeks:**
> - Scan real products while you actually shop — that's the whole point.
> - When a product ISN'T found, that's gold for us: it's logged automatically, but reply
>   with the product name if you remember it.
> - If a verdict ever surprises you or contradicts what your provider said — tell us
>   immediately. That's the most valuable feedback there is.
>
> One important thing: Mamama is an informational tool, not medical advice. Always check
> with your doctor or midwife about anything you're unsure of.
>
> Reply to this email anytime — a human reads every message.
> {YOUR_NAME}

## Feedback form (Google Form / Tally, ~2 min)

1. What stage are you in? (T1 / T2 / T3 / Breastfeeding)
2. How many products did you scan this week? (0 / 1–5 / 6–20 / 20+)
3. How often was the product found? (Almost always / Usually / About half / Rarely)
4. Did any verdict surprise you or disagree with your provider? (free text — the key question)
5. What did you scan that we should cover better? (free text)
6. If Mamama disappeared tomorrow, how disappointed would you be?
   (Very / Somewhat / Not) ← the PMF question
7. Would you pay ~$15/yr after the beta? (Yes / Maybe / No)
8. Anything confusing, broken, or missing? (free text)

## What to measure during the two weeks

| Signal | Where | Decision it drives |
|---|---|---|
| Coverage rate (found vs not-found) | `coverage_demand` view (needs Supabase) or form Q3 | Which category to curate next |
| Category mix of scans | scans table / form Q5 | v1.1 category priority (supplements? teas?) |
| Verdict disagreements | form Q4 / replies | Database corrections — treat as P0 |
| "Very disappointed" % | form Q6 | ≥40% = strong signal to push launch hard |
| Would-pay % | form Q7 | Paywall model confidence |

## Cadence

- Day 0: invite + welcome email
- Day 3: first nudge ("what's the weirdest product it didn't know?")
- Day 7: feedback form round 1
- Day 14: form round 2 + "we're launching — leave an App Store review on day one?" ask
  (day-one reviews disproportionately shape the store page)
