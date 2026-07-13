import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PLANS, PREMIUM_FEATURES, purchase, restorePurchases } from '../lib/purchases';
import { colors, radius, space, type } from '../lib/theme';

export default function Paywall() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(PLANS.find((p) => p.isDefault)?.id ?? PLANS[0].id);
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    const result = await purchase(selectedId);
    setBusy(false);
    Alert.alert(result.ok ? 'Welcome to Premium' : 'Not available yet', result.message);
  };

  const restore = async () => {
    const result = await restorePurchases();
    Alert.alert('Restore purchases', result.message);
  };

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.close} accessibilityRole="button">
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.kicker}>Mamama Premium</Text>
        <Text style={type.title}>Pick the price that feels right</Text>
        <Text style={styles.sub}>
          Same features at every tier — one year of Premium. Your subscription funds database
          updates and keeps Mamama independent: no ads, no selling data. Ever.
        </Text>

        <View style={styles.features}>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const active = plan.id === selectedId;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedId(plan.id)}
                style={[styles.plan, active && styles.planActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.planLabel, active && { color: colors.brand }]}>{plan.label}</Text>
                <Text style={[styles.planPrice, active && { color: colors.brand }]}>{plan.price}</Text>
                <Text style={styles.planPeriod}>per year</Text>
                {plan.isDefault && (
                  <View style={styles.popularTag}>
                    <Text style={styles.popularTagText}>Most common</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Button label="Continue" onPress={buy} loading={busy} />
        <Button label="Restore purchases" variant="ghost" onPress={restore} />

        <Text style={styles.finePrint}>
          Auto-renewable yearly subscription. Payment is charged to your Apple ID at purchase
          confirmation and renews annually unless cancelled at least 24 hours before the period
          ends. Manage or cancel anytime in App Store settings. Scanning and verdicts stay free —
          Premium is optional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm, paddingBottom: space.xxl },
  close: { alignSelf: 'flex-end', padding: space.xs },
  closeText: { fontSize: 20, color: colors.inkSoft, fontWeight: '600' },
  kicker: { ...type.label, color: colors.accent },
  sub: { ...type.bodySoft },
  features: { gap: space.xs, marginVertical: space.md },
  featureRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  featureCheck: { color: colors.ok, fontWeight: '900', fontSize: 15 },
  featureText: { ...type.body, fontSize: 15, flex: 1 },
  plans: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  plan: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    padding: space.sm,
    alignItems: 'center',
    gap: 2,
  },
  planActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  planLabel: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  planPrice: { fontSize: 20, fontWeight: '800', color: colors.ink },
  planPeriod: { fontSize: 11, color: colors.inkFaint },
  popularTag: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  popularTagText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  finePrint: { ...type.small, fontSize: 11, lineHeight: 16, marginTop: space.sm },
});
