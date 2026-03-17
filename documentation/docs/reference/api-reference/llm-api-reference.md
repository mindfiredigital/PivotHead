---
id: llm-api-reference
title: LLM API Reference
sidebar_label: LLM Assistant
description: Complete API reference for @mindfiredigital/pivothead-llm — natural-language AI assistant for pivot tables
keywords: [api, llm, ai, assistant, webgpu, webllm, natural language, pivothead]
---

# LLM API Reference

Complete reference for `@mindfiredigital/pivothead-llm`.

---

## Installation

```bash
npm install @mindfiredigital/pivothead-llm
```

**Peer dependencies**

```bash
npm install @mindfiredigital/pivothead          # required
npm install @mindfiredigital/pivothead-analytics # optional — chart actions only
```

---

## Classes

### `LLMAssistant`

High-level class. Takes your pivot engine directly — no adapter code, no manual context building.

```ts
import { LLMAssistant } from '@mindfiredigital/pivothead-llm';
```

#### Constructor

```ts
new LLMAssistant(options: LLMAssistantOptions)
```

Fires `onCapability` synchronously in the constructor. Does **not** load the model — call `load()` separately.

#### Methods

| Method         | Signature                         | Description                                                                                                    |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `isReady`      | `() => boolean`                   | Returns `true` when the model is loaded and ready to receive queries                                           |
| `load`         | `(onProgress?) => Promise<void>`  | Download and initialise the model. Safe to call multiple times — subsequent calls are no-ops if already loaded |
| `query`        | `(text: string) => Promise<void>` | Send a natural-language query. Applies the resulting action to the engine and calls `onMessage` with the reply |
| `clearHistory` | `() => void`                      | Reset the conversation history kept in memory                                                                  |
| `unload`       | `() => Promise<void>`             | Unload the model and free GPU memory                                                                           |

---

### `LLMEngine`

Lower-level class. Handles model lifecycle and LLM inference. Use this if you want to manage action execution yourself.

```ts
import { LLMEngine } from '@mindfiredigital/pivothead-llm';
```

#### Constructor

```ts
new LLMEngine(options?: LLMEngineOptions)
```

#### Methods

| Method         | Signature                                   | Description                                                |
| -------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `isReady`      | `() => boolean`                             | Whether the model is loaded                                |
| `load`         | `(onProgress?) => Promise<void>`            | Load the model                                             |
| `unload`       | `() => Promise<void>`                       | Unload and free memory                                     |
| `setContext`   | `(context: PivotContext) => void`           | Set the pivot data context used to build the system prompt |
| `query`        | `(text: string) => Promise<PivotAction>`    | Run inference and return a parsed `PivotAction`            |
| `queryStream`  | `(text, signal?) => AsyncGenerator<string>` | Streaming version — yields text deltas                     |
| `clearHistory` | `() => void`                                | Clear conversation history                                 |

---

### `ActionExecutor`

Maps a `PivotAction` to calls on your engine adapter. Used internally by `LLMAssistant`. Use directly for custom wiring.

```ts
import { ActionExecutor } from '@mindfiredigital/pivothead-llm';
```

#### Constructor

```ts
new ActionExecutor(options: ActionExecutorOptions)
```

#### Methods

| Method    | Signature                                | Description             |
| --------- | ---------------------------------------- | ----------------------- |
| `execute` | `(action: PivotAction) => Promise<void>` | Execute a parsed action |

---

### `ContextBuilder`

Builds a `PivotContext` from raw engine state. Used internally by `LLMAssistant`.

```ts
import { ContextBuilder } from '@mindfiredigital/pivothead-llm';
```

#### Static Methods

| Method        | Signature                             | Description                                                            |
| ------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `fromRawData` | `(rawData, options?) => PivotContext` | Build context from raw data rows and optional group/sort/filter config |

---

## Interfaces

### `LLMAssistantOptions`

```ts
interface LLMAssistantOptions {
  /** The live PivotEngine instance */
  engine: PivotEngineInstance;
  /** Called with every assistant reply — wire to your chat UI */
  onMessage: (role: 'assistant' | 'error', text: string) => void;
  /** Fires synchronously in constructor with WebGPU availability */
  onCapability?: (report: CapabilityReport) => void;
  /** Optional ChartEngine for chart-type switching actions */
  chartEngine?: ChartEngineInstance;
  /** Override the default model ID */
  model?: string;
  /** Conversation turns to keep in history (default: 10) */
  maxHistory?: number;
}
```

### `LLMEngineOptions`

```ts
interface LLMEngineOptions {
  /** WebLLM model ID. Default: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' */
  model?: string;
  /** Called synchronously in constructor with WebGPU check result */
  onCapability?: (report: CapabilityReport) => void;
  /** Max conversation turns to retain (default: 10) */
  maxHistory?: number;
}
```

### `ActionExecutorOptions`

```ts
interface ActionExecutorOptions {
  /** Adapter mapping to your actual pivot engine methods */
  pivotEngine: PivotEngineRef;
  /** Optional chart engine adapter */
  chartEngine?: ChartEngineRef;
  /** Called after every successful action */
  onActionApplied?: (
    action: PivotAction,
    result: { success: boolean; description: string }
  ) => void;
  /** Called when an action fails */
  onError?: (action: PivotAction, error: Error) => void;
}
```

### `PivotEngineRef`

The adapter interface `ActionExecutor` calls. Implement the methods your app supports — all are optional.

```ts
interface PivotEngineRef {
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
  /** Apply a style rule to matching rows or columns */
  applyStyle?: (
    target: 'row' | 'column',
    value: string,
    property: string,
    style: string
  ) => void;
  /** Remove all LLM-applied styles */
  resetStyle?: () => void;
}
```

### `PivotEngineInstance`

The structural type `LLMAssistant` expects your PivotEngine to satisfy.

```ts
interface PivotEngineInstance {
  getState(): {
    rawData?: Record<string, unknown>[];
    sortConfig?: unknown;
    groupConfig?: { rowFields?: string[]; columnFields?: string[] };
    filters?: unknown;
  };
  applyFilters(filters: FilterConfig[]): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  reset(): void;
  getFilterState?(): FilterConfig[];
}
```

### `PivotContext`

The context passed to the LLM system prompt on each query.

```ts
interface PivotContext {
  /** All field names, types, and optional distinct values */
  fields: FieldSchema[];
  /** Up to 5 raw rows for example context */
  sampleRows: Record<string, unknown>[];
  /** Top 10 aggregated pivot output rows */
  pivotOutput: Record<string, unknown>[];
  /** Current groupBy, sortBy, and active filters */
  currentState: PivotState;
}

interface FieldSchema {
  name: string;
  type: 'string' | 'number' | 'date';
  /** Distinct values for low-cardinality string fields (≤ 20 values) */
  values?: string[];
}

interface PivotState {
  groupBy?: string;
  sortBy?: string;
  filters?: Record<string, unknown>;
}
```

### `CapabilityReport`

```ts
interface CapabilityReport {
  /** Whether navigator.gpu is available */
  webgpu: boolean;
  /** Human-readable status message */
  message: string;
}
```

### `LoadProgress`

```ts
interface LoadProgress {
  /** 0 to 1 */
  progress: number;
  /** Status text from WebLLM */
  text: string;
  /** Current phase */
  stage: 'downloading' | 'initializing' | 'ready';
}
```

---

## Action types (`PivotAction`)

The LLM returns one of 15 action types. `LLMAssistant` handles all of them. If using `LLMEngine` + `ActionExecutor` directly, implement the relevant `PivotEngineRef` methods for the ones you want to support.

| Type           | Fields                                 | Description                                        |
| -------------- | -------------------------------------- | -------------------------------------------------- |
| `filter`       | `field`, `operator`, `value`           | Filter rows by field condition                     |
| `removeFilter` | `field`                                | Remove active filter on a field                    |
| `sort`         | `field`, `direction`                   | Sort by field ascending or descending              |
| `groupBy`      | `field`                                | Group rows by field                                |
| `topN`         | `n`, `measure`, `order`                | Show top N rows by measure                         |
| `aggregate`    | `field`, `func`                        | Compute aggregation (sum/avg/count/min/max)        |
| `resetAll`     | —                                      | Clear all filters and sorting                      |
| `export`       | `format`                               | Export data (csv/json/pdf)                         |
| `switchTab`    | `tab`                                  | Switch to "table" or "analytics" tab               |
| `chartType`    | `chartType`                            | Change the chart type                              |
| `style`        | `target`, `value`, `property`, `style` | Apply CSS styling to rows or columns               |
| `resetStyle`   | —                                      | Remove all LLM-applied styles                      |
| `answer`       | `text`                                 | LLM computed a text answer (e.g. aggregate result) |
| `clarify`      | `question`                             | LLM needs clarification from the user              |
| `error`        | `message`                              | Action could not be determined                     |

### `StyleAction` details

```ts
interface StyleAction {
  type: 'style';
  /** 'row' — entire row matching value; 'column' — header + all cells in that column */
  target: 'row' | 'column';
  /** Row value (e.g. "Australia") or column name (e.g. "Accessories") */
  value: string;
  /** CSS property */
  property:
    | 'backgroundColor'
    | 'color'
    | 'fontWeight'
    | 'fontStyle'
    | 'fontSize';
  /** CSS value — e.g. "red", "#ff0000", "bold", "italic", "14px" */
  style: string;
}
```

---

## Using `LLMEngine` + `ActionExecutor` directly

For full control over how actions are handled:

```ts
import {
  LLMEngine,
  ActionExecutor,
  ContextBuilder,
} from '@mindfiredigital/pivothead-llm';

const llm = new LLMEngine({
  onCapability: r => console.log(r.message),
});

await llm.load(p => console.log(`${Math.round(p.progress * 100)}%`));

const executor = new ActionExecutor({
  pivotEngine: {
    applyFilter: ({ field, operator, value }) =>
      engine.applyFilters([{ field, operator, value }]),
    removeFilter: field =>
      engine.applyFilters(
        engine.getFilterState().filter(f => f.field !== field)
      ),
    sortData: (field, dir) => engine.sort(field, dir),
    reset: () => engine.reset(),
    setAggregation: (field, func) => {
      // compute and display result in your UI
    },
    applyStyle: (target, value, property, style) => {
      // apply CSS to your table DOM
    },
    resetStyle: () => {
      // clear your applied styles
    },
  },
  onActionApplied: (action, result) => console.log('✓', result.description),
  onError: (action, err) => console.error(err.message),
});

// Build context before each query
const state = engine.getState();
llm.setContext(
  ContextBuilder.fromRawData(state.rawData ?? [], {
    groupConfig: state.groupConfig,
    sortConfig: state.sortConfig,
    filters: state.filters,
  })
);

const action = await llm.query('filter country equals France');
await executor.execute(action);
```

---

## Bundler notes

- **Do not** statically import `@mlc-ai/web-llm` in your code — the package handles it with a dynamic import to avoid SSR/build errors.
- No extra Vite, webpack, or Rollup config is needed.
- The package ships **ESM + CJS + `.d.ts`** — works in any modern bundler.

---

## Model

The default model is **Llama-3.2-3B-Instruct-q4f16_1-MLC** (~1.5 GB). Override it via the `model` option:

```ts
new LLMAssistant({
  engine,
  model: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', // smaller, faster
  onMessage: (role, text) => { ... },
});
```

Available model IDs are listed in the [WebLLM model library](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts).
