export interface LegalDoc {
  title: string;
  body: string;
}

export const LEGAL_DOCS: Record<'disclaimer' | 'privacy' | 'terms', LegalDoc> = {
  disclaimer: {
    title: 'Medical disclaimer',
    body: `Expecta is an informational tool, not a medical device and not a source of medical advice.

Verdicts summarize published guidance from sources such as MotherToBaby (OTIS), the NIH Drugs and Lactation Database (LactMed), ACOG, the FDA, the NHS, and EFSA. Evidence in pregnancy and lactation is often limited, and sources sometimes disagree; where they do, Expecta deliberately shows the more cautious rating.

A verdict of "No flags found" means nothing in the product matched a known concern in our database for your stage — it is not a guarantee of safety. A verdict of "Limited data" means we could not verify enough of the ingredient list to say anything confident.

Always consult your doctor, midwife, or pharmacist before making decisions about food, skincare, supplements, or medications during pregnancy or while nursing. Never delay or disregard professional medical advice because of something you read in this app.

If you believe you have been exposed to something harmful, contact your healthcare provider, or in the US call Poison Control at 1-800-222-1222.`,
  },
  privacy: {
    title: 'Privacy policy (summary)',
    body: `The full policy is published at the URL on our App Store page. In short:

• Your scans stay on your device by default. Without an account, we hold no personal data about you.
• Your pregnancy stage and due date are stored locally to compute verdicts. They are never sold and never used for advertising.
• If you create an account, your email, stage, and scan history are stored to sync across devices. You can delete your account and all synced data from Profile → Delete account, and deletion is immediate and permanent.
• Barcodes that we cannot identify are logged anonymously (barcode number and stage only) so we know which product categories to cover next.
• Product data comes from Open Food Facts and Open Beauty Facts; your barcode lookups are sent to their public APIs and are subject to their terms.
• We show no third-party ads and use no third-party marketing SDKs. Health-context data is never shared with data brokers or advertisers.`,
  },
  terms: {
    title: 'Terms of use (summary)',
    body: `By using Expecta you agree to the full terms published at the URL on our App Store page. In short:

• Expecta provides informational content only (see the medical disclaimer). You retain responsibility for decisions about your health and your child's health.
• Premium is an optional auto-renewable yearly subscription handled by Apple. It renews unless cancelled at least 24 hours before the period ends; manage it in your App Store account settings.
• Product information is drawn from public databases and manufacturer labels which may be incomplete or out of date. Formulations change — always check the physical label.
• We may update the safety database, verdict logic, and features over time as evidence and coverage evolve.
• The service is provided "as is" without warranties of any kind to the extent permitted by law.`,
  },
};
