import { buildIndex, type SafetyIndex } from '../lib/engine';
import type { SafetyEntry } from '../lib/types';
import { COMMON_SAFE } from './common-safe';
import cosmetics from './safety/cosmetics.json';
import food from './safety/food.json';
import supplements from './safety/supplements.json';

/**
 * The proprietary safety database, bundled with the app so verdicts work
 * offline at the shelf. Sources: docs/DATA_SOURCES.md. Entries are curated —
 * every rating cites clinical references (MotherToBaby, LactMed, ACOG, FDA…).
 * Server-side OTA updates land later via the safety_ingredients table
 * (supabase/schema.sql); the bundled copy is always the fallback.
 */

export const SAFETY_ENTRIES: SafetyEntry[] = [
  ...(food as SafetyEntry[]),
  ...(supplements as SafetyEntry[]),
  ...(cosmetics as SafetyEntry[]),
];

export const COMMON_SAFE_SET: Set<string> = new Set(COMMON_SAFE);

const indexCache: Partial<Record<'food' | 'cosmetic', SafetyIndex>> = {};

/**
 * Some ingredient names mean different things by product type — e.g. titanium
 * dioxide is an EFSA-flagged additive in food (E171) but a safe mineral UV
 * filter on skin. Alias ties resolve first-come-first-served in buildIndex,
 * so ordering the matching category first makes the right entry win.
 */
export function getSafetyIndex(prefer: 'food' | 'cosmetic' = 'food'): SafetyIndex {
  const cached = indexCache[prefer];
  if (cached) return cached;
  const preferred = SAFETY_ENTRIES.filter((e) => e.category === prefer);
  const rest = SAFETY_ENTRIES.filter((e) => e.category !== prefer);
  const index = buildIndex([...preferred, ...rest]);
  indexCache[prefer] = index;
  return index;
}

export { productFlags } from './product-rules';
