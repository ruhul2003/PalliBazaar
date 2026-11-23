export interface CartItemProduct {
  id: string;
  price: number;
  quantity: number;
}

export function calculateCartFinancials(items: CartItemProduct[], shippingFee: number = 60) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;
  return { subtotal, shippingFee, total };
}