/**
 * Subscription layer. In Expo Go this is a stub — RevenueCat's native module
 * (react-native-purchases) only works in a real dev/production build.
 * Wiring steps for the EAS build live in docs/BUILD_SPEC.md §9 and docs/TASKS.md.
 *
 * Pricing follows Yuka's proven model: annual-only "choose your price" —
 * three auto-renewable subscriptions with identical features. Product IDs
 * must match App Store Connect exactly.
 */

export const BILLING_AVAILABLE = false;

export interface Plan {
  id: string;
  label: string;
  price: string;
  period: 'year';
  isDefault?: boolean;
}

export const PLANS: Plan[] = [
  { id: 'mamama_premium_annual_10', label: 'Supporter', price: '$9.99', period: 'year' },
  { id: 'mamama_premium_annual_15', label: 'Believer', price: '$14.99', period: 'year', isDefault: true },
  { id: 'mamama_premium_annual_20', label: 'Champion', price: '$19.99', period: 'year' },
];

export const PREMIUM_FEATURES = [
  'AI label reader — snap a photo when there’s no barcode',
  'Safer alternatives when a product is flagged',
  'Search products without scanning',
  'Unlimited history, synced across devices',
  'Early access to new categories (supplements, medications)',
];

export async function purchase(_planId: string): Promise<{ ok: boolean; message: string }> {
  return {
    ok: false,
    message:
      'Subscriptions activate in the TestFlight / App Store build. This preview build keeps everything free.',
  };
}

export async function restorePurchases(): Promise<{ ok: boolean; message: string }> {
  return { ok: false, message: 'Nothing to restore in the preview build.' };
}
