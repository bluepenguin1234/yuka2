import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEGAL_DOCS } from '../../lib/legal-content';
import { colors, space, type } from '../../lib/theme';

export default function LegalScreen() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = LEGAL_DOCS[doc as keyof typeof LEGAL_DOCS] ?? LEGAL_DOCS.disclaimer;

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.close} accessibilityRole="button">
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={type.title}>{content.title}</Text>
        <Text style={styles.body}>{content.body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  close: { alignSelf: 'flex-end', padding: space.xs },
  closeText: { fontSize: 20, color: colors.inkSoft, fontWeight: '600' },
  body: { ...type.body, fontSize: 15, lineHeight: 24 },
});
