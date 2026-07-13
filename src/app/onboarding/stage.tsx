import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useProfile } from '../../lib/profile';
import { colors, radius, space, type } from '../../lib/theme';
import type { Stage } from '../../lib/types';

const OPTIONS: { stage: Stage; title: string; sub: string }[] = [
  { stage: 't1', title: 'Trimester 1', sub: 'Weeks 1–13 · organs are forming, thresholds are strictest' },
  { stage: 't2', title: 'Trimester 2', sub: 'Weeks 14–27' },
  { stage: 't3', title: 'Trimester 3', sub: 'Week 28 to birth' },
  { stage: 'bf', title: 'Breastfeeding', sub: 'Verdicts switch to what passes into milk' },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function StageSelect() {
  const router = useRouter();
  const { update } = useProfile();
  const [selected, setSelected] = useState<Stage | null>(null);
  const [dueDate, setDueDate] = useState('');

  const dueDateValid = dueDate === '' || (DATE_PATTERN.test(dueDate) && !Number.isNaN(new Date(dueDate).getTime()));
  const showDueDate = selected !== null && selected !== 'bf';

  const continueNext = async () => {
    if (!selected) return;
    await update({
      stage: selected,
      dueDate: showDueDate && dueDate && dueDateValid ? dueDate : null,
    });
    router.push('/onboarding/account');
  };

  return (
    <SafeAreaView style={styles.fill}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Step 1 of 2</Text>
          <Text style={type.title}>Where are you in the journey?</Text>
          <Text style={styles.sub}>
            Verdicts adapt to your stage — what’s fine in trimester three may not be in trimester one.
            You can change this anytime.
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((opt) => {
              const active = selected === opt.stage;
              return (
                <Pressable
                  key={opt.stage}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelected(opt.stage)}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, active && { color: colors.brand }]}>{opt.title}</Text>
                    <Text style={styles.optionSub}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]} />
                </Pressable>
              );
            })}
          </View>

          {showDueDate && (
            <View style={styles.dueDateWrap}>
              <Text style={styles.dueDateLabel}>Due date (optional)</Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.inkFaint}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                style={[styles.input, !dueDateValid && styles.inputError]}
              />
              <Text style={styles.dueDateHint}>
                With a due date, Mamama advances your trimester automatically.
              </Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Continue" onPress={continueNext} disabled={!selected || !dueDateValid} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: space.lg,
    gap: space.sm,
  },
  kicker: { ...type.label, color: colors.accent },
  sub: { ...type.bodySoft, marginBottom: space.sm },
  options: { gap: space.sm, marginTop: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: space.md,
    gap: space.sm,
  },
  optionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  optionSub: { fontSize: 13, color: colors.inkSoft },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
  },
  radioActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  dueDateWrap: { marginTop: space.md, gap: 6 },
  dueDateLabel: { ...type.label },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    minHeight: 50,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: { borderColor: colors.avoid },
  dueDateHint: { ...type.small },
  footer: { padding: space.lg, paddingTop: space.sm },
});
