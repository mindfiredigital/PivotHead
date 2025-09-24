export * from './types/interfaces';

export declare class PivotEngine<T extends Record<string, any>> {
  constructor(config: import('./types/interfaces').PivotTableConfig<T>);
  getState(): import('./types/interfaces').PivotTableState<T>;
  sort(field: string, direction: 'asc' | 'desc'): void;
  reset(): void;
  resizeRow(index: number, height: number): void;
  setGroupConfig(
    groupConfig: import('./types/interfaces').GroupConfig | null
  ): void;
  getGroupedData(): import('./types/interfaces').Group[];
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
}

// ConnectService types and class
export interface ConnectionOptions {
  csv?: {
    delimiter?: string;
    hasHeader?: boolean;
    skipEmptyLines?: boolean;
    trimValues?: boolean;
    encoding?: string;
  };
  json?: {
    arrayPath?: string;
    validateSchema?: boolean;
  };
  maxFileSize?: number;
  maxRecords?: number;
  onProgress?: (progress: number) => void;
}

export interface FileConnectionResult {
  success: boolean;
  data?: any[];
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  columns?: string[];
  error?: string;
  validationErrors?: string[];
}

export declare class ConnectService {
  static connectToLocalCSV(
    engine: PivotEngine<any>,
    options?: ConnectionOptions
  ): Promise<FileConnectionResult>;

  static connectToLocalJSON(
    engine: PivotEngine<any>,
    options?: ConnectionOptions
  ): Promise<FileConnectionResult>;

  static connectToLocalFile(
    engine: PivotEngine<any>,
    options?: ConnectionOptions
  ): Promise<FileConnectionResult>;
}

// Declare the applySort function
export declare function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: import('./types/interfaces').SortConfig
): T[];
