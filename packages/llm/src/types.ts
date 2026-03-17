// All TypeScript interfaces and types for the entire package. No implementation.

export interface LLMEngineOptions {
  /** WebLLM model ID. Defaults to Llama-3.2-3B-Instruct-q4f16_1-MLC */
  model?: string;
  /** Called synchronously in constructor with WebGPU check result */
  onCapability?: (report: CapabilityReport) => void;
  /** Max conversation turns to retain. Default 10 */
  maxHistory?: number;
}

export interface CapabilityReport {
  /** Whether navigator.gpu exists */
  webgpu: boolean;
  /** Human-readable status message */
  message: string;
}

export interface LoadProgress {
  /** 0 to 1 */
  progress: number;
  /** Status text from web-llm */
  text: string;
  /** Current phase */
  stage: 'downloading' | 'initializing' | 'ready';
}

export interface FieldSchema {
  /** Field name */
  name: string;
  /** Inferred data type */
  type: 'string' | 'number' | 'date';
  /** Optional. Distinct values for low-cardinality string fields only */
  values?: string[];
}

export interface PivotState {
  /** Active group-by field */
  groupBy?: string;
  /** Active sort field */
  sortBy?: string;
  /** Active filters keyed by field */
  filters?: Record<string, unknown>;
}

export interface PivotContext {
  /** All field names, types, and optional distinct values */
  fields: FieldSchema[];
  /** Up to 5 raw rows from the dataset */
  sampleRows: Record<string, unknown>[];
  /** Top 10 rows from current aggregated pivot output */
  pivotOutput: Record<string, unknown>[];
  /** Active filters, groupBy, and sortBy */
  currentState: PivotState;
}

// --- PivotAction discriminated union (13 types) ---

export interface FilterAction {
  type: 'filter';
  field: string;
  operator: string;
  value: unknown;
}

export interface RemoveFilterAction {
  type: 'removeFilter';
  field: string;
}

export interface SortAction {
  type: 'sort';
  field: string;
  direction: 'asc' | 'desc';
}

export interface GroupByAction {
  type: 'groupBy';
  field: string;
}

export interface TopNAction {
  type: 'topN';
  n: number;
  measure: string;
  order: 'asc' | 'desc';
}

export interface AggregateAction {
  type: 'aggregate';
  field: string;
  func: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ResetAllAction {
  type: 'resetAll';
}

export interface ExportAction {
  type: 'export';
  format: 'csv' | 'json' | 'pdf';
}

export interface SwitchTabAction {
  type: 'switchTab';
  tab: string;
}

export interface ChartTypeAction {
  type: 'chartType';
  chartType: string;
}

export interface AnswerAction {
  type: 'answer';
  text: string;
}

export interface ClarifyAction {
  type: 'clarify';
  question: string;
}

export interface ErrorAction {
  type: 'error';
  message: string;
}

export interface StyleAction {
  type: 'style';
  /** 'row' = entire row matching value; 'column' = column header + all cells in that column */
  target: 'row' | 'column';
  /** The row value (e.g. "Accessories") or column/field name (e.g. "price") to match */
  value: string;
  /** CSS property to set */
  property:
    | 'backgroundColor'
    | 'color'
    | 'fontWeight'
    | 'fontStyle'
    | 'fontSize';
  /** CSS value (e.g. "red", "#ff0000", "bold", "italic", "14px") */
  style: string;
}

export interface ResetStyleAction {
  type: 'resetStyle';
}

export type PivotAction =
  | FilterAction
  | RemoveFilterAction
  | SortAction
  | GroupByAction
  | TopNAction
  | AggregateAction
  | ResetAllAction
  | ExportAction
  | SwitchTabAction
  | ChartTypeAction
  | AnswerAction
  | ClarifyAction
  | ErrorAction
  | StyleAction
  | ResetStyleAction;
