import Fuse from 'fuse.js';

// Synonym expansion map per PRD spec
const SYNONYM_MAP: Record<string, string[]> = {
  bleeding: ['hemorrhage', 'laceration', 'trauma'],
  cut: ['hemorrhage', 'laceration', 'trauma'],
  gash: ['hemorrhage', 'laceration'],
  blood: ['hemorrhage', 'laceration'],
  snake: ['envenomation', 'anaphylaxis', 'bites'],
  spider: ['envenomation', 'anaphylaxis', 'bites'],
  bee: ['envenomation', 'anaphylaxis', 'bites'],
  sting: ['envenomation', 'anaphylaxis'],
  'broken leg': ['fractures', 'orthopedic', 'trauma'],
  'broken bone': ['fractures', 'orthopedic', 'splinting'],
  fracture: ['fractures', 'orthopedic', 'splinting', 'trauma'],
  'bone out': ['fractures', 'orthopedic', 'trauma'],
  unconscious: ['CPR', 'cardiac arrest', 'triage'],
  'heart attack': ['cardiac', 'CPR', 'chest compressions'],
  choking: ['airway', 'obstruction', 'Heimlich'],
  burn: ['thermal', 'scald', 'chemical'],
  hypothermia: ['cold', 'freezing', 'exposure'],
  seizure: ['epilepsy', 'convulsion', 'neurological'],
  stroke: ['CVA', 'FAST', 'brain attack'],
  asthma: ['bronchospasm', 'wheezing', 'inhaler'],
  drowning: ['submersion', 'water rescue'],
  anaphylaxis: ['allergic reaction', 'epinephrine', 'EpiPen'],
  diabetes: ['hypoglycemia', 'low blood sugar', 'insulin'],
};

export interface SearchableItem {
  id: string;
  title: string;
  category: string;
  synonyms: string[];
  summary?: string;
  type: 'protocol' | 'drug';
  generic_name?: string;
  brand_names?: string[];
}

let fuseInstance: Fuse<SearchableItem> | null = null;
let indexedItems: SearchableItem[] = [];

export function initializeSearchEngine(items: SearchableItem[]) {
  indexedItems = items;
  fuseInstance = new Fuse(items, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'generic_name', weight: 3 },
      { name: 'synonyms', weight: 2 },
      { name: 'brand_names', weight: 2 },
      { name: 'category', weight: 1 },
      { name: 'summary', weight: 1 },
    ],
    threshold: 0.4,          // Levenshtein-like tolerance
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    useExtendedSearch: false,
    ignoreLocation: true,
  });
}

function expandQuery(query: string): string[] {
  const terms = [query];
  const lower = query.toLowerCase();

  for (const [key, expansions] of Object.entries(SYNONYM_MAP)) {
    if (lower.includes(key)) {
      terms.push(...expansions);
    }
  }

  return [...new Set(terms)];
}

export function search(query: string, limit = 20): SearchableItem[] {
  if (!fuseInstance || !query.trim()) return indexedItems.slice(0, limit);

  const expandedTerms = expandQuery(query);
  const allResults = new Map<string, { item: SearchableItem; score: number }>();

  for (const term of expandedTerms) {
    const results = fuseInstance.search(term, { limit });
    for (const result of results) {
      const existing = allResults.get(result.item.id);
      const score = result.score ?? 1;
      if (!existing || score < existing.score) {
        allResults.set(result.item.id, { item: result.item, score });
      }
    }
  }

  return Array.from(allResults.values())
    .sort((a, b) => a.score - b.score)
    .map((r) => r.item)
    .slice(0, limit);
}

export function getAll(): SearchableItem[] {
  return indexedItems;
}
