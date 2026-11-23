export type LocalPaymentOption = 'BKASH' | 'NAGAD' | 'ROCKET' | 'COD' | 'CARD';

export interface PaymentOptionMetadata {
  id: LocalPaymentOption;
  name: string;
  feePercentage: number;
  available: boolean;
}

export const LOCAL_PAYMENT_PROVIDERS: PaymentOptionMetadata[] = [
  { id: 'BKASH', name: 'bKash Mobile Banking', feePercentage: 0, available: true },
  { id: 'NAGAD', name: 'Nagad Mobile Banking', feePercentage: 0, available: true },
  { id: 'ROCKET', name: 'Rocket (DBBL)', feePercentage: 0, available: true },
  { id: 'COD', name: 'Cash on Village Delivery', feePercentage: 0, available: true },
  { id: 'CARD', name: 'Debit / Credit Card (Stripe)', feePercentage: 0, available: true },
];