export function evaluateBatchStock(unitsAvailable: number): {
  inStock: boolean;
  lowStockAlert: boolean;
  label: string;
} {
  if (unitsAvailable <= 0) {
    return { inStock: false, lowStockAlert: false, label: 'Batch Exhausted' };
  }
  if (unitsAvailable <= 3) {
    return { inStock: true, lowStockAlert: true, label: `Rare Batch: Only ${unitsAvailable} remaining` };
  }
  return { inStock: true, lowStockAlert: false, label: 'Fresh Batch In Stock' };
}