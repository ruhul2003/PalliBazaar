export function getCraftCareInstructions(category: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes('pottery') || cat.includes('terracotta')) {
    return [
      'Clean gently with soft dry cloth.',
      'Avoid high-pressure water washing.',
      'Keep away from sudden extreme thermal shocks.',
    ];
  }
  if (cat.includes('handloom') || cat.includes('textile') || cat.includes('kantha')) {
    return [
      'Hand wash with mild detergent and cold water.',
      'Dry in shaded outdoor breezes to preserve dye lustre.',
      'Iron inside-out on medium temperature.',
    ];
  }
  return [
    'Store in cool, dry ventilated spaces.',
    'Keep sealed away from direct continuous sunlight.',
  ];
}