export interface FreshnessScore {
  grade: 'FRESH_HARVEST' | 'RECENT_BATCH' | 'STANDARD_STOCK';
  daysSinceHarvest: number;
  tag: string;
}

export function evaluateProduceFreshness(harvestDateStr: string | Date): FreshnessScore {
  const harvest = new Date(harvestDateStr);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24)));

  if (diffDays <= 7) {
    return { grade: 'FRESH_HARVEST', daysSinceHarvest: diffDays, tag: 'Freshly Harvested' };
  }
  if (diffDays <= 30) {
    return { grade: 'RECENT_BATCH', daysSinceHarvest: diffDays, tag: 'Current Month Batch' };
  }
  return { grade: 'STANDARD_STOCK', daysSinceHarvest: diffDays, tag: 'Preserved & Packaged' };
}