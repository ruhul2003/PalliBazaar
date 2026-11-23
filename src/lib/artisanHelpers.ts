export type ArtisanTier = 'MASTER_CRAFTSMAN' | 'VILLAGE_COOPERATIVE' | 'ORGANIC_PRODUCER' | 'VERIFIED_ARTISAN';

export interface ArtisanBadge {
  label: string;
  badgeStyle: string;
  iconName: string;
}

export function getArtisanBadge(tier: ArtisanTier): ArtisanBadge {
  switch (tier) {
    case 'MASTER_CRAFTSMAN':
      return { label: 'Master Craftsman', badgeStyle: 'bg-amber-500/10 text-amber-600 border-amber-300', iconName: 'Award' };
    case 'VILLAGE_COOPERATIVE':
      return { label: 'Village Co-op', badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-300', iconName: 'Users' };
    case 'ORGANIC_PRODUCER':
      return { label: 'Certified Organic', badgeStyle: 'bg-green-500/10 text-green-600 border-green-300', iconName: 'Leaf' };
    default:
      return { label: 'Verified Artisan', badgeStyle: 'bg-blue-500/10 text-blue-600 border-blue-300', iconName: 'CheckCircle' };
  }
}