import { SortConfig } from '../types/interfaces'

export function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.field]
    const bValue = b[sortConfig.field]

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })
}

