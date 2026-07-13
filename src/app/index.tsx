import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useProfile } from '../lib/profile';
import { colors } from '../lib/theme';

export default function Index() {
  const { profile, ready } = useProfile();

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return profile.onboarded ? <Redirect href="/(tabs)/scan" /> : <Redirect href="/onboarding/welcome" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
