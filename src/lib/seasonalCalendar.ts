export interface SeasonPeriod {
  bengaliSeason: string;
  activeMonths: string;
  signatureProducts: string[];
}

export const BANGLADESH_SEASONS: SeasonPeriod[] = [
  { bengaliSeason: 'Grisma (Summer)', activeMonths: 'April - June', signatureProducts: ['Wild Honey', 'Mangoes', 'Hand fans'] },
  { bengaliSeason: 'Barsa (Monsoon)', activeMonths: 'June - August', signatureProducts: ['Aush Rice', 'Jute fibers'] },
  { bengaliSeason: 'Sarat (Autumn)', activeMonths: 'August - October', signatureProducts: ['Kash flower crafts', 'Rice flour'] },
  { bengaliSeason: 'Hemanta (Late Autumn)', activeMonths: 'October - December', signatureProducts: ['New Aman Rice', 'Mustard Flowers'] },
  { bengaliSeason: 'Shhit (Winter)', activeMonths: 'December - February', signatureProducts: ['Date Palm Jaggery', 'Pure Mustard Oil', 'Nakshi Kantha'] },
  { bengaliSeason: 'Basanta (Spring)', activeMonths: 'February - April', signatureProducts: ['Fresh Spices', 'Terracotta ornaments'] },
];