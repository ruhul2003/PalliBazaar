export interface OrderStatusInfo {
  labelEn: string;
  labelBn: string;
  colorClass: string;
}

export const ORDER_STATUS_DETAILS: Record<string, OrderStatusInfo> = {
  PENDING: { labelEn: 'Order Received', labelBn: 'অর্ডার গৃহীত হয়েছে', colorClass: 'text-amber-500' },
  PACKED: { labelEn: 'Artisan Packed', labelBn: 'প্যাকেট প্রস্তুত', colorClass: 'text-blue-500' },
  SHIPPED: { labelEn: 'In Transit', labelBn: 'পরিবহনে রয়েছে', colorClass: 'text-indigo-500' },
  DELIVERED: { labelEn: 'Delivered', labelBn: 'সফলভাবে পৌঁছেছে', colorClass: 'text-emerald-500' },
  CANCELLED: { labelEn: 'Cancelled', labelBn: 'বাতিল হয়েছে', colorClass: 'text-rose-500' },
};