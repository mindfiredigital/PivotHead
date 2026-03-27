import type {
  SortConfig,
  GroupConfig,
  Group,
  DataRecord,
} from '../types/interfaces';

/**
 * Sorts an array of data records according to one or more sort descriptors.
 *
 * Records are compared using each {@link SortConfig} in order; the next config is
 * only consulted when the current one considers two records equal (stable
 * multi-column sort). Dimension fields are compared lexicographically; measure
 * fields are compared numerically via {@link calculateMeasureValue}.
 *
 * @param data - The array of records to sort. The original array is not mutated.
 * @param sortConfig - Ordered list of sort descriptors. An empty array returns `data` unchanged.
 * @param groupConfig - Unused in the current implementation; reserved for future
 *   group-aware sorting strategies.
 * @returns A new sorted array; the input `data` array is never mutated.
 *
 * @example
 * const sorted = applySort(rows, [{ field: 'region', direction: 'asc', type: 'dimension' }]);
 */
export function applySort<T extends DataRecord>(
  data: T[],
  sortConfig: SortConfig[],
  groupConfig?: GroupConfig | null
): T[] {
  if (!sortConfig || sortConfig.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const config of sortConfig) {
      const { field, direction, type, aggregation } = config;

      if (type === 'measure') {
        const valueA = calculateMeasureValue(a, field, aggregation);
        const valueB = calculateMeasureValue(b, field, aggregation);

        if (valueA !== valueB) {
          return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
      } else {
        const valueA = a[field] as string | number;
        const valueB = b[field] as string | number;

        if (valueA !== valueB) {
          return direction === 'asc'
            ? valueA < valueB
              ? -1
              : 1
            : valueA > valueB
              ? -1
              : 1;
        }
      }
    }
    return 0;
  });
}

function calculateMeasureValue(
  item: DataRecord,
  field: string,
  aggregation?: string
): number {
  const value = Number(item[field]) || 0;
  return value;
}

/**
 * Sorts an array of pre-computed {@link Group} objects by their aggregate values.
 *
 * Each group's `aggregates` map is keyed as `"<aggregation>_<field>"` (e.g. `"sum_sales"`).
 * Groups are compared in `sortConfig` order, falling back to the next descriptor on a tie.
 *
 * @param groups - The groups to sort. The original array is not mutated.
 * @param sortConfig - Ordered list of sort descriptors referencing measure fields.
 *   An empty array returns `groups` unchanged.
 * @returns A new sorted array of groups.
 *
 * @example
 * const sorted = sortGroups(groups, [{ field: 'sales', direction: 'desc', aggregation: 'sum', type: 'measure' }]);
 */
export function sortGroups(groups: Group[], sortConfig: SortConfig[]): Group[] {
  if (!sortConfig || sortConfig.length === 0) return groups;

  return [...groups].sort((a, b) => {
    for (const config of sortConfig) {
      const { field, direction } = config;
      const aggregateKeyA = `${config.aggregation || 'sum'}_${field}`;
      const aggregateKeyB = `${config.aggregation || 'sum'}_${field}`;

      const valueA = a.aggregates[aggregateKeyA] || 0;
      const valueB = b.aggregates[aggregateKeyB] || 0;

      if (valueA !== valueB) {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
    }
    return 0;
  });
}
