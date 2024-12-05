import { PivotTableConfig, SortConfig } from '../types/interfaces'
import { applySort } from './sorter'

export function processData<T extends Record<string, any>>(
  config: PivotTableConfig<T>,
  sortConfig: SortConfig | null = null
): T[] {
  let processedData = [...config.data]

  if (sortConfig) {
    processedData = applySort(processedData, sortConfig)
  }

  return processedData
}

