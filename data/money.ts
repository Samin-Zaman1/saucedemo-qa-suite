// Money is compared in whole cents so the tests don't inherit floating-point errors.

/** "$29.99" or "Item total: $29.99" -> 2999 */
export function toCents(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No price in "${text}"`);
  return Math.round(Number(match[1]) * 100);
}

/** 2999 -> "$29.99" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const TAX_RATE = 0.08;
