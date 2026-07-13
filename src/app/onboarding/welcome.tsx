import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, space, type } from '../../lib/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'scan',
    emoji: '🤰',
    title: 'Scan anything.\nKnow instantly.',
    body: 'Point your camera at any barcode and get a clear pregnancy or breastfeeding verdict — from clinical research, not forum threads.',
  },
  {
    key: 'stage',
    emoji: '🌱',
    title: 'Made for\nyour stage',
    body: 'Safety shifts as pregnancy progresses and once nursing begins. Expecta adjusts every verdict to exactly where you are.',
  },
  {
    key: 'trust',
    emoji: '🔬',
    title: 'Careful\nby design',
    body: 'Every rating cites its medical sources — MotherToBaby, LactMed, ACOG, FDA. When the evidence is thin, we say so instead of guessing.',
  },
];

export default function Welcome() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (page < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: page + 1, animated: true });
    } else {
      router.push('/onboarding/stage');
    }
  };

  return (
    <LinearGradient colors={[colors.bg, colors.brandSoft]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>expecta</Text>
        </View>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.footer}>
          <Button label={page === SLIDES.length - 1 ? 'Get started' : 'Continue'} onPress={next} />
          {page < SLIDES.length - 1 && (
            <Button label="Skip" variant="ghost" onPress={() => router.push('/onboarding/stage')} />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  brandRow: {
    alignItems: 'center',
    paddingTop: space.md,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.brand,
  },
  slide: {
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    gap: space.md,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    ...type.hero,
    lineHeight: 40,
  },
  body: {
    ...type.bodySoft,
    fontSize: 17,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: space.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotActive: {
    backgroundColor: colors.brand,
    width: 24,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.xs,
  },
});
