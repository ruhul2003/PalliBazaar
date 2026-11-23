export function formatTaka(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `৳${formatted}`;
}

export function parseTakaInput(input: string): number {
  const sanitized = input.replace(/[৳,\s]/g, '');
  const val = parseFloat(sanitized);
  return isNaN(val) ? 0 : val;
}