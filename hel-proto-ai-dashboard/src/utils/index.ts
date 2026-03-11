/**
 * Utility functions for the prototype
 */

/**
 * Format date in Finnish locale
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('fi-FI');
}

/**
 * Format currency in Finnish locale (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
