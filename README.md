# PivotHead

PivotHead is a headlessPivot, powerful and flexible library for creating interactive pivot tables in JavaScript applications. It provides a core engine for data manipulation and, in the future, will be compatible with wrappers for React, Vue, Svelte, and Angular, making it easy to integrate into applications built with these frameworks.

<img width="951" alt="PivotTable" src="https://github.com/user-attachments/assets/78de8bf8-7738-4917-88ce-7cf0a16da24b" />

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [PivotEngine API](#pivotengine-api)
5. [Advanced Features](#advanced-features)
6. [Configuration](#configuration)
7. [Examples](#examples)

## Features

- Flexible data pivoting and aggregation
- Sorting capabilities
- Grouping data by multiple fields
- Column resizing
- Drag and drop for rows
- Conditional formatting
- Custom measures and formulas
- Responsive design
- Customizable styling
- React integration (Upcoming)
- Hide and show toolbar
- Export by pdf
- Provide local json file for pivoting

## Installation

To install PivotHead, use npm or yarn:

```bash
npm install @mindfiredigital/pivothead

```

## Basic Usage

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const data = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  // ... more data
];

const config = {
  data: data,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 2,
        locale: 'en-US',
      },
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
  },
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    quantity: {
      type: 'number',
      decimals: 2,
      locale: 'en-US',
    },
  },
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
      },
    },
    // ... more conditional formatting rules
  ],
  // Add initial sort configuration
  initialSort: [
    {
      field: 'sales',
      direction: 'desc',
      type: 'measure',
      aggregation: 'sum',
    },
  ],
};

const engine = new PivotEngine(config);

// Use the engine to render your pivot table
```

## PivotEngine API

The `PivotEngine` class is the core of the PivotHead library. Here are its key methods:

### Constructor

```typescript
constructor(config: PivotTableConfig<T>)
```

Creates a new instance of PivotEngine with the given configuration.

### State Management

#### getState()

```typescript
getState(): PivotTableState<T>

```

Example :-

- **getState(): PivotTableState**

  Returns the current state of the pivot table.

  ```javascript
  const state = engine.getState();
  console.log(state.data); // Logs the current data array
  console.log(state.sortConfig); // Logs the current sort configuration
  ```

Returns the current state of the pivot table.

#### reset()

Resets the pivot table to its initial state.

```typescript
reset();
```

Example :-

- **reset()**

  ```javascript
  engine.reset();
  const state = engine.getState();
  console.log(state); // Logs the initial state
  ```

Resets the pivot table to its initial state.

### Data Manipulation

#### setMeasures(measureFields: MeasureConfig[])

```typescript
setMeasures(measureFields: MeasureConfig[])
```

Sets the measures for the pivot table.

#### setDimensions(dimensionFields: Dimension[])

```typescript
setDimensions(dimensionFields: Dimension[])
```

Sets the dimensions for the pivot table.

#### setAggregation(type: AggregationType)

```typescript
setAggregation(type: AggregationType)
```

Sets the aggregation type for the pivot table.

### Formatting

#### formatValue(value: any, field: string): string

```typescript
formatValue(value: any, field: string): string
```

Formats a value based on the specified field's format configuration.

Example:

```javascript
const formattedValue = engine.formatValue(1000, 'sales');
console.log(formattedValue); // "$1,000.00"
```

### Sorting and Grouping

#### sort(field: string, direction: 'asc' | 'desc')

```typescript
sort(field: string, direction: 'asc' | 'desc')
```

Sorts the pivot table data.

Example:

```javascript
engine.sort('sales', 'asc');
```

#### setGroupConfig(groupConfig: GroupConfig | null)

```typescript
setGroupConfig(groupConfig: GroupConfig | null)
```

Sets the group configuration for the pivot table.

#### getGroupedData(): Group[]

```typescript
getGroupedData(): Group[]
```

Returns the grouped data.

### Row and Column Manipulation

#### resizeRow(index: number, height: number)

```typescript
resizeRow(index: number, height: number)
```

Resizes a specific row in the pivot table.

#### toggleRowExpansion(rowId: string)

```typescript
toggleRowExpansion(rowId: string)
```

Toggles the expansion state of a row.

#### isRowExpanded(rowId: string): boolean

```typescript
isRowExpanded(rowId: string): boolean
```

Checks if a specific row is expanded.

#### dragRow(fromIndex: number, toIndex: number)

```typescript
dragRow(fromIndex: number, toIndex: number)
```

Handles dragging a row to a new position.

#### dragColumn(fromIndex: number, toIndex: number)

```typescript
dragColumn(fromIndex: number, toIndex: number)
```

Handles dragging a column to a new position.

## Advanced Features

### Sorting

PivotHead supports sorting for measures and dimensions. You can configure initial sorting and handle sorting dynamically.

Example configuration:

```javascript
const config = {
  // ... other configuration options
  initialSort: [
    {
      field: 'sales',
      direction: 'desc',
      type: 'measure',
      aggregation: 'sum',
    },
  ],
  // ... other configuration options
};
```

To handle sorting dynamically, you can use the `sort` method:

```javascript
engine.sort('sales', 'asc');
```

### Formatting cells

PivotHead supports conditional formatting for cells like decimal values , currency symbol etc.

Example configuration:

```javascript
const config = {
  // ... other configuration options
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 4,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 2,
        locale: 'en-US',
      },
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 4,
      },
      formula: item => item.sales / item.quantity,
    },
  ],
  // ... other configuration options
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 4,
    },
    quantity: {
      type: 'number',
      // decimals: 2,
      // locale: 'en-US'
    },
    averageSale: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 4,
    },
  },
};
```

### Conditional Formatting

PivotHead supports conditional formatting, allowing you to apply custom styles to cells based on their values.

Example configuration:

```javascript
const config = {
  // ... other configuration options
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
      },
    },
    // ... more conditional formatting rules
  ],
};
```

### Custom Measures

You can define custom measures with specific formulas:

```javascript
const config = {
  // ... other configuration options
  measures: [
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity,
    },
  ],
};
```

## Toolbar visibility

Show hide the hide the visibility of tool using config.

```javascript
const config = {
  // ... other configuration options

  toolbar: <boolean>
  // ... other configuration options
};
```

## Configuration

The `PivotTableConfig` object allows you to customize various aspects of the pivot table:

```typescript
interface PivotTableConfig<T> {
  data: T[];
  rows: { uniqueName: string; caption: string }[];
  columns: { uniqueName: string; caption: string }[];
  measures: MeasureConfig[];
  dimensions: Dimension[];
  defaultAggregation?: AggregationType;
  isResponsive?: boolean;
  groupConfig?: GroupConfig;
  formatting?: Record<string, FormatConfig>;
  conditionalFormatting?: ConditionalFormattingRule[];
}
```

For detailed information on each configuration option, please refer to the source code and comments.

## Examples

To run the examples:

1. Clone the repository
2. Navigate to the `examples/vanilla-js-demo` folder
3. Install dependencies with `npm install` or `yarn install`
4. Build the project with `npm run build` or `yarn build`
5. Start the development server with `npm start` or `yarn start`
6. Open your browser and navigate to the local host address provided

These examples demonstrate various features of the PivotHead library, including:

- Basic pivot table setup
- Custom measures and formulas
- Grouping and aggregation
- Conditional formatting
- Drag and drop functionality
- Responsive design

For more detailed examples and usage scenarios, please refer to the example files in the repository.

## Contributing

We welcome contributions from the community. If you'd like to contribute to the `pivothead` npm package, please follow our [Contributing Guidelines](CONTRIBUTING.md).
<br>

## License

Copyright (c) Mindfire Digital llp. All rights reserved.

Licensed under the MIT license.

---

Explored WebLLM (@mlc-ai/web-llm) for in-browser  
 LLM inference using WebGPU/WebAssembly with no backend required 2. Package Architecture Design — Designed a new separate package  
 @mindfiredigital/pivothead-llm with core modules: LLMEngine, ModelManager,
PromptBuilder, and ActionParser 3. Action Schema Definition — Defined structured action types the LLM will
return (filter, sort, groupBy, topN, aggregate, export, switchTab, answer)
mapped to existing PivotEngine API calls 4. Package Scaffolding & Initial Implementation — Setting up packages/llm/
with package.json, tsconfig, tsup build config and implementing the base
LLMEngine class with model loading and query pipeline

---

---

# PivotHead — Implementation Scope (Pending Work)

---

## FEATURE 1 — Package `@mindfiredigital/pivothead-llm`

### 1.0 Scaffold

Create the following files. Do not create any other files.

```
packages/llm/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── LLMEngine.ts
│   ├── ModelManager.ts
│   ├── PromptBuilder.ts
│   ├── ActionParser.ts
│   └── ActionExecutor.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**`package.json`**

```json
{
  "name": "@mindfiredigital/pivothead-llm",
  "version": "1.0.0",
  "description": "In-browser AI assistant for PivotHead powered by WebLLM (WebGPU)",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@mlc-ai/web-llm": "^0.2.0"
  },
  "peerDependencies": {
    "@mindfiredigital/pivothead": ">=1.5.0",
    "@mindfiredigital/pivothead-analytics": ">=1.0.0"
  },
  "peerDependenciesMeta": {
    "@mindfiredigital/pivothead-analytics": { "optional": true }
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^8.0.0"
  }
}
```

**`tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
```

**`tsconfig.json`**

```json
{
  "extends": "../tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

---

### 1.1 `src/types.ts` — All TypeScript Interfaces

Define every type the package uses. No implementation here, types only.

```ts
// ----- Model loading -----

export interface LLMEngineOptions {
  /** Default: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' */
  model?: string;
  /** Called immediately on instantiation with WebGPU availability result */
  onCapability?: (report: CapabilityReport) => void;
  /** Max conversation turns to keep in history. Default: 10 */
  maxHistory?: number;
}

export interface CapabilityReport {
  webgpu: boolean;
  message: string;
}

export interface LoadProgress {
  /** 0–1 */
  progress: number;
  text: string;
  stage: 'downloading' | 'initializing' | 'ready';
}

// ----- Pivot context -----

export interface FieldSchema {
  name: string;
  type: 'string' | 'number' | 'date';
  /** Distinct values — only for low-cardinality string fields */
  values?: string[];
}

export interface PivotState {
  filters: Array<{ field: string; operator: string; value: unknown }>;
  groupBy?: string;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
}

export interface PivotContext {
  fields: FieldSchema[];
  /** Up to 5 raw rows from the dataset */
  sampleRows: Record<string, unknown>[];
  /** Top 10 rows from current aggregated pivot output */
  pivotOutput: Record<string, unknown>[];
  currentState: PivotState;
}

// ----- Actions (discriminated union) -----

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
  | ErrorAction;

// ----- Conversation -----

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ----- ActionExecutor -----

export interface ActionResult {
  success: boolean;
  description: string;
}

export interface ActionExecutorOptions {
  pivotEngine: unknown; // @mindfiredigital/pivothead PivotEngine instance
  chartEngine?: unknown; // @mindfiredigital/pivothead-analytics ChartEngine instance (optional)
  onActionApplied?: (action: PivotAction, result: ActionResult) => void;
  onError?: (action: PivotAction, error: Error) => void;
}
```

---

### 1.2 `src/ModelManager.ts` — WebLLM Wrapper

Responsibilities: check WebGPU, load model, unload, expose engine handle.

```ts
import type { LoadProgress, CapabilityReport } from './types.js';

export class ModelManager {
  private engine: unknown = null;
  private _ready = false;
  readonly model: string;

  constructor(model: string) {
    this.model = model;
  }

  /** Check navigator.gpu and return capability report */
  checkWebGPU(): CapabilityReport {
    // If navigator.gpu exists → { webgpu: true, message: 'WebGPU is supported' }
    // Else                    → { webgpu: false, message: 'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+' }
  }

  /**
   * Download and initialise the model.
   * Throws if WebGPU is unavailable.
   * Calls progressCallback throughout with { progress, text, stage }.
   * Sets this._ready = true and stores engine when done.
   */
  async load(progressCallback?: (p: LoadProgress) => void): Promise<void> {
    // 1. checkWebGPU() — throw descriptive Error if not supported
    // 2. import { CreateMLCEngine } from '@mlc-ai/web-llm'
    // 3. Call CreateMLCEngine(this.model, { initProgressCallback })
    //    mapping web-llm progress events to LoadProgress shape
    // 4. Set this.engine and this._ready = true
  }

  /** Release GPU memory */
  async unload(): Promise<void> {
    // Call (this.engine as any).unload() if available
    // Set this.engine = null, this._ready = false
  }

  isReady(): boolean {
    return this._ready;
  }

  /** Returns the raw web-llm engine for query calls */
  getEngine(): unknown {
    return this.engine;
  }
}
```

---

### 1.3 `src/PromptBuilder.ts` — System Prompt Construction

Responsibilities: given a `PivotContext`, produce the system prompt string injected before every query.

```ts
import type { PivotContext } from './types.js';

export class PromptBuilder {
  build(context: PivotContext): string {
    // Produce a string with these sections in order:
    //
    // 1. Role line:
    //    "You are a pivot table assistant. Answer questions or modify the table based on the data below."
    //
    // 2. Fields section — one line per field:
    //    "- <name> (<type>): <values joined by ', '>"    ← include values only if present
    //    "- <name> (<type>)"                             ← no values line for number/date
    //
    // 3. Current pivot state section:
    //    "Grouped by: <groupBy | 'none'>"
    //    "Sorted by: <field> <direction | 'none'>"
    //    "Active filters: <JSON array | 'none'>"
    //
    // 4. Sample data (up to 5 rows) as a markdown table
    //
    // 5. Current pivot output (top 10 rows) as a markdown table
    //
    // 6. Instruction block (append verbatim):
    //    """
    //    When the user asks to modify the table, respond ONLY with a valid JSON object matching one of the action types.
    //    When the user asks a question about the data, respond with: {"type":"answer","text":"<your answer>"}
    //    If the query is ambiguous, respond with: {"type":"clarify","question":"<your clarifying question>"}
    //    If the query cannot be understood, respond with: {"type":"error","message":"<reason>"}
    //    Do not include any text outside the JSON object.
    //    """
  }
}
```

---

### 1.4 `src/ActionParser.ts` — Parse LLM Output → PivotAction

Responsibilities: extract and validate the JSON object from raw LLM text output.

```ts
import type { PivotAction } from './types.js';

const VALID_TYPES = [
  'filter',
  'removeFilter',
  'sort',
  'groupBy',
  'topN',
  'aggregate',
  'resetAll',
  'export',
  'switchTab',
  'chartType',
  'answer',
  'clarify',
  'error',
] as const;

export class ActionParser {
  /**
   * Parse raw LLM string output into a PivotAction.
   *
   * Steps:
   * 1. Extract first {...} block from the string (regex: /\{[\s\S]*?\}/)
   * 2. JSON.parse it
   * 3. Validate that parsed.type is in VALID_TYPES
   * 4. Return the typed PivotAction
   *
   * On any failure (no JSON found, invalid JSON, unknown type):
   * → return { type: 'error', message: '<descriptive reason>' }
   */
  parse(raw: string): PivotAction {}
}
```

---

### 1.5 `src/LLMEngine.ts` — Main Public API

Responsibilities: orchestrate ModelManager + PromptBuilder + ActionParser, manage conversation history, expose public methods.

```ts
import type {
  LLMEngineOptions,
  PivotContext,
  PivotAction,
  LoadProgress,
  ConversationMessage,
} from './types.js';
import { ModelManager } from './ModelManager.js';
import { PromptBuilder } from './PromptBuilder.js';
import { ActionParser } from './ActionParser.js';

export class LLMEngine {
  private manager: ModelManager;
  private builder = new PromptBuilder();
  private parser = new ActionParser();
  private context: PivotContext | null = null;
  private history: ConversationMessage[] = [];
  private maxHistory: number;

  constructor(options: LLMEngineOptions = {}) {
    // 1. Set this.model = options.model ?? 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
    // 2. Set this.maxHistory = options.maxHistory ?? 10
    // 3. Create this.manager = new ModelManager(model)
    // 4. Run checkWebGPU() and call options.onCapability if provided
  }

  /** Download and initialise the model. Throws if WebGPU unavailable. */
  async load(progressCallback?: (p: LoadProgress) => void): Promise<void> {
    await this.manager.load(progressCallback);
  }

  /** Store the current pivot schema + state. Call after every data or state change. */
  setContext(context: PivotContext): void {
    this.context = context;
    this.clearHistory(); // context change = new conversation
  }

  /**
   * Send a natural language query. Returns a PivotAction.
   *
   * Steps:
   * 1. Throw if !this.manager.isReady()
   * 2. Build messages array:
   *    [{ role: 'system', content: this.builder.build(this.context) },
   *     ...this.history (last maxHistory * 2 messages),
   *     { role: 'user', content: text }]
   * 3. Call web-llm engine.chat.completions.create({ messages, stream: false })
   * 4. Extract assistant content string
   * 5. Append user + assistant messages to this.history (trim to maxHistory * 2)
   * 6. Parse with this.parser.parse(content) and return
   */
  async query(text: string): Promise<PivotAction> {}

  /**
   * Streaming version of query(). Yields tokens as they arrive.
   *
   * Steps:
   * 1. Throw if !this.manager.isReady()
   * 2. Build messages array (same as query())
   * 3. Call engine.chat.completions.create({ messages, stream: true })
   * 4. For each chunk, yield the delta content string
   * 5. After stream ends, append messages to history
   *
   * AbortSignal: if provided and aborted, break the loop and discard partial output.
   */
  async *queryStream(
    text: string,
    signal?: AbortSignal
  ): AsyncGenerator<string> {}

  /** Clear in-memory conversation history */
  clearHistory(): void {
    this.history = [];
  }

  /** Release GPU memory */
  async unload(): Promise<void> {
    await this.manager.unload();
  }

  /** Returns true if model is loaded and ready */
  isReady(): boolean {
    return this.manager.isReady();
  }
}
```

---

### 1.6 `src/ActionExecutor.ts` — PivotEngine / ChartEngine Wiring

Responsibilities: take a `PivotAction` and call the correct method on the provided engine instances.

```ts
import type {
  PivotAction,
  ActionExecutorOptions,
  ActionResult,
} from './types.js';

export class ActionExecutor {
  constructor(private options: ActionExecutorOptions) {}

  /**
   * Execute a PivotAction against the registered engines.
   *
   * Mapping (call the method on options.pivotEngine unless noted):
   *
   * filter        → pivotEngine.applyFilter({ field, operator, value })
   * removeFilter  → pivotEngine.removeFilter(field)
   * sort          → pivotEngine.sortData(field, direction)
   * groupBy       → pivotEngine.groupData(field)
   * topN          → pivotEngine.applyTopN(n, measure, order)
   * aggregate     → pivotEngine.setAggregation(field, func)
   * resetAll      → pivotEngine.reset()
   * export        → pivotEngine.export(format)
   * switchTab     → dispatch CustomEvent 'pivothead:switchTab' on window with { tab }
   * chartType     → options.chartEngine?.updateChartType(chartType)  (no-op if no chartEngine)
   * answer        → call onActionApplied with description = action.text (no engine call)
   * clarify       → call onActionApplied with description = action.question (no engine call)
   * error         → call onError with new Error(action.message)
   *
   * Wrap each call in try/catch:
   * - success → call onActionApplied(action, { success: true, description: humanReadable(action) })
   * - failure → call onError(action, error)
   */
  execute(action: PivotAction): void {}

  /** Produce a human-readable one-line description of any action */
  private humanReadable(action: PivotAction): string {
    // Examples:
    // filter       → "Filter <field> <operator> <value>"
    // sort         → "Sort by <field> <direction>"
    // topN         → "Top <n> by <measure> (<order>)"
    // groupBy      → "Group by <field>"
    // aggregate    → "<field> aggregation → <func>"
    // resetAll     → "Reset all filters and groupings"
    // export       → "Export as <format>"
    // switchTab    → "Switch to <tab> tab"
    // chartType    → "Chart type → <chartType>"
    // answer/clarify/error → the text/question/message field
  }
}
```

---

### 1.7 `src/index.ts` — Public Exports

```ts
export { LLMEngine } from './LLMEngine.js';
export { ActionExecutor } from './ActionExecutor.js';
export type {
  LLMEngineOptions,
  CapabilityReport,
  LoadProgress,
  PivotContext,
  FieldSchema,
  PivotState,
  PivotAction,
  ActionResult,
  ActionExecutorOptions,
  ConversationMessage,
  FilterAction,
  RemoveFilterAction,
  SortAction,
  GroupByAction,
  TopNAction,
  AggregateAction,
  ResetAllAction,
  ExportAction,
  SwitchTabAction,
  ChartTypeAction,
  AnswerAction,
  ClarifyAction,
  ErrorAction,
} from './types.js';
```

---

### 1.8 Acceptance Criteria

- `pnpm --filter @mindfiredigital/pivothead-llm build` completes with zero errors
- `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` are all generated
- `new LLMEngine()` can be instantiated without a model loaded — `isReady()` returns `false`
- `new LLMEngine({ onCapability })` fires `onCapability` synchronously in the constructor
- `load()` throws with message containing "WebGPU" when `navigator.gpu` is absent
- `ActionParser.parse('{"type":"filter","field":"region","operator":"equals","value":"North"}')` returns a `FilterAction`
- `ActionParser.parse('not json')` returns `{ type: 'error', message: ... }`
- `PromptBuilder.build(context)` returns a string containing every field name from the context

---

## FEATURE 2 — Chat UI in `examples/simple-js-demo`

> File to modify: `examples/simple-js-demo/index.html` and `examples/simple-js-demo/index.js`
> The LLM package (Feature 1) must be built before this can be wired up.

### 2.1 HTML — Add to `index.html` body

```html
<!-- Floating chat button -->
<button id="chat-toggle" aria-label="Open AI Assistant">💬</button>

<!-- Chat panel -->
<div id="chat-panel" class="chat-panel hidden">
  <div class="chat-header">
    <span>AI Assistant</span>
    <button id="chat-clear" title="Clear chat">Clear</button>
    <button id="chat-close" title="Close">✕</button>
  </div>

  <!-- Shown only while model is loading -->
  <div id="chat-loading" class="hidden">
    <div id="chat-progress-bar"><div id="chat-progress-fill"></div></div>
    <div id="chat-progress-text">Loading model…</div>
  </div>

  <!-- WebGPU not supported message — replaces chat body -->
  <div id="chat-no-webgpu" class="hidden">
    <p>
      WebGPU is not supported in this browser.<br />Please use Chrome 113+ or
      Edge 113+.
    </p>
  </div>

  <!-- Chat messages -->
  <div id="chat-messages"></div>

  <!-- Input row -->
  <div class="chat-input-row">
    <input
      id="chat-input"
      type="text"
      placeholder="Ask something…"
      autocomplete="off"
    />
    <button id="chat-send">Send</button>
  </div>
</div>
```

### 2.2 CSS — Add to existing stylesheet

```css
#chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  z-index: 1000;
  border: none;
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.chat-panel {
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: 350px;
  height: 520px;
  z-index: 1000;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.chat-panel.hidden {
  display: none;
}
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #4f46e5;
  color: #fff;
  gap: 8px;
}
.chat-header span {
  flex: 1;
  font-weight: 600;
}
.chat-header button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
}
#chat-progress-bar {
  height: 6px;
  background: #e5e7eb;
  margin: 12px 16px 4px;
  border-radius: 3px;
}
#chat-progress-fill {
  height: 100%;
  background: #4f46e5;
  border-radius: 3px;
  width: 0%;
  transition: width 0.3s;
}
#chat-progress-text {
  font-size: 12px;
  color: #6b7280;
  padding: 0 16px 12px;
}
#chat-no-webgpu {
  padding: 24px 16px;
  color: #b91c1c;
  font-size: 14px;
  text-align: center;
}
#chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chat-bubble {
  max-width: 82%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.45;
}
.chat-bubble.user {
  align-self: flex-end;
  background: #4f46e5;
  color: #fff;
  border-bottom-right-radius: 2px;
}
.chat-bubble.assistant {
  align-self: flex-start;
  background: #f3f4f6;
  color: #111;
  border-bottom-left-radius: 2px;
}
.chat-bubble.system {
  align-self: center;
  background: #d1fae5;
  color: #065f46;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
}
.chat-input-row {
  display: flex;
  padding: 10px 12px;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
}
#chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
#chat-send {
  padding: 8px 16px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
```

### 2.3 JavaScript — Add to `examples/simple-js-demo/index.js`

Add a `initChatPanel()` function with this logic:

```js
import { LLMEngine, ActionExecutor } from '@mindfiredigital/pivothead-llm';

async function initChatPanel() {
  const llm = new LLMEngine({
    onCapability(report) {
      if (!report.webgpu) {
        document.getElementById('chat-no-webgpu').classList.remove('hidden');
        document.getElementById('chat-messages').classList.add('hidden');
        document.getElementById('chat-input-row').classList.add('hidden');
      }
    },
  });

  const executor = new ActionExecutor({
    pivotEngine, // existing pivotEngine variable in the demo
    chartEngine, // existing chartEngine variable in the demo
    onActionApplied(action, result) {
      appendMessage('system', `✓ ${result.description}`);
    },
    onError(action, error) {
      appendMessage('system', `✗ ${error.message}`);
    },
  });

  let modelLoaded = false;

  // Open / close panel
  document.getElementById('chat-toggle').addEventListener('click', async () => {
    const panel = document.getElementById('chat-panel');
    panel.classList.toggle('hidden');

    if (!panel.classList.contains('hidden') && !modelLoaded) {
      document.getElementById('chat-loading').classList.remove('hidden');
      try {
        await llm.load(progress => {
          document.getElementById('chat-progress-fill').style.width =
            `${progress.progress * 100}%`;
          document.getElementById('chat-progress-text').textContent =
            progress.text;
        });
        modelLoaded = true;
      } catch (e) {
        appendMessage('system', e.message);
      } finally {
        document.getElementById('chat-loading').classList.add('hidden');
      }
    }
  });

  document.getElementById('chat-close').addEventListener('click', () => {
    document.getElementById('chat-panel').classList.add('hidden');
  });

  document.getElementById('chat-clear').addEventListener('click', () => {
    document.getElementById('chat-messages').innerHTML = '';
    llm.clearHistory();
  });

  // Send message
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !modelLoaded) return;
    input.value = '';
    appendMessage('user', text);

    // Update LLM context with latest pivot state before every query
    llm.setContext(buildLLMContext()); // see §2.4 below

    const action = await llm.query(text);

    if (action.type === 'answer') {
      // Stream the answer token by token into a new assistant bubble
      const bubble = appendMessage('assistant', '');
      for await (const token of llm.queryStream(action.text)) {
        bubble.textContent += token;
      }
    } else {
      executor.execute(action);
    }
  }

  document.getElementById('chat-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

function appendMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  const container = document.getElementById('chat-messages');
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

// Call on DOM ready
initChatPanel();
```

### 2.4 `buildLLMContext()` helper

Add this function in `index.js`. It reads the current state from the existing `pivotEngine` and formats it into a `PivotContext` object:

```js
function buildLLMContext() {
  const config = pivotEngine.getConfig(); // existing API
  const data = pivotEngine.getProcessedData(); // existing API — array of row objects

  // Infer field schemas from the first row
  const firstRow = data[0] ?? {};
  const fields = Object.keys(firstRow).map(name => {
    const sample = firstRow[name];
    const type =
      typeof sample === 'number'
        ? 'number'
        : !isNaN(Date.parse(sample))
          ? 'date'
          : 'string';
    // For string fields: collect distinct values (max 20)
    const values =
      type === 'string'
        ? [...new Set(data.map(r => r[name]).filter(Boolean))].slice(0, 20)
        : undefined;
    return { name, type, ...(values ? { values } : {}) };
  });

  return {
    fields,
    sampleRows: data.slice(0, 5),
    pivotOutput: data.slice(0, 10),
    currentState: {
      filters: config.filters ?? [],
      groupBy: config.groupBy,
      sortBy: config.sortBy,
    },
  };
}
```

### 2.5 Acceptance Criteria

- Chat button visible in bottom-right corner at all times
- Clicking the button opens the panel and begins model loading with visible progress bar
- After model is ready, user can type a query and receive a response
- Action queries (e.g. "sort by sales descending") update the table with a system confirmation message
- Answer queries (e.g. "which region has highest sales?") stream tokens into the assistant bubble
- "Clear" button wipes message history and resets conversation
- In a browser without WebGPU, the panel shows the no-WebGPU warning instead of the input

---

## FEATURE 3 — Analytics: Complete Remaining Renderers

> File: `packages/analytics/src/renderers/EChartsRenderer.ts`
> File: `packages/analytics/src/renderers/PlotlyRenderer.ts`
> File: `packages/analytics/src/renderers/D3Renderer.ts`
> These files exist as stubs. Implement the `render()` method in each.

### 3.1 EChartsRenderer

Map PivotHead chart types to ECharts `option` objects and call `chart.setOption(option)`.

| PivotHead type | ECharts type                                    |
| -------------- | ----------------------------------------------- |
| column         | bar (vertical)                                  |
| bar            | bar (horizontal, `yAxis: { type: 'category' }`) |
| line, area     | line (`areaStyle: {}` for area)                 |
| pie, doughnut  | pie (`radius: ['40%','70%']` for doughnut)      |
| scatter        | scatter                                         |
| heatmap        | heatmap with `visualMap`                        |
| treemap        | treemap                                         |
| sankey         | sankey                                          |
| funnel         | funnel                                          |
| stacked column | bar with `stack: 'total'`                       |
| combo          | mixed series types                              |
| histogram      | bar with `barCategoryGap: '0%'`                 |

### 3.2 PlotlyRenderer

Map PivotHead chart types to `Plotly.newPlot(container, data, layout)` calls.

| PivotHead type | Plotly trace type                             |
| -------------- | --------------------------------------------- |
| column         | `bar` with `orientation: 'v'`                 |
| bar            | `bar` with `orientation: 'h'`                 |
| line           | `scatter` with `mode: 'lines'`                |
| area           | `scatter` with `fill: 'tozeroy'`              |
| pie            | `pie`                                         |
| doughnut       | `pie` with `hole: 0.4`                        |
| scatter        | `scatter` with `mode: 'markers'`              |
| heatmap        | `heatmap`                                     |
| treemap        | `treemap`                                     |
| funnel         | `funnel`                                      |
| histogram      | `histogram`                                   |
| sankey         | `sankey`                                      |
| stacked column | multiple `bar` traces with `barmode: 'stack'` |
| combo          | mixed trace array                             |

### 3.3 D3Renderer

Each chart type is rendered by appending SVG elements to the container using D3 selections. Implement the following types at minimum:

- `column` — vertical bar chart with axes
- `bar` — horizontal bar chart with axes
- `line` — line chart with path and axes
- `pie` — pie chart using `d3.pie()` + `d3.arc()`
- `scatter` — scatter plot with circle marks and axes

### 3.4 Acceptance Criteria (all three renderers)

- Switching renderer via `ChartEngine` options re-renders the same data using the new library without errors
- All chart types listed in section 3.1–3.3 render without throwing
- Destroying a chart (`destroy()`) removes all DOM nodes added by the renderer

---

## FEATURE 4 — Tests

### 4.1 `packages/analytics` — Unit Tests

Create `packages/analytics/src/__tests__/ChartService.test.ts`

```ts
// Test: getBarData returns datasets with correct labels and values
// Test: getHeatmapData returns { rowLabels, colLabels, values }
// Test: getHistogramData returns { binLabels, binCounts } with correct bin count
// Test: getFunnelData returns stages sorted descending by value
// Test: getPieData returns labels + data arrays of equal length
```

Create `packages/analytics/src/__tests__/ChartJsRenderer.test.ts`

```ts
// Mock canvas via jsdom + mock Chart.js
// Test: render('heatmap') does NOT call new Chart() — uses canvas2d directly
// Test: render('funnel')  does NOT call new Chart() — uses canvas2d directly
// Test: render('column')  DOES call new Chart()
// Test: destroy() removes the Chart instance
```

### 4.2 `packages/llm` — Unit Tests

Create `packages/llm/src/__tests__/ActionParser.test.ts`

```ts
// Test: valid filter JSON → FilterAction
// Test: valid topN JSON  → TopNAction
// Test: invalid JSON     → ErrorAction
// Test: valid JSON but unknown type → ErrorAction
// Test: JSON embedded in surrounding text → still parsed correctly
```

Create `packages/llm/src/__tests__/PromptBuilder.test.ts`

```ts
// Test: output contains all field names from context
// Test: output contains distinct values for string fields
// Test: output contains 'none' when filters/groupBy/sortBy are empty
// Test: sample rows rendered as markdown table
```

Create `packages/llm/src/__tests__/ModelManager.test.ts`

```ts
// Mock navigator.gpu = undefined
// Test: checkWebGPU() returns { webgpu: false, message: ... }
// Test: load() throws with message containing 'WebGPU'

// Mock navigator.gpu = {}
// Test: checkWebGPU() returns { webgpu: true, message: ... }
```

### 4.3 Acceptance Criteria

- All tests pass with `pnpm --filter <package> test`
- Zero TypeScript errors in test files

---

## Constraints

- TypeScript strict mode on all new files
- No new external dependencies beyond those listed in each feature
- Do not modify any existing passing tests
- Do not modify `packages/core/` — it is stable and published
- Build command for the LLM package: `pnpm --filter @mindfiredigital/pivothead-llm build`
