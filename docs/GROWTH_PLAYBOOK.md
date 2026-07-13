# Growth & Conversion Playbook

*The four mechanics that decide whether Expecta makes money, adapted to this product.
v1.0 launches free-only to build trust and scan volume; this playbook drives v1.1+.*

## Mechanic 1 — The App Store page

Order of importance: screenshots → reviews → name/subtitle → icon.

**Screenshots (the conversion lever).**
- First screenshot must communicate the whole app at a glance: a phone frame showing the
  verdict screen with the **verdict badge "popping out" 3D-style** as an oversized chip
  (✕ Not recommended / ✓ No flags found), plus one-line caption: *"Know before it's in your
  cart."*
- Suggested set (6): ① verdict with pop-out badge ② scanner at a shelf ③ stage screen with
  "verdicts change as you progress" callout ④ ingredient breakdown with cited sources
  pop-out ⑤ history ⑥ trust/methodology ("Rated from MotherToBaby, LactMed, ACOG, FDA").
- High contrast, vibrant on the warm-cream brand palette; captions sell the outcome
  (peace of mind at the shelf), not features.

**Reviews.**
- No reviews ≠ bad; only bad reviews are bad. If rating ever sits below ~4★, reset with an
  update.
- Ask at the peak-value moment: after the user's **third successful scan**, and only when
  the verdict just resolved a worry (an "ok" after an "avoid" streak, or first stage
  change). Use the native `SKStoreReviewController` prompt (via `expo-store-review`) —
  never a custom nag.

**Name & subtitle = ASO surface.** No repeated words between title and subtitle; every word
a search keyword.
- Title: `Expecta: Pregnancy Scanner` (30 chars ✓)
- Subtitle: `Food & cosmetic safety check` (28 chars ✓ — no word repeats with title)
- Keyword field: `breastfeeding,nursing,ingredients,trimester,barcode,baby,safe,expecting,mom,label`
  (title/subtitle words are already indexed — don't repeat them here)

**Icon.** Don't over-invest at launch — recognizable shape, brand green, one motif (a scan
frame around a heart/bump). It's a long-term brand asset, not a launch lever.

## Mechanic 2 — Onboarding (v1.1 experiment; v1.0 ships the light 5-screen flow)

The user is tired, it's 2am, any friction and they sleep. Every screen fights for its life.
Sell the outcome (never panic-google in an aisle again), not the product.

Target shape for the conversion build (~12 screens, images > text):
1–2. Problem agitation: "8 sources disagree about one moisturizer" / forum-screenshot
   imagery → "there's a faster answer."
3. Social proof (once we have it: ratings, testimonial cards, scan counter).
4–6. **Frictionless quiz (max 3–4 screens):** stage + due date → what they buy most
   (food / skincare / supplements / teas) → current anxiety level. Every answer visibly
   personalizes the next screen — the quiz IS the demo of stage-awareness.
7. Instant payoff: auto-demo scan of a product from their chosen category, real verdict.
8. Methodology/trust screen (sources, "we never say safe when data is thin").
9. Notification permission w/ reason ("we'll tell you when your trimester changes your
   verdicts").
10. Camera permission pre-prompt.
11. Value recap personalized from quiz answers.
12. Paywall.

Rules: don't copy any competitor 1:1; ~75%+ of installs should reach the paywall; measure
every step with **PostHog** funnels (wire `posthog-react-native` in the EAS build). Study:
PrayerLock, CalAI, Glowly, Hinge (friction done well), Monzo (complex at scale).

## Mechanic 3 — Paywall

Anatomy (top→bottom): social proof → big outcome title ("Nine months of certainty") →
feature-outcomes ("Snap any label → instant answer", not "AI OCR") → pricing → fine print.

Two pricing models to A/B once RevenueCat is live (use **RevenueCat Paywalls** so design,
pricing, and tests update remotely without app review — compliant templates only):
- **A (launch default, already built):** Yuka-style choose-your-price annual
  $9.99/$14.99/$19.99 — differentiated, on-brand with the independence story, low refund
  risk.
- **B (industry default):** $49.99/yr with 7-day free trial + $7.99/wk no-trial anchor.
  Don't push annual above $49.99 (refund pressure; EU 14-day right of withdrawal makes
  refunds near-automatic).

Benchmarks: ≥3% install→paid is the floor, ~5% healthy, 10%+ excellent.

**Exit offer (retention, add in v1.2):** the in-app "Manage subscription" button first shows
a short questionnaire ("Too expensive" / "Didn't use it" / free text), then a retention
offer (~$24.99/yr) — only to users NOT already on an annual plan — then deep-links to App
Store subscription management if declined. Disclose the mechanic plainly in App Review
notes and let Apple decide.

## Mechanic 4 — The app itself

- We sell to core human needs — health + a baby's safety — which means the bar for honesty
  is absolute: deliver the promised value or the trust moat inverts. Never moneymaxx this
  audience.
- iOS-only until traction (already the plan); Android when revenue justifies a week of work.
- **Stage-change notifications** (our unfair re-engagement hook): "You're in Trimester 2
  now — the caution list just changed for you. See what's different." Send activity-based
  re-engagement to engaged users; don't silently milk lapsed weekly subscribers.
- Keep shipping: new categories (supplements, teas) are both product depth AND retention
  events. Log friction points; iterate.

## Bonus — App Review relations

- Include a short screen-recording video with each substantive update submission.
- Be extremely clear about what the app does (review-notes template in
  APP_STORE_LAUNCH.md); never mislead; don't argue with reviewers — comply and resubmit.
- Request expedited review only for genuine emergencies (crash in production, time-critical
  fix).

## Instrumentation checklist (EAS-build phase)

- [ ] PostHog: onboarding funnel, paywall views/converts, scan events (category, verdict,
      coverage), review-prompt triggers
- [ ] RevenueCat Paywalls with remote A/B (model A vs B above)
- [ ] `expo-store-review` prompt after 3rd successful scan
- [ ] Push notifications (expo-notifications): stage-change + database-update announcements
