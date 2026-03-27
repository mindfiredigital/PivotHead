import {
  GroupConfig,
  PivotTableConfig,
  SortConfig,
  Group,
  ProcessedDataResult,
  DataRecord,
} from '../types/interfaces';
import { applySort } from './sorter';

/**
 * Processes raw pivot table data by applying optional sorting and grouping.
 *
 * Sorting is applied first (when a `sortConfig` is provided), then the sorted
 * data is grouped according to `groupConfig`. If no grouping is specified the
 * `groups` array in the result will be empty.
 *
 * @param config - The full pivot table configuration, including the raw `data` array.
 * @param sortConfig - Optional single-field sort descriptor. Pass `null` to skip sorting.
 * @param groupConfig - Optional grouping specification defining row/column fields and
 *   the grouper function used to derive a group key from each record.
 * @returns A {@link ProcessedDataResult} containing the (possibly sorted) `rawData`
 *   array and the derived `groups` hierarchy.
 *
 * @example
 * const result = processData(config, { field: 'sales', direction: 'desc', type: 'measure' });
 * console.log(result.rawData); // sorted rows
 */
export function processData<T extends DataRecord>(
  config: PivotTableConfig<T>,
  sortConfig: SortConfig | null = null,
  groupConfig: GroupConfig | null = null
): ProcessedDataResult<T> {
  let processedData = [...(config.data || [])];
  if (sortConfig) {
    processedData = applySort(processedData, [sortConfig]);
  }

  let groups: Group[] = [];

  if (groupConfig) {
    const { rowFields, columnFields, grouper } = groupConfig;
    const fields = [...rowFields, ...columnFields];
    groups = createGroups(processedData, fields, grouper);
  }

  return { rawData: processedData, groups };
}

function createGroups<T extends DataRecord>(
  data: T[],
  fields: string[],
  grouper: (item: T, fields: string[]) => string
): Group[] {
  if (!fields || fields.length === 0) {
    return [{ key: 'All', items: data, subgroups: [], aggregates: {} }];
  }

  const groups: { [key: string]: Group } = {};

  data.forEach(item => {
    const key = grouper(item, fields);
    if (!groups[key]) {
      groups[key] = { key, items: [], subgroups: [], aggregates: {} };
    }
    groups[key].items.push(item);
  });

  if (fields.length > 1) {
    Object.values(groups).forEach(group => {
      group.subgroups = createGroups(
        group.items as T[],
        fields.slice(1),
        grouper
      );
    });
  }

  return Object.values(groups);
}
