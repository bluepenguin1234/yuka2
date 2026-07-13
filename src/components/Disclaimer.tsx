import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function Disclaimer() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Not medical advice</Text>
      <Text style={styles.body}>
        Mamama summarizes published safety guidance to help you ask better questions — it is not a
        substitute for professional medical advice, diagnosis, or treatment. Always talk to your
        doctor, midwife, or pharmacist about products and ingredients, especially before changing
        anything about your diet, skincare, or medications.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.unknownBg,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
});
