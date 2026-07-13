import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { verdictMeta } from '../lib/theme';
import type { Verdict } from '../lib/types';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'lg';
}

export function VerdictBadge({ verdict, size = 'lg' }: VerdictBadgeProps) {
  const meta = verdictMeta[verdict];
  if (size === 'sm') {
    return (
      <View style={[styles.smallPill, { backgroundColor: meta.bg }]}>
        <Text style={[styles.smallSymbol, { color: meta.color }]}>{meta.symbol}</Text>
        <Text style={[styles.smallLabel, { color: meta.color }]}>{meta.label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: meta.bg, borderColor: meta.color }]}>
        <Text style={[styles.symbol, { color: meta.color }]}>{meta.symbol}</Text>
      </View>
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
      <Text style={styles.sub}>{meta.sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
  },
  label: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    color: '#6E655C',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  smallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  smallSymbol: {
    fontSize: 12,
    fontWeight: '800',
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
