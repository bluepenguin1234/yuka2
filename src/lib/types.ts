export type Stage = 't1' | 't2' | 't3' | 'bf';
export type Risk = 'safe' | 'caution' | 'avoid';
export type Verdict = 'avoid' | 'caution' | 'ok' | 'unknown';

export interface SafetySource {
  name: string;
  url: string;
}

export interface SafetyEntry {
  id: string;
  name: string;
  category: 'food' | 'cosmetic';
  aliases: string[];
  risks: Record<Stage, Risk>;
  summary: string;
  detail: string;
  sources: SafetySource[];
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  source: 'Open Food Facts' | 'Open Beauty Facts';
  ingredients: string[];
  ingredientsText: string;
  additiveTags: string[];
  categoriesTags: string[];
  labelsTags: string[];
  alcoholPct: number | null;
}

export interface IngredientMatch {
  entry: SafetyEntry;
  matchedOn: string;
  risk: Risk;
}

export interface ProductFlag {
  id: string;
  risk: Risk;
  title: string;
  detail: string;
}

export interface Analysis {
  verdict: Verdict;
  stage: Stage;
  matches: IngredientMatch[];
  flags: ProductFlag[];
  totalIngredients: number;
  recognizedCount: number;
  coverage: number;
  unrecognized: string[];
}

export interface HistoryItem {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  verdict: Verdict;
  stage: Stage;
  scannedAt: string;
}

export interface Profile {
  onboarded: boolean;
  stage: Stage;
  dueDate: string | null;
  email: string | null;
  premium: boolean;
}
