export function generateArtisanSlug(title: string, suffix?: string): string {
  const cleaned = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return suffix ? `${cleaned}-${suffix.slice(-6)}` : cleaned;
}