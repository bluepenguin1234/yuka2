import type { Risk, Verdict } from './types';

export const colors = {
  bg: '#FBF7F1',
  surface: '#FFFFFF',
  ink: '#231F1B',
  inkSoft: '#6E655C',
  inkFaint: '#9A9188',
  line: '#EBE3D8',
  brand: '#0E5A4A',
  brandDeep: '#0A4237',
  brandSoft: '#E2EFEA',
  accent: '#E8654F',
  accentSoft: '#FCEBE7',
  avoid: '#C24132',
  avoidBg: '#FBEAE7',
  caution: '#B47712',
  cautionBg: '#FAF0DC',
  ok: '#2E8B5F',
  okBg: '#E5F3EB',
  unknown: '#7D746A',
  unknownBg: '#F0EBE3',
  white: '#FFFFFF',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const type = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8, color: colors.ink },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4, color: colors.ink },
  heading: { fontSize: 18, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.ink, lineHeight: 23 },
  bodySoft: { fontSize: 15, fontWeight: '400' as const, color: colors.inkSoft, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, color: colors.inkSoft, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.inkSoft, letterSpacing: 0.4, textTransform: 'uppercase' as const },
};

export function riskColor(risk: Risk): string {
  if (risk === 'avoid') return colors.avoid;
  if (risk === 'caution') return colors.caution;
  return colors.ok;
}

export function riskBg(risk: Risk): string {
  if (risk === 'avoid') return colors.avoidBg;
  if (risk === 'caution') return colors.cautionBg;
  return colors.okBg;
}

export const verdictMeta: Record<Verdict, { label: string; sub: string; color: string; bg: string; symbol: string }> = {
  avoid: {
    label: 'Not recommended',
    sub: 'Contains at least one ingredient guidance says to avoid at your stage',
    color: colors.avoid,
    bg: colors.avoidBg,
    symbol: '✕',
  },
  caution: {
    label: 'Use caution',
    sub: 'Contains ingredients worth limiting or discussing with your provider',
    color: colors.caution,
    bg: colors.cautionBg,
    symbol: '!',
  },
  ok: {
    label: 'No flags found',
    sub: 'Nothing in this product matched a known concern for your stage',
    color: colors.ok,
    bg: colors.okBg,
    symbol: '✓',
  },
  unknown: {
    label: 'Limited data',
    sub: 'We could not verify enough of this product’s ingredients yet',
    color: colors.unknown,
    bg: colors.unknownBg,
    symbol: '?',
  },
};
