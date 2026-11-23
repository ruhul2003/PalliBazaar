export interface PackagingOption {
  material: 'NATURAL_JUTE' | 'RECYCLED_PAPER' | 'BANANA_LEAF' | 'STANDARD';
  label: string;
  additionalCost: number;
}

export const ECO_PACKAGING_TIERS: PackagingOption[] = [
  { material: 'NATURAL_JUTE', label: 'Artisanal Jute Tote Bag', additionalCost: 35 },
  { material: 'RECYCLED_PAPER', label: 'Handmade Brown Kraft Box', additionalCost: 15 },
  { material: 'BANANA_LEAF', label: 'Dried Banana Fibre Wrapping', additionalCost: 20 },
  { material: 'STANDARD', label: 'Standard Biodegradable Pack', additionalCost: 0 },
];