import type { PivotTableConfig } from '@pivothead/core';
import { usePivotTable } from '../hooks/usePivotTable';

export interface PivotTableProps<T> extends PivotTableConfig<T> {
  className?: string;
  onRowClick?: (row: T) => void;
  onCellClick?: (row: T, field: string) => void;
}
export function PivotTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
  onCellClick,
}: PivotTableProps<T>) {
  const { state, actions } = usePivotTable<T>({ data, columns });

  return (
    <div className={className}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() =>
                  actions.sort(
                    column.field,
                    state.sortConfig?.direction === 'asc' ? 'desc' : 'asc',
                  )
                }
              >
                {column.label}
                {state.sortConfig?.field === column.field &&
                  (state.sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.data.map((row, index) => (
            <tr key={index} onClick={() => onRowClick?.(row)}>
              {columns.map((column) => (
                <td
                  key={column.field}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCellClick?.(row, column.field);
                  }}
                >
                  {row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
