import type { AggregationType } from '../types/interfaces';

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
