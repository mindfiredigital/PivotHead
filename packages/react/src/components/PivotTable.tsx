import React, { useMemo, useState } from 'react'
import type { PivotTableConfig, ProcessedRow, DimensionConfig, MeasureConfig } from '@pivothead/core'
import { usePivotTable } from '../hooks/usePivotTable'

export interface PivotTableProps<T> extends PivotTableConfig<T> {
  className?: string
  onRowClick?: (row: ProcessedRow<T>) => void
  onCellClick?: (row: ProcessedRow<T>, field: string) => void
}

export function PivotTable<T>({
  data,
  dimensions,
  measures,
  plugins,
  className,
  onRowClick,
  onCellClick
}: PivotTableProps<T>) {
  const { state, actions } = usePivotTable<T>({
    data,
    dimensions,
    measures,
    plugins
  })

  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null)

  const sortedRows = useMemo(() => {
    if (!sortConfig) return state.rows

    return [...state.rows].sort((a, b) => {
      const aValue = a.dimensions[sortConfig.field] || a.measures[sortConfig.field]
      const bValue = b.dimensions[sortConfig.field] || b.measures[sortConfig.field]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [state.rows, sortConfig])

  const handleSort = (field: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.field === field) {
        return { field, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  const renderedRows = useMemo(() => {
    return sortedRows.map(row => (
      <tr 
        key={row.id}
        onClick={() => onRowClick?.(row)}
        className="hover:bg-muted/50"
      >
        {dimensions.map((dim: DimensionConfig) => (
          <td 
            key={dim.field}
            className="p-2 border"
            style={{ paddingLeft: `${row.level * 1.5}rem` }}
          >
            {row.dimensions[dim.field]}
          </td>
        ))}
        {measures.map((measure: MeasureConfig) => (
          <td 
            key={measure.field}
            className="p-2 border text-right"
            onClick={(e) => {
              e.stopPropagation()
              onCellClick?.(row, measure.field)
            }}
          >
            {measure.formatter?.(row.measures[measure.field]) ?? 
              row.measures[measure.field]}
          </td>
        ))}
      </tr>
    ))
  }, [sortedRows, dimensions, measures, onRowClick, onCellClick])

  return (
    <div className={`overflow-auto ${className ?? ''}`}>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            {dimensions.map((dim: DimensionConfig) => (
              <th 
                key={dim.field}
                className="p-2 border bg-muted text-left cursor-pointer"
                onClick={() => handleSort(dim.field)}
              >
                <div className="flex items-center justify-between">
                  {dim.field}
                  {sortConfig?.field === dim.field && (
                    sortConfig.direction === 'asc' ? '▲' : '▼'
                  )}
                </div>
              </th>
            ))}
            {measures.map((measure: MeasureConfig) => (
              <th 
                key={measure.field}
                className="p-2 border bg-muted text-right cursor-pointer"
                onClick={() => handleSort(measure.field)}
              >
                <div className="flex items-center justify-end">
                  {measure.field}
                  {sortConfig?.field === measure.field && (
                    sortConfig.direction === 'asc' ? '▲' : '▼'
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderedRows}
        </tbody>
      </table>
    </div>
  )
}

