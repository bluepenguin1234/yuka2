import { splitIngredientsText } from './engine';
import type { ScannedProduct } from './types';

const REQUEST_TIMEOUT_MS = 10000;

const SOURCES = [
  { base: 'https://world.openfoodfacts.org/api/v2/product/', label: 'Open Food Facts' as const },
  { base: 'https://world.openbeautyfacts.org/api/v2/product/', label: 'Open Beauty Facts' as const },
];

const FIELDS = [
  'code',
  'product_name',
  'brands',
  'image_front_url',
  'image_url',
  'ingredients',
  'ingredients_text',
  'ingredients_text_en',
  'additives_tags',
  'categories_tags',
  'labels_tags',
  'nutriments',
].join(',');

export type ProductLookup =
  | { status: 'found'; product: ScannedProduct }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export async function fetchProduct(barcode: string): Promise<ProductLookup> {
  let sawNetworkError = false;
  for (const source of SOURCES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${source.base}${encodeURIComponent(barcode)}.json?fields=${FIELDS}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Expecta/1.0 (pregnancy-safety scanner; support@expecta.app)' },
      });
      clearTimeout(timer);
      if (res.status === 404) continue;
      if (!res.ok) {
        sawNetworkError = true;
        continue;
      }
      const json = await res.json();
      if (json?.product) {
        return { status: 'found', product: normalizeProduct(barcode, json.product, source.label) };
      }
    } catch {
      sawNetworkError = true;
    }
  }
  if (sawNetworkError) {
    return {
      status: 'error',
      message: 'Could not reach the product database. Check your connection and try again.',
    };
  }
  return { status: 'not_found' };
}

interface RawIngredient {
  id?: string;
  text?: string;
  ingredients?: RawIngredient[];
}

function flattenIngredients(list: RawIngredient[] | undefined, out: string[] = []): string[] {
  if (!Array.isArray(list)) return out;
  for (const item of list) {
    const label = String(item?.text || item?.id || '')
      .replace(/^[a-z]{2}:/, '')
      .replace(/-/g, ' ')
      .trim();
    if (label) out.push(label);
    if (Array.isArray(item?.ingredients)) flattenIngredients(item.ingredients, out);
  }
  return out;
}

function stripLangPrefix(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => String(t).replace(/^[a-z]{2}:/, ''));
}

function normalizeProduct(
  barcode: string,
  p: any,
  source: ScannedProduct['source']
): ScannedProduct {
  const structured = flattenIngredients(p.ingredients);
  const text: string = p.ingredients_text_en || p.ingredients_text || '';
  return {
    barcode,
    name: (p.product_name || '').trim() || 'Unnamed product',
    brand: p.brands ? String(p.brands).split(',')[0].trim() : null,
    imageUrl: p.image_front_url || p.image_url || null,
    source,
    ingredients: structured.length > 0 ? structured : splitIngredientsText(text),
    ingredientsText: text,
    additiveTags: stripLangPrefix(p.additives_tags),
    categoriesTags: stripLangPrefix(p.categories_tags),
    labelsTags: stripLangPrefix(p.labels_tags),
    alcoholPct: typeof p.nutriments?.alcohol === 'number' ? p.nutriments.alcohol : null,
  };
}
