export interface ShippingRateResult {
  charge: number;
  isFree: boolean;
  estimatedDays: string;
}

export function calculateRegionalShipping(division: string, orderTotal: number): ShippingRateResult {
  const freeThreshold = 1500;
  if (orderTotal >= freeThreshold) {
    return { charge: 0, isFree: true, estimatedDays: '2-4 business days' };
  }
  const isDhaka = division.trim().toLowerCase() === 'dhaka';
  return {
    charge: isDhaka ? 60 : 120,
    isFree: false,
    estimatedDays: isDhaka ? '1-2 business days' : '3-5 business days',
  };
}