import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useProfile } from '../../lib/profile';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, radius, space, type } from '../../lib/theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function Account() {
  const router = useRouter();
  const { update } = useProfile();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = async (savedEmail: string | null) => {
    await update({ onboarded: true, email: savedEmail });
    router.replace('/(tabs)/scan');
  };

  const submit = async () => {
    if (!supabase) {
      await finish(null);
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      Alert.alert('Check your email', 'That email address doesn’t look right.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Password too short', `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setBusy(true);
    try {
      const { error } =
        mode === 'signup'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert(mode === 'signup' ? 'Could not create account' : 'Could not sign in', error.message);
        return;
      }
      await finish(email);
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.fill}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Step 2 of 2</Text>
          <Text style={type.title}>
            {isSupabaseConfigured ? 'Save your progress' : 'You’re all set'}
          </Text>
          <Text style={styles.sub}>
            {isSupabaseConfigured
              ? 'An account backs up your scan history and stage across devices. You can also skip and add one later.'
              : 'Scans and history stay on this device. Account sync arrives in a future update.'}
          </Text>

          {isSupabaseConfigured && (
            <View style={styles.form}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password (8+ characters)"
                placeholderTextColor={colors.inkFaint}
                secureTextEntry
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={styles.input}
              />
              <Button
                label={mode === 'signup' ? 'Create account' : 'Sign in'}
                onPress={submit}
                loading={busy}
              />
              <Button
                label={mode === 'signup' ? 'I already have an account' : 'I’m new — create an account'}
                variant="ghost"
                onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              />
            </View>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={isSupabaseConfigured ? 'Skip for now' : 'Start scanning'}
            variant={isSupabaseConfigured ? 'ghost' : 'primary'}
            onPress={() => finish(null)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm },
  kicker: { ...type.label, color: colors.accent },
  sub: { ...type.bodySoft },
  form: { gap: space.sm, marginTop: space.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    minHeight: 52,
    fontSize: 16,
    color: colors.ink,
  },
  footer: { padding: space.lg, paddingTop: space.sm },
});
