import { describe, expect, test } from '@jest/globals';
import { COMMON_SAFE_SET, SAFETY_ENTRIES, getSafetyIndex } from '../data';
import { analyzeProduct } from '../lib/engine';
import type { ScannedProduct, Stage } from '../lib/types';

const STAGES: Stage[] = ['t1', 't2', 't3', 'bf'];

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

describe('bundled safety database integrity', () => {
  test('has 200+ entries with unique ids', () => {
    expect(SAFETY_ENTRIES.length).toBeGreaterThanOrEqual(200);
    const ids = new Set(SAFETY_ENTRIES.map((e) => e.id));
    expect(ids.size).toBe(SAFETY_ENTRIES.length);
  });

  test('every entry has valid risks, summary, detail, and at least one source', () => {
    for (const entry of SAFETY_ENTRIES) {
      for (const stage of STAGES) {
        expect(['safe', 'caution', 'avoid']).toContain(entry.risks[stage]);
      }
      expect(entry.summary.length).toBeGreaterThan(0);
      expect(entry.detail.length).toBeGreaterThan(0);
      expect(entry.sources.length).toBeGreaterThanOrEqual(1);
      for (const source of entry.sources) {
        expect(source.url).toMatch(/^https?:\/\//);
      }
    }
  });

  test('nothing in the common-safe whitelist collides with a risky database entry', () => {
    const index = getSafetyIndex('food');
    for (const name of COMMON_SAFE_SET) {
      const entry = index.exact.get(name);
      if (entry) {
        // a whitelist name may exist in the DB only if the DB rates it safe everywhere
        for (const stage of STAGES) {
          expect(`${name}:${stage}:${entry.risks[stage]}`).toBe(`${name}:${stage}:safe`);
        }
      }
    }
  });
});

describe('real-database verdicts', () => {
  test('retinoid skincare is avoid during pregnancy', () => {
    const analysis = analyzeProduct({
      product: makeProduct({
        source: 'Open Beauty Facts',
        ingredients: ['aqua', 'glycerin', 'retinyl palmitate', 'phenoxyethanol'],
      }),
      index: getSafetyIndex('cosmetic'),
      stage: 't1',
      commonSafe: COMMON_SAFE_SET,
    });
    expect(analysis.verdict).toBe('avoid');
  });

  test('titanium dioxide is flagged in food but not in cosmetics', () => {
    const foodResult = analyzeProduct({
      product: makeProduct({ ingredients: ['sugar', 'titanium dioxide'] }),
      index: getSafetyIndex('food'),
      stage: 't2',
      commonSafe: COMMON_SAFE_SET,
    });
    expect(foodResult.verdict).toBe('avoid');

    const cosmeticResult = analyzeProduct({
      product: makeProduct({
        source: 'Open Beauty Facts',
        ingredients: ['aqua', 'titanium dioxide', 'glycerin'],
      }),
      index: getSafetyIndex('cosmetic'),
      stage: 't2',
      commonSafe: COMMON_SAFE_SET,
    });
    expect(cosmeticResult.verdict).toBe('ok');
  });

  test('aspartame via E-number tag draws at least caution', () => {
    const analysis = analyzeProduct({
      product: makeProduct({ ingredients: ['carbonated water'], additiveTags: ['e951'] }),
      index: getSafetyIndex('food'),
      stage: 't2',
      commonSafe: COMMON_SAFE_SET,
    });
    expect(['caution', 'avoid']).toContain(analysis.verdict);
  });

  test('a plain pantry product reads ok', () => {
    const analysis = analyzeProduct({
      product: makeProduct({
        ingredients: ['wheat flour', 'water', 'yeast', 'salt', 'olive oil'],
      }),
      index: getSafetyIndex('food'),
      stage: 't3',
      commonSafe: COMMON_SAFE_SET,
    });
    expect(analysis.verdict).toBe('ok');
    expect(analysis.coverage).toBe(1);
  });
});
