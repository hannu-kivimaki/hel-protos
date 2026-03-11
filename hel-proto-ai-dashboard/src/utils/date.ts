/**
 * Returns a human-readable relative time string in Finnish.
 * e.g. "2 päivää sitten", "3 kuukautta sitten", "2 vuotta sitten"
 */
export function relativeTime(isoDate: string): string {
  const now = new Date('2026-03-09');
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Tänään';
  if (diffDays === 1) return 'Eilen';
  if (diffDays < 7) return `${diffDays} päivää sitten`;
  if (diffDays < 14) return 'Viikko sitten';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} viikkoa sitten`;
  if (diffDays < 60) return 'Kuukausi sitten';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} kuukautta sitten`;
  if (diffDays < 730) return 'Vuosi sitten';
  return `${Math.floor(diffDays / 365)} vuotta sitten`;
}

/**
 * Returns true if the content should be flagged as needing an update.
 * Threshold: not modified in over 12 months.
 */
export function isOldContent(isoDate: string): boolean {
  const now = new Date('2026-03-09');
  const then = new Date(isoDate);
  const diffDays = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays > 365;
}

/**
 * Format ISO date as Finnish short date: pp.kk.vvvv
 */
export function formatFinnishDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}
