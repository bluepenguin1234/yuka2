import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { stageLabel } from '../lib/profile';
import { colors, riskColor } from '../lib/theme';
import type { IngredientMatch, Stage } from '../lib/types';

interface IngredientRowProps {
  match: IngredientMatch;
  stage: Stage;
}

const RISK_LABEL: Record<string, string> = {
  avoid: 'Avoid',
  caution: 'Caution',
  safe: 'No concern',
};

export function IngredientRow({ match, stage }: IngredientRowProps) {
  const [expanded, setExpanded] = useState(false);
  const color = riskColor(match.risk);

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={`${match.entry.name}, ${RISK_LABEL[match.risk]}. Tap for details.`}
      style={styles.row}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{match.entry.name}</Text>
          <Text style={styles.summary}>{match.entry.summary}</Text>
        </View>
        <Text style={[styles.riskLabel, { color }]}>{RISK_LABEL[match.risk]}</Text>
      </View>
      {expanded && (
        <View style={styles.detailWrap}>
          <Text style={styles.detail}>{match.entry.detail}</Text>
          <Text style={styles.matchedOn}>
            Rated for {stageLabel(stage)} · matched “{match.matchedOn}”
          </Text>
          {match.entry.sources.map((s) => (
            <Pressable key={s.url} onPress={() => Linking.openURL(s.url).catch(() => {})}>
              <Text style={styles.source}>→ {s.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  summary: {
    fontSize: 13,
    color: colors.inkSoft,
  },
  riskLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailWrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 8,
  },
  detail: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  matchedOn: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  source: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
  },
});
