# Research Findings: "Yuka for Pregnancy" Barcode Scanner iOS App

Research date: 2026-07-13. Sources: Yuka help center + yuka.io, Page Flows (Feb 2024 capture), Apple App Store Review Guidelines (current, fetched live July 2026), Apple Developer help/news pages, Expo docs (docs.expo.dev, expo.dev/pricing), RevenueCat rejection guide, third-party reviews.

---

## 1. Yuka's Onboarding Flow, Navigation, and Pricing (2024-2026)

### 1.1 Does Yuka require an account? YES — before scanning

Yuka **requires account registration before you can scan anything**. Confirmed by Yuka's own help center ("Why do I have to register to use Yuka?" — https://help.yuka.io/l/en/article/knm8htuqdh-why-register):

> "Registering is necessary for **securing user contributions**. Yuka is a collaborative application where everyone can contribute... It's therefore important that we have the ability [to] secure these contributions via the creation of an account."

Second stated reason: linking scan history to an account. Registration also lets them block users submitting bad product data and grant privileges to quality contributors.

### 1.2 Step-by-step first-launch flow (Page Flows capture, Feb 2024 + Medium product deep-dive)

1. **Welcome screen** — carrot mascot character, friendly greeting
2. **2-page intro carousel** — value-proposition slides ("scan products, get health scores"), deliberately short
3. **"Get Started" CTA**
4. **Sign in / Create account screen**
5. **Email entry** -> Continue
6. **Account creation** — asks **name + email + password**
7. **Camera permission prompt**
8. **First scan demo** — user is pushed straight into scanning a product
9. **Product detail screen** — score + ingredient breakdown
10. **History/overview** — dashboard of scanned items

### 1.3 Auth method

- **Email + password only** as of the 2024 captures. The Medium product deep-dive explicitly notes "the user is given the only option to sign in using e-mail" and criticizes the absence of Apple/Google/Facebook SSO.
- Older help-center docs reference a legacy **Facebook login** (existing accounts can still log in that way), but it is not the primary flow.
- **No Sign in with Apple.** This is permissible under current guideline 4.8 because 4.8 only triggers when a *third-party/social* login sets up the primary account; apps using exclusively their own account system are exempt.
- Key nuance: Yuka asks only name/email/password — no phone number, no demographic data at signup.

### 1.4 Navigation structure (tab bar)

- **Scan** — center tab, auto-highlighted/camera opens on app launch (scanning is the default state)
- **History** — all previously scanned products with images and scores
- **Recommendations ("Recos")** — healthier alternatives for poorly-scored products
- **Search** — manual product search (Premium-gated)
- **Profile / Overview** — account, diet preferences, premium upsell

### 1.5 Premium pricing — the "choose your price" model

Sources: https://help.yuka.io/l/en/article/hkzw2hkj5w-cost-membership, https://help.yuka.io/l/en/article/b5wkrfepnp-why-are-there-different-tariffs, https://yuka.io/en/premium-member/, https://help.yuka.io/l/en/article/dop80j54bb-paid-version-features

- **Annual-only** subscription, "open pricing & commitment-free."
- **Three price points, identical features at every tier.** Help center: "The features offered are exactly the same for all 3 price points. The idea behind the sliding scale is simply to provide additional financial support to Yuka for those who wish to do so."
- US pricing **starts at $10/year**; the premium page shows **$15/year** as the default/middle option (sliding scale roughly $10 / $15 / $20). Regional starting points: GBP 10 (UK), EUR 10 (EU), CAD 25, AUD 20.
- Positioning: framed as *supporting Yuka's independence* (no ads, no selling data), not as buying features.

**Free tier:** unlimited barcode scanning, full product score + ingredient analysis, recommendations for healthier alternatives.

**Premium tier:**
1. **Search bar** — look up any product's grade without scanning
2. **Offline mode** — scan and get grades with no network
3. **Dietary preference alerts** — vegetarian/vegan, palm-oil-free, gluten-free, lactose-free, pork-free, soy-free, sulfite-free; app flags products that do not fit your diet
4. **Unlimited history** (free-tier history is limited)

**Takeaway for a pregnancy app:** the model maps cleanly — free unlimited scanning + verdicts; premium = search-without-scan, trimester/breastfeeding preference alerts, offline mode, unlimited history. The forced-account pattern, however, is a review risk for a new app (see 2.2) — Yuka justifies it with its collaborative database; a new app without user contributions has a weaker argument.

---

## 2. Apple App Store Review for a Pregnancy-Safety Scanner

All guideline text below fetched verbatim from https://developer.apple.com/app-store/review/guidelines/ (current version, July 2026).

### 2.1 Guideline 1.4.1 — Physical harm / medical apps (BIGGEST RISK)

Verbatim:
> "Medical apps that could provide inaccurate data or information, or that could be used for diagnosing or treating patients may be reviewed with greater scrutiny.
> - Apps must clearly disclose data and methodology to support accuracy claims relating to health measurements, and if the level of accuracy or methodology cannot be validated, we will reject your app...
> - Apps should remind users to check with a doctor in addition to using the app and before making medical decisions. If your medical app has received regulatory clearance, please submit a link to that documentation with your app."

Implications for a pregnancy-safety verdict app:
- A "safe / not safe while pregnant" verdict is a health claim. **Disclose the methodology and data sources** (e.g., FDA guidance, ACOG recommendations, ingredient databases, published literature) inside the app AND in App Review notes.
- **Include a persistent medical disclaimer**: "This app provides general information, not medical advice. Always consult your healthcare provider before making decisions during pregnancy or breastfeeding." Put it in onboarding, on verdict screens, and in the App Store description.
- Avoid diagnostic/treatment language. "General wellness / informational" framing (mirroring FDA's general-wellness category) keeps you out of regulated-medical-device territory. Do not claim to *prevent* harm to the baby.
- Real-world 1.4.1 rejections (Apple dev forums): apps handling medical-device data were rejected until they produced (a) regulatory clearance documentation, (b) peer-reviewed studies demonstrating the app works as described, and (c) storefront restriction to cleared regions. A software-only informational scanner avoids this class of problem *as long as it does not claim measurement/diagnostic capability*.

### 2.2 Guideline 5.1.1 — Data collection, sign-in, account deletion

Key verbatim sub-items:

- **(i) Privacy Policies:** "All apps must include a link to their privacy policy in the App Store Connect metadata field and within the app in an easily accessible manner." It must identify what is collected, all uses, third-party sharing, retention/deletion policy, and how to revoke consent.
- **(v) Account Sign-In:** "If your app doesn't include significant account-based features, let people use it without a login. If your app supports account creation, you must also offer account deletion within the app. Apps may not require users to enter personal information to function, except when directly relevant to the core functionality of the app or required by law."
- **(ix):** "Apps that provide services in highly regulated fields (such as banking and financial services, **healthcare**, gambling...) or that require sensitive user information should be submitted by a **legal entity** that provides the services, and not by an individual developer."
- **(x):** Basic contact info (name/email) may be requested "so long as the request is optional for the user [and] features and services are not conditional on providing the information."

Implications:
- **Do NOT force account creation before scanning.** Scanning a barcode is not a "significant account-based feature." Recommended: scan anonymously by default; offer an optional account for sync/history. (Yuka predates enforcement and has a collaborative-database justification; a new app copying the forced signup risks a 5.1.1(v)/(x) rejection.)
- **Account deletion in-app is mandatory** (enforced since June 30, 2022) if any account creation exists — full deletion of the record and associated data, not deactivation (https://developer.apple.com/support/offering-account-deletion-in-your-app/). Applies equally to Sign in with Apple/Google accounts; SIWA deletion must also revoke tokens via Apple's REST API.
- **5.1.1(ix):** pregnancy/health verdicts + implicitly knowing a user is pregnant = sensitive user info. **Submit from an LLC / legal entity, not an individual Apple Developer account.**
- **Sign in with Apple (guideline 4.8, revised Jan 2024):** required only if you offer a third-party/social login (Google, Facebook, etc.) for the primary account — you must then offer an equivalent privacy-preserving option (SIWA qualifies: name+email only, private email relay, no ad tracking without consent). Exempt if you use *only* your own email/password system. Practical choice: email-only (no SIWA obligation) or Google + Sign in with Apple together.

### 2.3 Guideline 5.1.3 — Health and Health Research

Verbatim highlights:
- **(i)** "Apps may not use or disclose to third parties data gathered in the health, fitness, and medical research context... for advertising, marketing, or other use-based data mining purposes." You must disclose the specific health data collected.
- **(ii)** "Apps must not write false or inaccurate data into HealthKit... and may not store personal health information in iCloud."
- (iii)/(iv) informed consent + IRB approval apply only to human-subject research (not applicable to v1).

Implications: pregnancy status is health data. No third-party ad SDKs monetizing it, no ad-based revenue tied to it (another reason Yuka's premium-only model fits), and do not sync pregnancy status via iCloud as "personal health information."

### 2.4 Guideline 3.1.2 — Subscriptions

- Auto-renewable subscriptions allowed in any category; must last >= 7 days, work on all the user's devices, and "provide ongoing value."
- **3.1.2(c) Subscription Information:** "Before asking a customer to subscribe, you should clearly describe what the user will get for the price."
- Practical rejection pattern (RevenueCat guide): paywalls rejected because **price and subscription length are not prominent/legible enough** — 3.1.2 acts as a catch-all for paywall design. Free-trial terms must be explicit (what is charged, and when).
- A Yuka-style "choose your price" is implemented as 3 separate auto-renewable IAP products at different price points — allowed, since each clearly states its own price/term and features are identical.
- Bait-and-switch/scam paywalls get apps AND developer accounts removed.

### 2.5 Guideline 2.5.14 — Recording user activity

Verbatim: "Apps must request explicit user consent and provide a clear visual and/or audible indication when recording, logging, or otherwise making a record of user activity. This includes any use of the device camera, microphone, screen recordings, or other user inputs."

Implication: barcode scanning is fine — standard camera permission with an accurate NSCameraUsageDescription purpose string ("scan product barcodes"), live viewfinder = the visual indication. Do not silently capture/retain camera frames.

### 2.6 Required metadata

- **Privacy policy URL** in App Store Connect metadata + accessible in-app (5.1.1(i)).
- **Privacy nutrition labels** (App Privacy details) — mandatory since Dec 8, 2020, for every submission: declare all data types collected (Contact Info, **Health & Fitness**, Identifiers, Usage Data, etc.), whether linked to identity, and whether used for tracking (https://developer.apple.com/app-store/app-privacy-details/). Third-party SDK collection must be declared too; you are responsible for accuracy.
- App Review notes: methodology/source documentation for safety verdicts, demo account (if login exists), and pointers to where disclaimers appear.

### 2.7 Rejection landscape / precedent

- Most common rejection overall: **guideline 2.1 App Completeness** (crashes, placeholder content, broken links) — 40%+ of unresolved issues per RevenueCat.
- 1.4.1 rejections documented on Apple dev forums for health apps lacking accuracy/methodology documentation or regulatory paperwork (when measurement/hardware claims were involved).
- Direct competitor precedent that PASSED review (good sign for the category): **SafeMom — Pregnancy Scanner** (App Store id6746147849; AI ingredient verdicts Safe/Caution/Avoid), **Little Bean** (pregnancy-safe beauty checker, toxicologist-curated), **Pregnancy Safe App**. All position as decision-support with "consult your provider" disclaimers. The category is approvable when framed as informational, not diagnostic.

---

## 3. Fastest Path: Windows -> App Store with Expo (2025-2026)

### 3.1 Why it works with no Mac

- **EAS Build** compiles iOS apps on Expo's cloud **macOS VMs** (fresh VM per build, Xcode/Fastlane preinstalled) — your Windows box only runs the CLI (https://docs.expo.dev/build-reference/ios-builds/).
- **EAS Submit** exists specifically so "developers using Windows and Linux [can] upload iOS builds," which is otherwise macOS-only (https://docs.expo.dev/submit/introduction/).
- EAS generates and manages the **distribution certificate + provisioning profile** by logging into your Apple Developer account from the CLI — no Keychain/Xcode needed.
- Dev-loop caveat: **no iOS Simulator on Windows.** Test on a physical iPhone via **Expo Go** (fastest) or a **development build** installed over internal distribution/TestFlight. Barcode scanning (expo-camera) works in Expo Go.

### 3.2 Exact step sequence

1. **Enroll in the Apple Developer Program** — $99 USD/year. Individual approval typically **1-3 days**; can stretch to 1-4 weeks if identity verification (photo ID) is requested. Organizations need a D-U-N-S number (+7-10 days). Enroll first — it gates everything. (https://developer.apple.com/programs/enroll/)
   - Per guideline 5.1.1(ix), prefer enrolling as an **organization/LLC** for a health app.
2. `npx create-expo-app@latest` -> build the app (expo-camera for barcode scanning).
3. `npm install -g eas-cli` -> `eas login` (free Expo account).
4. `eas build:configure` — creates eas.json; set `ios.bundleIdentifier` in app.json.
5. `eas build --platform ios --profile production` — CLI prompts for Apple ID login, auto-creates signing credentials. Build runs in Expo's cloud (~15-30 min).
6. `eas submit --platform ios` — picks the latest build, uploads to App Store Connect, can auto-create the App Store Connect app record. Auth options:
   - **App Store Connect API key** (recommended; `ascApiKeyPath`/`ascApiKeyIssuerId`/`ascApiKeyId`, configure via `eas credentials`), or
   - Apple ID + **app-specific password** via `EXPO_APPLE_APP_SPECIFIC_PASSWORD`.
   - Pin the target app with `submit.production.ios.ascAppId` in eas.json (the "Apple ID" number under App Information in App Store Connect). (https://docs.expo.dev/submit/ios/)
7. **TestFlight** (build appears in the TestFlight tab after processing):
   - Add **test information** (what to test, feedback email).
   - **Internal testers:** up to 100 App Store Connect team members; builds available immediately, no review.
   - **External testers:** up to 10,000 via email invite or **public link**; requires **TestFlight beta review** for the first build of a version (typically < 24-48 h).
   - Builds expire after **90 days**. (https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
8. **Production submission:** complete metadata (screenshots, description, **privacy policy URL**, **privacy nutrition labels**, review notes with methodology + disclaimer locations) -> Submit for Review.
9. Post-launch: ship OTA JS-only updates with **EAS Update** (no re-review needed within Apple's rules).

### 3.3 EAS pricing (expo.dev/pricing, fetched July 2026)

| Plan | Price | Builds | Queue | Notes |
|---|---|---|---|---|
| **Free** | $0 | **15 iOS + 15 Android/month** | Low priority, 1 concurrency, 45-min timeout | EAS Submit included; EAS Update to 1K MAU; 20 GiB storage |
| Starter | $19/mo | $45 build credit (usage-based) | High priority, 2-h timeout, large workers | |
| Production | $199/mo | $225 build credit | High priority, 2 included concurrencies | Update to 50K MAU |
| Enterprise | custom | $1,000+ credit | 5 concurrencies | 1M+ MAU, SLAs |

Free tier is ample for an MVP (15 iOS builds/month). Main free-tier pain: low-priority queue waits at peak times. Extra concurrency: $50/slot on paid plans.

### 3.4 App Review turnaround (2025-2026)

- Apple's official figure: **90% of submissions reviewed within 24 hours** (https://developer.apple.com/distribute/app-review/).
- Practical: 24-48 h for most; **first-time submissions up to ~72 h**; health-category apps can get extra 1.4.1 scrutiny — budget a rejection-fix-resubmit cycle.
- TestFlight beta review: usually < 24 h.
- Tip: submit Mon-Wed US business hours; weekend queues are slower.

### 3.5 Realistic timeline, zero -> TestFlight -> App Store (from Windows)

- Day 0: Apple Developer enrollment ($99) — approval 1-3 days (individual)
- Days 0-N: build app; test via Expo Go on a physical iPhone
- Day N: `eas build` (~15-30 min) -> `eas submit` (~10 min) -> TestFlight internal testing same day
- Day N+1: external TestFlight after beta review (~24 h)
- Launch: App Review ~24-48 h after final submission

Total toolchain cost to first App Store release: **$99 (Apple) + $0 (EAS free tier)**.
