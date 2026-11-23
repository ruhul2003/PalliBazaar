export function createPalliMetadata(productName: string, district: string, price: number) {
  return {
    title: `${productName} from ${district} | Palli Bazaar`,
    description: `Discover authentic ${productName} crafted by rural artisans in ${district}. Buy fresh & genuine village heritage goods at ৳${price}.`,
  };
}