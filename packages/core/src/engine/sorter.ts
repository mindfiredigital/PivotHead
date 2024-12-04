// All sorting related logic

import { ProcessedRow } from '../types/interfaces'

export function applySort<T>(
  rows: ProcessedRow<T>[],
  sortConfig: { field: string; direction: 'asc' | 'desc' }
): ProcessedRow<T>[] {
  return [...rows].sort((a, b) => {
    const aValue = getValue(a, sortConfig.field)
    const bValue = getValue(b, sortConfig.field)

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })
}

function getValue<T>(row: ProcessedRow<T>, field: string): any {
  return row.dimensions[field] ?? row.measures[field]
}

