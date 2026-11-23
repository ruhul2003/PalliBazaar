export interface FestivalVoucher {
  code: string;
  discountRate: number;
  maxDeduction: number;
}

const ACTIVE_BAZAAR_VOUCHERS: FestivalVoucher[] = [
  { code: 'BOISHAKHI', discountRate: 0.14, maxDeduction: 300 },
  { code: 'NABANNA', discountRate: 0.10, maxDeduction: 200 },
  { code: 'PALLI100', discountRate: 0.05, maxDeduction: 100 },
];

export function applyFestivalVoucher(code: string, subtotal: number): { valid: boolean; discount: number } {
  const match = ACTIVE_BAZAAR_VOUCHERS.find((v) => v.code === code.trim().toUpperCase());
  if (!match) return { valid: false, discount: 0 };
  let deduction = subtotal * match.discountRate;
  if (deduction > match.maxDeduction) deduction = match.maxDeduction;
  return { valid: true, discount: Math.round(deduction) };
}