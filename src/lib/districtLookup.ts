export const DISTRICT_SPECIALTIES: Record<string, string> = {
  Tangail: 'Handloom Saree & Chamcham Sweetmeat',
  Rajshahi: 'Pure Silk & Himsagar Mango',
  Jessore: 'Date Palm Jaggery (Patali Gur)',
  Sundarbans: 'Raw Wild Honey (Khalisha Modhu)',
  Bogra: 'Specialty Curd (Doi) & Handmade Potteries',
  Comilla: 'Khadi Fabric & Rosomalai',
  Dinajpur: 'Kataribhog & Chinigura Aromatic Rice',
  Kushtia: 'Handmade Sesame & Sugarcane Gur',
};

export function getDistrictCraft(district: string): string {
  return DISTRICT_SPECIALTIES[district] || 'Authentic Village Craft';
}