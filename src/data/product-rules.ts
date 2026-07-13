import type { ProductFlag, ScannedProduct, Stage } from '../lib/types';

const ALCOHOL_FLAG_THRESHOLD_PCT = 0.5;

/**
 * Product-level rules that ingredient matching alone can't catch —
 * e.g. a wine's ingredient list never says "alcohol", but its alcohol-by-volume
 * and category tags do. Conservative by design.
 */
export function productFlags(product: ScannedProduct, stage: Stage): ProductFlag[] {
  const flags: ProductFlag[] = [];
  const categories = product.categoriesTags.join(' ');
  const labels = product.labelsTags.join(' ');

  const isAlcoholic =
    (product.alcoholPct !== null && product.alcoholPct >= ALCOHOL_FLAG_THRESHOLD_PCT) ||
    /alcoholic-beverages|wines|beers|spirits|liqueurs|ciders/.test(categories);
  if (isAlcoholic) {
    flags.push({
      id: 'alcoholic-beverage',
      risk: stage === 'bf' ? 'caution' : 'avoid',
      title: 'Alcoholic beverage',
      detail:
        stage === 'bf'
          ? 'Alcohol passes into breast milk. If you drink, guidance suggests waiting at least 2 hours per standard drink before nursing.'
          : 'No amount of alcohol is known to be safe at any point in pregnancy. ACOG and the CDC advise avoiding it entirely.',
    });
  }

  if (/energy-drinks/.test(categories)) {
    flags.push({
      id: 'energy-drink',
      risk: 'avoid',
      title: 'Energy drink',
      detail:
        'Energy drinks combine high caffeine with stimulants like taurine and guarana whose combined effects in pregnancy and nursing are not well studied. Most obstetric guidance recommends avoiding them.',
    });
  }

  if (/raw-milk|unpasteurised|unpasteurized/.test(categories + ' ' + labels)) {
    flags.push({
      id: 'unpasteurized',
      risk: stage === 'bf' ? 'caution' : 'avoid',
      title: 'Unpasteurized / raw milk product',
      detail:
        'Unpasteurized products can carry Listeria, which is especially dangerous during pregnancy and can harm the baby even when the mother has mild symptoms.',
    });
  }

  return flags;
}
