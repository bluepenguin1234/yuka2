import type {
  Analysis,
  IngredientMatch,
  ProductFlag,
  Risk,
  SafetyEntry,
  ScannedProduct,
  Stage,
  Verdict,
} from './types';

/**
 * Verdict engine. Deliberately conservative:
 * - any "avoid" ingredient or product flag → verdict "avoid"
 * - any "caution" → verdict "caution"
 * - a clean result only reads "ok" when we recognized at least half the
 *   ingredient list; otherwise "unknown" (limited data), so the app never
 *   overclaims safety on products it can't actually verify.
 */

const CONFIDENT_COVERAGE = 0.5;
const MIN_PARTIAL_ALIAS_LENGTH = 4;

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIngredientsText(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/[()[\]{}]/g, ',')
    .split(/[,;•·|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface SafetyIndex {
  exact: Map<string, SafetyEntry>;
  partial: { alias: string; entry: SafetyEntry }[];
}

export function buildIndex(entries: SafetyEntry[]): SafetyIndex {
  const exact = new Map<string, SafetyEntry>();
  const partial: { alias: string; entry: SafetyEntry }[] = [];
  for (const entry of entries) {
    for (const raw of [entry.name, ...entry.aliases]) {
      const alias = normalizeText(raw);
      if (!alias) continue;
      if (!exact.has(alias)) exact.set(alias, entry);
      if (alias.length >= MIN_PARTIAL_ALIAS_LENGTH) partial.push({ alias, entry });
    }
  }
  // longest alias first so the most specific phrase wins a partial match
  partial.sort((a, b) => b.alias.length - a.alias.length);
  return { exact, partial };
}

/** Token-boundary containment: "salicylic acid 2" matches "salicylic acid",
 *  but "sausage" never matches "sage". */
function containsPhrase(haystackNormalized: string, phrase: string): boolean {
  return ` ${haystackNormalized} `.includes(` ${phrase} `);
}

function lookup(normalized: string, index: SafetyIndex): { entry: SafetyEntry; matchedOn: string } | null {
  const direct = index.exact.get(normalized);
  if (direct) return { entry: direct, matchedOn: normalized };
  for (const { alias, entry } of index.partial) {
    if (containsPhrase(normalized, alias)) return { entry, matchedOn: alias };
  }
  return null;
}

function isCommonSafe(normalized: string, commonSafe: Set<string>): boolean {
  if (commonSafe.has(normalized)) return true;
  if (normalized.endsWith('s') && commonSafe.has(normalized.slice(0, -1))) return true;
  return false;
}

const RISK_RANK: Record<Risk, number> = { avoid: 3, caution: 2, safe: 1 };

function addMatch(
  matches: Map<string, IngredientMatch>,
  entry: SafetyEntry,
  matchedOn: string,
  stage: Stage
): void {
  if (matches.has(entry.id)) return;
  matches.set(entry.id, { entry, matchedOn, risk: entry.risks[stage] });
}

export function analyzeProduct(opts: {
  product: ScannedProduct;
  index: SafetyIndex;
  stage: Stage;
  commonSafe: Set<string>;
  flags?: ProductFlag[];
}): Analysis {
  const { product, index, stage, commonSafe } = opts;
  const flags = opts.flags ?? [];

  const rawIngredients =
    product.ingredients.length > 0 ? product.ingredients : splitIngredientsText(product.ingredientsText);

  const matchesById = new Map<string, IngredientMatch>();
  const unrecognized: string[] = [];
  let recognizedCount = 0;
  let totalIngredients = 0;

  for (const raw of rawIngredients) {
    const normalized = normalizeText(raw);
    if (!normalized) continue;
    totalIngredients++;
    const hit = lookup(normalized, index);
    if (hit) {
      recognizedCount++;
      addMatch(matchesById, hit.entry, raw.trim(), stage);
    } else if (isCommonSafe(normalized, commonSafe)) {
      recognizedCount++;
    } else {
      unrecognized.push(raw.trim());
    }
  }

  // E-number additive tags from the product database (e.g. "e211")
  for (const tag of product.additiveTags) {
    const entry = index.exact.get(normalizeText(tag));
    if (entry) addMatch(matchesById, entry, tag.toUpperCase(), stage);
  }

  // Full-text sweep for multi-word aliases the per-ingredient pass missed
  const fullText = normalizeText(product.ingredientsText);
  if (fullText) {
    for (const { alias, entry } of index.partial) {
      if (alias.includes(' ') && !matchesById.has(entry.id) && containsPhrase(fullText, alias)) {
        addMatch(matchesById, entry, alias, stage);
      }
    }
  }

  const coverage = totalIngredients === 0 ? 0 : recognizedCount / totalIngredients;
  const matches = [...matchesById.values()].sort((a, b) => RISK_RANK[b.risk] - RISK_RANK[a.risk]);

  const allRisks: Risk[] = [...matches.map((m) => m.risk), ...flags.map((f) => f.risk)];
  let verdict: Verdict;
  if (allRisks.includes('avoid')) verdict = 'avoid';
  else if (allRisks.includes('caution')) verdict = 'caution';
  else if (totalIngredients === 0) verdict = 'unknown';
  else if (coverage >= CONFIDENT_COVERAGE) verdict = 'ok';
  else verdict = 'unknown';

  return {
    verdict,
    stage,
    matches,
    flags,
    totalIngredients,
    recognizedCount,
    coverage,
    unrecognized,
  };
}
