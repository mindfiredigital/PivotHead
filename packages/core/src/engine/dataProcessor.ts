import { GroupConfig, PivotTableConfig, SortConfig } from '../types/interfaces'
import { applySort } from './sorter'

export function processData<T extends Record<string, any>>(
  config: PivotTableConfig<T>,
  sortConfig: SortConfig | null = null,
  groupConfig: GroupConfig | null = null
): T[] {
  let processedData = [...config.data]

  if (sortConfig) {
    processedData = applySort(processedData, sortConfig)
  }
  
  if (groupConfig) {
    const { fields, grouper } = groupConfig
    const groups: { [key: string]: T[] } = {}

    processedData.forEach(item => {
      const groupKey = grouper(item, fields)
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })

    processedData = Object.values(groups).flat()
  }


  return processedData
}

