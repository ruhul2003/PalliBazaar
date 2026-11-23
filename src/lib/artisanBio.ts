export function formatArtisanProfile(name: string, village: string, craft: string, experienceYears: number): string {
  return `${name} is a renowned ${craft} artisan hailing from the heritage village of ${village}. Practicing the craft for over ${experienceYears} years, every piece embodies generational technique and rural folklore.`;
}