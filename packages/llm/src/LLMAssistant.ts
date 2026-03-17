import { LLMEngine } from './LLMEngine.js';
import { ActionExecutor } from './ActionExecutor.js';
import { ContextBuilder } from './ContextBuilder.js';
import type { CapabilityReport, LoadProgress, PivotContext } from './types.js';

type RawRow = Record<string, unknown>;

interface FilterConfig {
  field: string;
  operator: string;
  value: unknown;
}

/**
 * Structural interface for a PivotEngine instance.
 * Matches the public API of @mindfiredigital/pivothead — no direct import needed.
 */
export interface PivotEngineInstance {
  getState(): {
    rawData?: RawRow[];
    sortConfig?: unknown;
    groupConfig?: { rowFields?: string[]; columnFields?: string[] };
    filters?: unknown;
  };
  applyFilters(filters: FilterConfig[]): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  reset(): void;
  /** Optional — used to read current active filters before merging a new one */
  getFilterState?(): FilterConfig[];
}

/**
 * Structural interface for a ChartEngine instance.
 * Matches @mindfiredigital/pivothead-analytics ChartEngine public API.
 */
export interface ChartEngineInstance {
  updateChartType?(chartType: string): void;
}

export interface LLMAssistantOptions {
  /** The live PivotEngine instance from @mindfiredigital/pivothead */
  engine: PivotEngineInstance;
  /** Optional ChartEngine for chart-type switching actions */
  chartEngine?: ChartEngineInstance;
  /**
   * Called whenever the assistant produces a message (answer, confirmation, error).
   * Wire this to your chat UI.
   */
  onMessage: (role: 'assistant' | 'error', text: string) => void;
  /** Called synchronously in constructor with WebGPU availability report */
  onCapability?: (report: CapabilityReport) => void;
  /** WebLLM model ID. Defaults to Llama-3.2-3B-Instruct-q4f16_1-MLC */
  model?: string;
  /** Max conversation turns to retain in history. Default 10 */
  maxHistory?: number;
}

/**
 * High-level assistant that wires LLMEngine + ActionExecutor + ContextBuilder together.
 *
 * Users only need to:
 *   1. new LLMAssistant({ engine, onMessage })
 *   2. await assistant.load()
 *   3. await assistant.query('filter country equals France')
 *
 * No manual context building, no ActionExecutor wiring, no PivotEngineRef adapter required.
 */
export class LLMAssistant {
  private llmEngine: LLMEngine;
  private pivotEngine: PivotEngineInstance;
  private chartEngine?: ChartEngineInstance;
  private onMessage: (role: 'assistant' | 'error', text: string) => void;

  constructor(options: LLMAssistantOptions) {
    this.pivotEngine = options.engine;
    this.chartEngine = options.chartEngine;
    this.onMessage = options.onMessage;

    this.llmEngine = new LLMEngine({
      model: options.model,
      maxHistory: options.maxHistory,
      onCapability: options.onCapability,
    });
  }

  /** Whether the model is loaded and ready to accept queries */
  isReady(): boolean {
    return this.llmEngine.isReady();
  }

  /**
   * Download and initialise the LLM model (~1.5 GB, cached by the browser after first load).
   * @param onProgress Optional callback for download/init progress (0–1).
   */
  async load(onProgress?: (progress: LoadProgress) => void): Promise<void> {
    await this.llmEngine.load(onProgress);
  }

  /** Unload the model and free GPU memory */
  async unload(): Promise<void> {
    await this.llmEngine.unload();
  }

  /**
   * Send a natural-language query. The assistant will:
   * 1. Auto-build context from the current engine state
   * 2. Query the LLM
   * 3. Execute the resulting action on the engine
   * 4. Call onMessage with the result
   */
  async query(text: string): Promise<void> {
    const state = this.pivotEngine.getState();
    const rawData = state.rawData ?? [];

    const context = ContextBuilder.fromRawData(rawData, {
      groupConfig: state.groupConfig,
      sortConfig: state.sortConfig,
      filters: state.filters,
    });

    this.llmEngine.setContext(context);

    const action = await this.llmEngine.query(text);
    await this.buildExecutor(rawData, context, text.toLowerCase()).execute(
      action
    );
  }

  /** Clear LLM conversation history */
  clearHistory(): void {
    this.llmEngine.clearHistory();
  }

  private buildExecutor(
    rawData: RawRow[],
    context: PivotContext,
    queryText: string
  ): ActionExecutor {
    const engine = this.pivotEngine;
    const chartEngine = this.chartEngine;
    const onMessage = this.onMessage;

    function computeAgg(values: number[], fn: string): number {
      if (!values.length) return 0;
      switch (fn.toLowerCase()) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'avg':
        case 'average':
          return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count':
          return values.length;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
        default:
          return values.reduce((a, b) => a + b, 0);
      }
    }

    const fmt = (n: number) => Math.round(n * 100) / 100;

    return new ActionExecutor({
      pivotEngine: {
        applyFilter: ({ field, operator, value }) => {
          const current = engine.getFilterState?.() ?? [];
          const without = current.filter(f => f.field !== field);
          engine.applyFilters([...without, { field, operator, value }]);
        },

        removeFilter: field => {
          const current = engine.getFilterState?.() ?? [];
          engine.applyFilters(current.filter(f => f.field !== field));
        },

        sortData: (field, direction) => {
          engine.sort(field, direction);
        },

        reset: () => engine.reset(),

        /**
         * Computes the aggregation from raw data and delivers the result via onMessage.
         * Also narrows the breakdown to groups mentioned in the query.
         */
        setAggregation: (field, func) => {
          if (!rawData.length || !field) {
            onMessage(
              'error',
              `Cannot compute ${func}(${field}): no data available.`
            );
            return;
          }

          const allValues = rawData
            .map(r => Number(r[field]))
            .filter(v => !isNaN(v));
          const grandTotal = fmt(computeAgg(allValues, func));

          const rowField = context.currentState.groupBy;
          const colField = engine.getState().groupConfig?.columnFields?.[0];

          if (!rowField) {
            onMessage(
              'assistant',
              `${func.toUpperCase()}(${field}) = ${grandTotal.toLocaleString()}`
            );
            return;
          }

          // Build per-group breakdown
          const groupMap = new Map<string, number[]>();
          rawData.forEach(row => {
            const rv = String(row[rowField]);
            const cv = colField ? String(row[colField]) : null;
            const key = cv ? `${rv} / ${cv}` : rv;
            const val = Number(row[field]);
            if (!isNaN(val)) {
              if (!groupMap.has(key)) groupMap.set(key, []);
              groupMap.get(key)!.push(val);
            }
          });

          // Narrow to groups that match keywords in the query
          const stopWords = new Set([
            'what',
            'is',
            'the',
            'of',
            'for',
            'and',
            'in',
            'a',
            'an',
            'sum',
            'avg',
            'count',
            'min',
            'max',
            'total',
            'average',
            'show',
            'me',
            'give',
            'tell',
            'how',
            'much',
            'many',
            'are',
            'by',
            'to',
            'or',
          ]);
          const queryWords = queryText
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(
              w =>
                w.length > 1 && !stopWords.has(w) && w !== field.toLowerCase()
            );

          const rowValues = [...new Set(rawData.map(r => String(r[rowField])))];
          const colValues = colField
            ? [...new Set(rawData.map(r => String(r[colField])))]
            : [];

          const matchedRowVals = rowValues.filter(v =>
            queryWords.some(w => v.toLowerCase().includes(w))
          );
          const matchedColVals = colValues.filter(v =>
            queryWords.some(w => v.toLowerCase().includes(w))
          );

          const relevantEntries =
            matchedRowVals.length > 0 || matchedColVals.length > 0
              ? [...groupMap.entries()].filter(([k]) => {
                  const parts = k.split(' / ');
                  const rv = parts[0];
                  const cv = parts[1] ?? null;
                  const rowOk =
                    matchedRowVals.length === 0 ||
                    matchedRowVals.some(
                      v => v.toLowerCase() === rv.toLowerCase()
                    );
                  const colOk =
                    matchedColVals.length === 0 ||
                    (cv !== null &&
                      matchedColVals.some(
                        v => v.toLowerCase() === cv.toLowerCase()
                      ));
                  return rowOk && colOk;
                })
              : [];

          if (relevantEntries.length > 0) {
            const filteredValues = relevantEntries.flatMap(([, vals]) => vals);
            const filteredTotal = fmt(computeAgg(filteredValues, func));
            const lines = relevantEntries
              .map(
                ([k, vals]) =>
                  `  ${k}: ${fmt(computeAgg(vals, func)).toLocaleString()}`
              )
              .join('\n');
            const groupLabel = colField
              ? `${rowField} × ${colField}`
              : rowField;
            onMessage(
              'assistant',
              `${func.toUpperCase()}(${field}) = ${filteredTotal.toLocaleString()}\n\nBreakdown by ${groupLabel}:\n${lines}`
            );
          } else {
            const lines = [...groupMap.entries()]
              .map(
                ([k, vals]) =>
                  `  ${k}: ${fmt(computeAgg(vals, func)).toLocaleString()}`
              )
              .join('\n');
            const groupLabel = colField
              ? `${rowField} × ${colField}`
              : rowField;
            onMessage(
              'assistant',
              `${func.toUpperCase()}(${field}) = ${grandTotal.toLocaleString()}\n\nBreakdown by ${groupLabel}:\n${lines}`
            );
          }
        },

        applyStyle: (_target, _value, _property, _style) => {
          // Styling is DOM-level — implement in your UI adapter.
          // When using LLMAssistant directly, handle the 'style' action via onActionApplied.
        },

        resetStyle: () => {
          // Styling is DOM-level — implement in your UI adapter.
        },

        groupData: _field => {
          onMessage(
            'assistant',
            'groupBy requires rebuilding the pivot config — not supported via LLM in this version.'
          );
        },

        applyTopN: (_n, _measure, _order) => {
          onMessage('assistant', 'topN is not yet supported.');
        },

        export: format => {
          onMessage(
            'assistant',
            `Export as ${format}: handle this in your app via the onMessage callback.`
          );
        },
      },

      chartEngine: chartEngine
        ? { updateChartType: t => chartEngine.updateChartType?.(t) }
        : undefined,

      onActionApplied: (_action, result) => {
        onMessage('assistant', `✓ ${result.description}`);
      },

      onError: (_action, error) => {
        // Treat as a plain assistant message so the chat stays conversational.
        onMessage('assistant', error.message);
      },
    });
  }
}
