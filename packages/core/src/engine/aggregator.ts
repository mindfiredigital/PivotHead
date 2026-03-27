import type { AggregationType } from '../types/interfaces';

/**
 * Calculates an aggregate value for a specific field across a collection of items.
 *
 * @param items - Array of data records to aggregate.
 * @param field - The key of the field to aggregate on each record.
 * @param type - The aggregation operation to apply: `'sum'`, `'avg'`, `'min'`, `'max'`, or `'count'`.
 * @returns The computed aggregate as a number, or `0` if the array is empty or the type is unrecognised.
 *
 * @example
 * const total = calculateAggregates(rows, 'sales', 'sum');
 * const average = calculateAggregates(rows, 'profit', 'avg');
 */
export function calculateAggregates<T>(
  items: T[],
  field: keyof T,
  type: AggregationType
): number {
  if (!items || items.length === 0) return 0;

  const values = items.map(item => Number(item[field]) || 0);

  switch (type) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    default:
      return 0;
  }
}
