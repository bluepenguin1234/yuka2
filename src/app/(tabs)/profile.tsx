import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { clearHistory } from '../../lib/history';
import { BILLING_AVAILABLE } from '../../lib/purchases';
import { currentStage, stageLabel, useProfile } from '../../lib/profile';
import { deleteAccount, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, radius, space, type } from '../../lib/theme';
import type { Stage } from '../../lib/types';

const STAGES: Stage[] = ['t1', 't2', 't3', 'bf'];

export default function Profile() {
  const router = useRouter();
  const { profile, update, reset } = useProfile();
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setSignedInEmail(data.user?.email ?? null));
  }, []);

  const resolvedStage = currentStage(profile);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your account and synced data. Scans stored on this device are cleared too.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            if (result.ok) {
              await clearHistory();
              await reset();
              router.replace('/onboarding/welcome');
            } else {
              Alert.alert('Could not delete account', result.message);
            }
          },
        },
      ]
    );
  };

  const confirmClearHistory = () => {
    Alert.alert('Clear scan history?', 'This removes all scans stored on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearHistory() },
    ]);
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.title}>Profile</Text>

        <Text style={styles.sectionLabel}>Your stage</Text>
        <View style={styles.stageRow}>
          {STAGES.map((s) => {
            const active = profile.stage === s;
            return (
              <Pressable
                key={s}
                onPress={() => update({ stage: s, dueDate: s === 'bf' ? null : profile.dueDate })}
                style={[styles.stageChip, active && styles.stageChipActive]}
              >
                <Text style={[styles.stageChipText, active && styles.stageChipTextActive]}>
                  {stageLabel(s)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {profile.dueDate && profile.stage !== 'bf' && (
          <Text style={styles.stageNote}>
            Due {profile.dueDate} — currently rating for {stageLabel(resolvedStage)} automatically.
          </Text>
        )}

        {/* Premium stays hidden until purchases are wired (RevenueCat, v1.1).
            A visible but non-functional purchase flow is an App Review
            rejection risk (guideline 2.1) — v1.0 ships free-only. */}
        {BILLING_AVAILABLE && (
          <>
            <Text style={styles.sectionLabel}>Premium</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {profile.premium ? 'Mamama Premium — active' : 'Mamama Premium'}
              </Text>
              <Text style={styles.cardBody}>
                AI label reading, safer alternatives, synced history, and new categories as they
                launch.
              </Text>
              <Button label="View plans" variant="secondary" onPress={() => router.push('/paywall')} />
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          {isSupabaseConfigured ? (
            signedInEmail ? (
              <>
                <Text style={styles.cardBody}>Signed in as {signedInEmail}</Text>
                <Button
                  label="Sign out"
                  variant="secondary"
                  onPress={async () => {
                    await supabase?.auth.signOut();
                    setSignedInEmail(null);
                  }}
                />
                <Button label="Delete account & data" variant="danger" onPress={confirmDeleteAccount} />
              </>
            ) : (
              <>
                <Text style={styles.cardBody}>
                  No account — scans stay on this device. Add one to back up your history.
                </Text>
                <Button
                  label="Create account / sign in"
                  variant="secondary"
                  onPress={() => router.push('/onboarding/account')}
                />
              </>
            )
          ) : (
            <Text style={styles.cardBody}>
              Scans and history stay on this device. Account sync arrives in a future update.
            </Text>
          )}
          <Button label="Clear scan history" variant="ghost" onPress={confirmClearHistory} />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <LegalLink label="Medical disclaimer" onPress={() => router.push('/legal/disclaimer')} />
          <LegalLink label="Privacy policy" onPress={() => router.push('/legal/privacy')} />
          <LegalLink label="Terms of use" onPress={() => router.push('/legal/terms')} />
          <Text style={styles.version}>Mamama 1.0.0 · data: Open Food Facts / Open Beauty Facts</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.legalLink}>
      <Text style={styles.legalLinkText}>{label}</Text>
      <Text style={styles.legalLinkChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm, paddingBottom: space.xxl },
  sectionLabel: { ...type.label, marginTop: space.md },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  stageChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  stageChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  stageChipText: { fontSize: 14, fontWeight: '600', color: colors.inkSoft },
  stageChipTextActive: { color: colors.white },
  stageNote: { ...type.small, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: space.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  cardBody: { ...type.bodySoft, fontSize: 14 },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  legalLinkText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  legalLinkChevron: { fontSize: 20, color: colors.inkFaint },
  version: { ...type.small, marginTop: space.xs },
});
