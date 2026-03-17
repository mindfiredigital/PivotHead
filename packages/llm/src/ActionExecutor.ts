import type { PivotAction } from './types.js';

export interface PivotEngineRef {
  applyFilter?: (opts: {
    field: string;
    operator: string;
    value: unknown;
  }) => void;
  removeFilter?: (field: string) => void;
  sortData?: (field: string, direction: 'asc' | 'desc') => void;
  groupData?: (field: string) => void;
  applyTopN?: (n: number, measure: string, order: 'asc' | 'desc') => void;
  setAggregation?: (field: string, func: string) => void;
  reset?: () => void;
  export?: (format: string) => void;
  /** Apply a CSS style rule to matching rows or columns in the rendered table */
  applyStyle?: (
    target: 'row' | 'column',
    value: string,
    property: string,
    style: string
  ) => void;
  /** Remove all LLM-applied styles from the table */
  resetStyle?: () => void;
}

export interface ChartEngineRef {
  updateChartType?: (chartType: string) => void;
}

export interface ActionExecutorOptions {
  pivotEngine: PivotEngineRef;
  chartEngine?: ChartEngineRef;
  onActionApplied?: (
    action: PivotAction,
    result: { success: boolean; description: string }
  ) => void;
  onError?: (action: PivotAction, error: Error) => void;
}

export class ActionExecutor {
  private pivotEngine: PivotEngineRef;
  private chartEngine: ChartEngineRef | undefined;
  private onActionApplied: (
    action: PivotAction,
    result: { success: boolean; description: string }
  ) => void;
  private onError: (action: PivotAction, error: Error) => void;

  constructor(options: ActionExecutorOptions) {
    this.pivotEngine = options.pivotEngine;
    this.chartEngine = options.chartEngine;
    this.onActionApplied = options.onActionApplied ?? (() => {});
    this.onError = options.onError ?? (() => {});
  }

  async execute(action: PivotAction): Promise<void> {
    try {
      switch (action.type) {
        case 'filter':
          this.pivotEngine.applyFilter?.({
            field: action.field,
            operator: action.operator,
            value: action.value,
          });
          this.onActionApplied(action, {
            success: true,
            description: `Filtered ${action.field} ${action.operator} ${String(action.value)}`,
          });
          break;

        case 'removeFilter':
          this.pivotEngine.removeFilter?.(action.field);
          this.onActionApplied(action, {
            success: true,
            description: `Removed filter on ${action.field}`,
          });
          break;

        case 'sort':
          this.pivotEngine.sortData?.(action.field, action.direction);
          this.onActionApplied(action, {
            success: true,
            description: `Sorted by ${action.field} (${action.direction})`,
          });
          break;

        case 'groupBy':
          this.pivotEngine.groupData?.(action.field);
          this.onActionApplied(action, {
            success: true,
            description: `Grouped by ${action.field}`,
          });
          break;

        case 'topN':
          this.pivotEngine.applyTopN?.(action.n, action.measure, action.order);
          this.onActionApplied(action, {
            success: true,
            description: `Showing top ${action.n} by ${action.measure}`,
          });
          break;

        case 'aggregate':
          this.pivotEngine.setAggregation?.(action.field, action.func);
          this.onActionApplied(action, {
            success: true,
            description: `Aggregation for ${action.field} set to ${action.func}`,
          });
          break;

        case 'resetAll':
          this.pivotEngine.reset?.();
          this.onActionApplied(action, {
            success: true,
            description: 'Table reset to default state',
          });
          break;

        case 'export':
          this.pivotEngine.export?.(action.format);
          this.onActionApplied(action, {
            success: true,
            description: `Exporting as ${action.format}`,
          });
          break;

        case 'switchTab':
          window.dispatchEvent(
            new CustomEvent('pivothead:switchTab', {
              detail: { tab: action.tab },
            })
          );
          this.onActionApplied(action, {
            success: true,
            description: `Switched to ${action.tab} tab`,
          });
          break;

        case 'chartType':
          this.chartEngine?.updateChartType?.(action.chartType);
          this.onActionApplied(action, {
            success: true,
            description: `Chart type changed to ${action.chartType}`,
          });
          break;

        case 'answer':
          this.onActionApplied(action, {
            success: true,
            description: action.text,
          });
          break;

        case 'clarify':
          this.onActionApplied(action, {
            success: true,
            description: action.question,
          });
          break;

        case 'style':
          this.pivotEngine.applyStyle?.(
            action.target,
            action.value,
            action.property,
            action.style
          );
          this.onActionApplied(action, {
            success: true,
            description: `Style applied: ${action.target} "${action.value}" → ${action.property}: ${action.style}`,
          });
          break;

        case 'resetStyle':
          this.pivotEngine.resetStyle?.();
          this.onActionApplied(action, {
            success: true,
            description: 'All styles cleared',
          });
          break;

        case 'error':
          this.onError(action, new Error(action.message));
          break;
      }
    } catch (err) {
      this.onError(action, err instanceof Error ? err : new Error(String(err)));
    }
  }
}
