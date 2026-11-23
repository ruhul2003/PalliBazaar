export interface ReviewAggregation {
  average: number;
  count: number;
  stars: Record<number, number>;
}

export function aggregateArtisanReviews(ratings: number[]): ReviewAggregation {
  if (!ratings.length) {
    return { average: 0, count: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const stars: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const r of ratings) {
    const clamped = Math.max(1, Math.min(5, Math.round(r)));
    stars[clamped] = (stars[clamped] || 0) + 1;
    total += r;
  }
  const average = Math.round((total / ratings.length) * 10) / 10;
  return { average, count: ratings.length, stars };
}