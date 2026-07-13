import { describe, expect, test } from '@jest/globals';
import { analyzeProduct, buildIndex, normalizeText, splitIngredientsText } from '../lib/engine';
import { currentStage } from '../lib/profile';
import type { Profile, SafetyEntry, ScannedProduct } from '../lib/types';

const entries: SafetyEntry[] = [
  {
    id: 'retinol',
    name: 'Retinol',
    category: 'cosmetic',
    aliases: ['retinyl palmitate', 'retinaldehyde', 'vitamin a'],
    risks: { t1: 'avoid', t2: 'avoid', t3: 'avoid', bf: 'caution' },
    summary: 'Linked to birth defects at high doses',
    detail: 'Test detail.',
    sources: [{ name: 'MotherToBaby', url: 'https://mothertobaby.org/fact-sheets/' }],
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    category: 'food',
    aliases: ['coffee extract', 'guarana'],
    risks: { t1: 'caution', t2: 'caution', t3: 'caution', bf: 'caution' },
    summary: 'Limit to 200mg per day',
    detail: 'Test detail.',
    sources: [{ name: 'ACOG', url: 'https://www.acog.org' }],
  },
  {
    id: 'sodium-benzoate',
    name: 'Sodium benzoate',
    category: 'food',
    aliases: ['e211'],
    risks: { t1: 'safe', t2: 'safe', t3: 'safe', bf: 'safe' },
    summary: 'Generally recognized as safe',
    detail: 'Test detail.',
    sources: [{ name: 'FDA', url: 'https://www.fda.gov' }],
  },
];

const index = buildIndex(entries);
const commonSafe = new Set(['water', 'sugar', 'salt', 'glycerin']);

function makeProduct(overrides: Partial<ScannedProduct>): ScannedProduct {
  return {
    barcode: '123',
    name: 'Test',
    brand: null,
    imageUrl: null,
    source: 'Open Food Facts',
    ingredients: [],
    ingredientsText: '',
    additiveTags: [],
    categoriesTags: [],
    labelsTags: [],
    alcoholPct: null,
    ...overrides,
  };
}

describe('normalizeText', () => {
  test('lowercases, strips accents and punctuation', () => {
    expect(normalizeText('Crème BRÛLÉE (10%)')).toBe('creme brulee 10');
  });

  test('treats hyphens as spaces so INCI names match', () => {
    expect(normalizeText('Benzophenone-3')).toBe('benzophenone 3');
  });
});

describe('splitIngredientsText', () => {
  test('splits on commas and unwraps parentheses', () => {
    expect(splitIngredientsText('water, fragrance (limonene), salt')).toEqual([
      'water',
      'fragrance',
      'limonene',
      'salt',
    ]);
  });
});

describe('analyzeProduct matching', () => {
  test('matches a risky ingredient through an alias inside a longer phrase', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['Aqua', 'RETINYL PALMITATE 0.5%'] }),
      index,
      stage: 't1',
      commonSafe,
    });
    expect(analysis.matches.map((m) => m.entry.id)).toContain('retinol');
    expect(analysis.verdict).toBe('avoid');
  });

  test('does not false-positive on token substrings (sage vs sausage)', () => {
    const sage: SafetyEntry = {
      ...entries[1],
      id: 'sage',
      name: 'Sage',
      aliases: ['sage extract'],
      risks: { t1: 'caution', t2: 'caution', t3: 'caution', bf: 'avoid' },
    };
    const localIndex = buildIndex([sage]);
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['pork sausage', 'water'] }),
      index: localIndex,
      stage: 'bf',
      commonSafe,
    });
    expect(analysis.matches).toHaveLength(0);
  });

  test('matches E-number additive tags', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['water', 'sugar'], additiveTags: ['e211'] }),
      index,
      stage: 't2',
      commonSafe,
    });
    expect(analysis.matches.map((m) => m.entry.id)).toContain('sodium-benzoate');
  });

  test('uses stage-specific risk (retinol: avoid pregnant, caution nursing)', () => {
    const product = makeProduct({ ingredients: ['retinol'] });
    expect(analyzeProduct({ product, index, stage: 't3', commonSafe }).verdict).toBe('avoid');
    expect(analyzeProduct({ product, index, stage: 'bf', commonSafe }).verdict).toBe('caution');
  });
});

describe('verdict caution-first logic', () => {
  test('avoid outranks caution', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['retinol', 'coffee extract'] }),
      index,
      stage: 't1',
      commonSafe,
    });
    expect(analysis.verdict).toBe('avoid');
  });

  test('clean product with high coverage reads ok', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['water', 'sugar', 'salt'] }),
      index,
      stage: 't2',
      commonSafe,
    });
    expect(analysis.verdict).toBe('ok');
    expect(analysis.coverage).toBe(1);
  });

  test('clean product with mostly unknown ingredients reads unknown, never ok', () => {
    const analysis = analyzeProduct({
      product: makeProduct({
        ingredients: ['water', 'xylotriol', 'phantasmine', 'obscurium extract'],
      }),
      index,
      stage: 't2',
      commonSafe,
    });
    expect(analysis.verdict).toBe('unknown');
  });

  test('product flags force the verdict even with clean ingredients', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['water'] }),
      index,
      stage: 't1',
      commonSafe,
      flags: [{ id: 'alcoholic-beverage', risk: 'avoid', title: 'Alcohol', detail: 'x' }],
    });
    expect(analysis.verdict).toBe('avoid');
  });

  test('empty ingredient list is unknown', () => {
    const analysis = analyzeProduct({ product: makeProduct({}), index, stage: 't2', commonSafe });
    expect(analysis.verdict).toBe('unknown');
    expect(analysis.totalIngredients).toBe(0);
  });
});

describe('currentStage', () => {
  const base: Profile = { onboarded: true, stage: 't1', dueDate: null, email: null, premium: false };
  const now = new Date('2026-07-13T12:00:00Z');

  test('breastfeeding always wins', () => {
    expect(currentStage({ ...base, stage: 'bf', dueDate: '2026-12-01' }, now)).toBe('bf');
  });

  test('derives trimester from due date and advances over time', () => {
    // due in ~30 weeks → about 10 weeks pregnant → t1
    expect(currentStage({ ...base, dueDate: '2027-02-08' }, now)).toBe('t1');
    // due in ~18 weeks → about 22 weeks pregnant → t2
    expect(currentStage({ ...base, dueDate: '2026-11-16' }, now)).toBe('t2');
    // due in 4 weeks → 36 weeks pregnant → t3
    expect(currentStage({ ...base, dueDate: '2026-08-10' }, now)).toBe('t3');
  });

  test('falls back to the manual stage without a due date', () => {
    expect(currentStage({ ...base, stage: 't3' }, now)).toBe('t3');
  });
});
