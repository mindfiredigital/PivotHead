import * as react_jsx_runtime from 'react/jsx-runtime';
import { PivotTableConfig, ProcessedRow, PivotTableState } from '@pivothead/core';
export { AggregationType, DimensionConfig, MeasureConfig, PivotTableConfig, PivotTableState, ProcessedRow } from '@pivothead/core';

interface PivotTableProps<T> extends PivotTableConfig<T> {
    className?: string;
    onRowClick?: (row: ProcessedRow<T>) => void;
    onCellClick?: (row: ProcessedRow<T>, field: string) => void;
}
declare function PivotTable<T>({ data, dimensions, measures, plugins, className, onRowClick, onCellClick }: PivotTableProps<T>): react_jsx_runtime.JSX.Element;

declare function usePivotTable<T>(config: PivotTableConfig<T>): {
    state: PivotTableState<T>;
    actions: {
        toggleExpand: (rowId: string) => void;
        sort: (field: string, direction: "asc" | "desc") => void;
    };
};

export { PivotTable, usePivotTable };
