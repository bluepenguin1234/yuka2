import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VerdictBadge } from '../../components/VerdictBadge';
import { getHistory, timeAgo } from '../../lib/history';
import { stageLabel } from '../../lib/profile';
import { colors, radius, space, type } from '../../lib/theme';
import type { HistoryItem } from '../../lib/types';

export default function History() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getHistory().then((h) => {
        if (!cancelled) setItems(h);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <View style={styles.header}>
        <Text style={type.title}>Your scans</Text>
        <Text style={styles.headerSub}>
          {items.length === 0
            ? 'Everything you check lives here.'
            : `${items.length} product${items.length === 1 ? '' : 's'} · stored on this device`}
        </Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyBody}>
            Scan a product at the shelf — its verdict will be waiting here next time you wonder about
            the same item.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.barcode + item.scannedAt}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/product/[barcode]', params: { barcode: item.barcode } })
              }
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Text style={styles.thumbEmoji}>🧴</Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.brand ? `${item.brand} · ` : ''}
                  {stageLabel(item.stage)} · {timeAgo(item.scannedAt)}
                </Text>
                <VerdictBadge verdict={item.verdict} size="sm" />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, gap: 4 },
  headerSub: { ...type.small },
  list: { padding: space.lg, paddingTop: space.sm, gap: space.sm },
  row: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.sm,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 26 },
  rowText: { flex: 1, gap: 4, justifyContent: 'center', alignItems: 'flex-start' },
  rowName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  rowMeta: { fontSize: 12, color: colors.inkSoft },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...type.heading },
  emptyBody: { ...type.bodySoft, textAlign: 'center' },
});
