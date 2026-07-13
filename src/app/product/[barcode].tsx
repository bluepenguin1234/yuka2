import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Disclaimer } from '../../components/Disclaimer';
import { IngredientRow } from '../../components/IngredientRow';
import { VerdictBadge } from '../../components/VerdictBadge';
import { COMMON_SAFE_SET, getSafetyIndex, productFlags } from '../../data';
import { analyzeProduct } from '../../lib/engine';
import { addToHistory } from '../../lib/history';
import { currentStage, stageLabel, useProfile } from '../../lib/profile';
import { fetchProduct, type ProductLookup } from '../../lib/products';
import { logCoverageGap, logScan } from '../../lib/supabase';
import { colors, radius, riskBg, riskColor, space, type } from '../../lib/theme';
import type { Analysis, ScannedProduct } from '../../lib/types';

type LoadState =
  | { phase: 'loading' }
  | { phase: 'not_found' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; product: ScannedProduct; analysis: Analysis };

export default function ProductScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  const { profile } = useProfile();
  const stage = useMemo(() => currentStage(profile), [profile]);
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [showUnrecognized, setShowUnrecognized] = useState(false);

  useEffect(() => {
    if (!barcode) return;
    let cancelled = false;
    setState({ phase: 'loading' });
    fetchProduct(barcode).then((result: ProductLookup) => {
      if (cancelled) return;
      if (result.status === 'found') {
        const analysis = analyzeProduct({
          product: result.product,
          index: getSafetyIndex(result.product.source === 'Open Beauty Facts' ? 'cosmetic' : 'food'),
          stage,
          commonSafe: COMMON_SAFE_SET,
          flags: productFlags(result.product, stage),
        });
        setState({ phase: 'ready', product: result.product, analysis });
        addToHistory({
          barcode,
          name: result.product.name,
          brand: result.product.brand,
          imageUrl: result.product.imageUrl,
          verdict: analysis.verdict,
          stage,
          scannedAt: new Date().toISOString(),
        });
        logScan({ barcode, productName: result.product.name, verdict: analysis.verdict, stage });
      } else if (result.status === 'not_found') {
        setState({ phase: 'not_found' });
        logCoverageGap(barcode, stage);
      } else {
        setState({ phase: 'error', message: result.message });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [barcode, stage]);

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.stagePill}>
          <Text style={styles.stagePillText}>{stageLabel(stage)}</Text>
        </View>
      </View>

      {state.phase === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Checking ingredients…</Text>
        </View>
      )}

      {state.phase === 'not_found' && (
        <View style={styles.center}>
          <Text style={styles.bigEmoji}>🔍</Text>
          <Text style={type.title}>Not in the database yet</Text>
          <Text style={styles.centerBody}>
            Barcode {barcode} isn’t covered yet. We’ve logged it — coverage grows category by
            category, guided by exactly these misses. Try the label’s ingredient list with your
            provider in the meantime.
          </Text>
          <Button label="Scan another product" onPress={() => router.back()} />
        </View>
      )}

      {state.phase === 'error' && (
        <View style={styles.center}>
          <Text style={styles.bigEmoji}>📡</Text>
          <Text style={type.title}>Connection trouble</Text>
          <Text style={styles.centerBody}>{state.message}</Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      )}

      {state.phase === 'ready' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.productCard}>
            {state.product.imageUrl ? (
              <Image source={{ uri: state.product.imageUrl }} style={styles.productImage} contentFit="contain" />
            ) : (
              <View style={[styles.productImage, styles.imageFallback]}>
                <Text style={styles.bigEmoji}>🧴</Text>
              </View>
            )}
            <View style={styles.productText}>
              <Text style={styles.productName}>{state.product.name}</Text>
              {state.product.brand && <Text style={styles.productBrand}>{state.product.brand}</Text>}
              <Text style={styles.productSource}>via {state.product.source}</Text>
            </View>
          </View>

          <VerdictBadge verdict={state.analysis.verdict} />

          <Text style={styles.coverage}>
            {state.analysis.totalIngredients > 0
              ? `We recognized ${state.analysis.recognizedCount} of ${state.analysis.totalIngredients} listed ingredients for ${stageLabel(stage)}.`
              : 'This product listing has no ingredient data — treat the verdict as unverified.'}
          </Text>

          {state.analysis.flags.length > 0 && (
            <View style={styles.section}>
              <Text style={type.label}>Product warnings</Text>
              {state.analysis.flags.map((flag) => (
                <View key={flag.id} style={[styles.flagCard, { backgroundColor: riskBg(flag.risk) }]}>
                  <Text style={[styles.flagTitle, { color: riskColor(flag.risk) }]}>{flag.title}</Text>
                  <Text style={styles.flagDetail}>{flag.detail}</Text>
                </View>
              ))}
            </View>
          )}

          {state.analysis.matches.length > 0 && (
            <View style={styles.section}>
              <Text style={type.label}>Ingredient breakdown</Text>
              {state.analysis.matches.map((match) => (
                <IngredientRow key={match.entry.id} match={match} stage={stage} />
              ))}
            </View>
          )}

          {state.analysis.unrecognized.length > 0 && (
            <View style={styles.section}>
              <Pressable onPress={() => setShowUnrecognized((v) => !v)}>
                <Text style={styles.unrecognizedToggle}>
                  {showUnrecognized ? 'Hide' : 'Show'} {state.analysis.unrecognized.length} unreviewed
                  ingredient{state.analysis.unrecognized.length === 1 ? '' : 's'}
                </Text>
              </Pressable>
              {showUnrecognized && (
                <Text style={styles.unrecognizedList}>{state.analysis.unrecognized.join(' · ')}</Text>
              )}
            </View>
          )}

          <Disclaimer />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  backButton: { padding: space.xs },
  backText: { fontSize: 17, fontWeight: '700', color: colors.brand },
  stagePill: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  stagePillText: { color: colors.brand, fontWeight: '700', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  centerBody: { ...type.bodySoft, textAlign: 'center' },
  loadingText: { ...type.bodySoft },
  bigEmoji: { fontSize: 48 },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  productCard: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    alignItems: 'center',
  },
  productImage: { width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.bg },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  productText: { flex: 1, gap: 2 },
  productName: { fontSize: 18, fontWeight: '800', color: colors.ink },
  productBrand: { fontSize: 14, color: colors.inkSoft },
  productSource: { fontSize: 11, color: colors.inkFaint },
  coverage: { ...type.small, textAlign: 'center' },
  section: { gap: space.sm },
  flagCard: { borderRadius: radius.md, padding: space.md, gap: 4 },
  flagTitle: { fontSize: 15, fontWeight: '800' },
  flagDetail: { fontSize: 13, lineHeight: 19, color: colors.ink },
  unrecognizedToggle: { fontSize: 14, fontWeight: '700', color: colors.brand },
  unrecognizedList: { ...type.small, lineHeight: 20 },
});
