export function convertKgToMaund(kg: number): number {
  return Math.round((kg / 37.324) * 100) / 100;
}

export function convertKgToSer(kg: number): number {
  return Math.round((kg / 0.933) * 100) / 100;
}

export function formatProduceWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg} kg`;
  }
  return `${grams} gm`;
}