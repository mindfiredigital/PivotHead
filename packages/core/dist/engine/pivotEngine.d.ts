import { PivotTableConfig, PivotTableState } from '../types/interfaces';
export declare class PivotEngine<T extends Record<string, any>> {
    private config;
    private state;
    constructor(config: PivotTableConfig<T>);
    sort(field: string, direction: 'asc' | 'desc'): void;
    private applySort;
    getState(): PivotTableState<T>;
    reset(): void;
}
//# sourceMappingURL=pivotEngine.d.ts.map