interface DimensionConfig {
    field: string;
    type: 'string' | 'number' | 'date';
}
interface MeasureConfig {
    field: string;
    aggregationType: AggregationType;
    formatter?: (value: number) => string;
}
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';
interface PivotTableConfig<T> {
    data: T[];
    dimensions: DimensionConfig[];
    measures: MeasureConfig[];
    plugins?: any[];
}
interface ProcessedRow<T> {
    id: string;
    level: number;
    isExpanded: boolean;
    parentId?: string;
    dimensions: {
        [key: string]: any;
    };
    measures: {
        [key: string]: number;
    };
    originalData: T[];
}
interface PivotTableState<T> {
    rows: ProcessedRow<T>[];
    columns: string[];
    expandedNodes: Set<string>;
    sortConfig: {
        field: string;
        direction: 'asc' | 'desc';
    } | null;
    filterConfig: {
        field: string;
        value: any;
    } | null;
}

// Declare the PivotEngine class
declare class PivotEngine<T> {
  constructor(config: PivotTableConfig<T>)
  getState(): PivotTableState<T>
  toggleExpand(rowId: string): void
  sort(field: string, direction: 'asc' | 'desc'): void
  filter(field: string, value: any): void
  reset(): void
}

export { AggregationType, DimensionConfig, MeasureConfig, PivotEngine, PivotTableConfig, PivotTableState, ProcessedRow };
