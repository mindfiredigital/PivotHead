import * as react_jsx_runtime from 'react/jsx-runtime';
import { PivotTableConfig, PivotTableState } from '@pivothead/core';
export { Column, PivotTableConfig, PivotTableState } from '@pivothead/core';

interface PivotTableProps<T> extends PivotTableConfig<T> {
    className?: string;
    onRowClick?: (row: T) => void;
    onCellClick?: (row: T, field: string) => void;
}
declare function PivotTable<T extends Record<string, any>>({ data, columns, className, onRowClick, onCellClick, }: PivotTableProps<T>): react_jsx_runtime.JSX.Element;

declare function usePivotTable<T extends Record<string, any>>(config: PivotTableConfig<T>): {
    state: PivotTableState<T>;
    actions: {
        sort: (field: string, direction: "asc" | "desc") => void;
        reset: () => void;
    };
};

export { PivotTable, usePivotTable };
