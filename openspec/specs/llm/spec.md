# Specification — `@mindfiredigital/pivothead-llm`

> Source of truth for all implementation decisions. If code and spec conflict, fix the code.

---

## Package Identity

| Field          | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Name           | `@mindfiredigital/pivothead-llm`                                         |
| Location       | `packages/llm/`                                                          |
| Build tool     | `tsup`                                                                   |
| Output formats | ESM (`dist/index.js`), CJS (`dist/index.cjs`), Types (`dist/index.d.ts`) |
| TypeScript     | Strict mode enabled                                                      |

## Dependencies

| Package                                | Kind                     |
| -------------------------------------- | ------------------------ |
| `@mlc-ai/web-llm`                      | direct dependency        |
| `@mindfiredigital/pivothead`           | required peer dependency |
| `@mindfiredigital/pivothead-analytics` | optional peer dependency |
| `tsup`                                 | devDependency            |
| `typescript`                           | devDependency            |

---

## File Structure

```
packages/llm/
├── src/
│   ├── index.ts          — public re-exports only
│   ├── types.ts          — all interfaces/types, no implementation
│   ├── LLMEngine.ts      — main orchestrator class
│   ├── ModelManager.ts   — WebGPU check + model load/unload
│   ├── PromptBuilder.ts  — PivotContext → system prompt string
│   ├── ActionParser.ts   — raw LLM text → typed PivotAction
│   └── ActionExecutor.ts — PivotAction → engine method calls
├── CLAUDE.md
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Type Contracts (`types.ts`)

### `LLMEngineOptions`

| Field          | Type                                 | Required | Default                             | Description                         |
| -------------- | ------------------------------------ | -------- | ----------------------------------- | ----------------------------------- |
| `model`        | `string`                             | No       | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | WebLLM model ID                     |
| `onCapability` | `(report: CapabilityReport) => void` | No       | —                                   | Called synchronously in constructor |
| `maxHistory`   | `number`                             | No       | `10`                                | Max conversation turns to retain    |

### `CapabilityReport`

| Field     | Type      | Description                    |
| --------- | --------- | ------------------------------ |
| `webgpu`  | `boolean` | Whether `navigator.gpu` exists |
| `message` | `string`  | Human-readable status message  |

### `LoadProgress`

| Field      | Type                                         | Description              |
| ---------- | -------------------------------------------- | ------------------------ |
| `progress` | `number`                                     | 0 to 1                   |
| `text`     | `string`                                     | Status text from web-llm |
| `stage`    | `'downloading' \| 'initializing' \| 'ready'` | Current phase            |

### `FieldSchema`

| Field    | Type                             | Description                                                      |
| -------- | -------------------------------- | ---------------------------------------------------------------- |
| `name`   | `string`                         | Field name                                                       |
| `type`   | `'string' \| 'number' \| 'date'` | Inferred data type                                               |
| `values` | `string[]`                       | Optional. Distinct values for low-cardinality string fields only |

### `PivotState`

| Field     | Type                      | Description                             |
| --------- | ------------------------- | --------------------------------------- |
| `groupBy` | `string`                  | Optional. Active group-by field         |
| `sortBy`  | `string`                  | Optional. Active sort field             |
| `filters` | `Record<string, unknown>` | Optional. Active filters keyed by field |

### `PivotContext`

| Field          | Type                        | Description                                          |
| -------------- | --------------------------- | ---------------------------------------------------- |
| `fields`       | `FieldSchema[]`             | All field names, types, and optional distinct values |
| `sampleRows`   | `Record<string, unknown>[]` | Up to 5 raw rows from dataset                        |
| `pivotOutput`  | `Record<string, unknown>[]` | Top 10 rows from current aggregated pivot output     |
| `currentState` | `PivotState`                | Active filters, groupBy, sortBy                      |

### `PivotAction` — Discriminated Union (13 types)

| `type`         | Additional Fields                                            | Example Trigger                     |
| -------------- | ------------------------------------------------------------ | ----------------------------------- |
| `filter`       | `field: string`, `operator: string`, `value: unknown`        | "filter region to North"            |
| `removeFilter` | `field: string`                                              | "remove the region filter"          |
| `sort`         | `field: string`, `direction: 'asc'\|'desc'`                  | "sort by sales descending"          |
| `groupBy`      | `field: string`                                              | "group by quarter"                  |
| `topN`         | `n: number`, `measure: string`, `order: 'asc'\|'desc'`       | "show top 5 products by sales"      |
| `aggregate`    | `field: string`, `func: 'sum'\|'avg'\|'count'\|'min'\|'max'` | "change sales to average"           |
| `resetAll`     | —                                                            | "reset the table"                   |
| `export`       | `format: 'csv'\|'json'\|'pdf'`                               | "export as PDF"                     |
| `switchTab`    | `tab: string`                                                | "go to analytics tab"               |
| `chartType`    | `chartType: string`                                          | "show a pie chart"                  |
| `answer`       | `text: string`                                               | "which region has highest revenue?" |
| `clarify`      | `question: string`                                           | ambiguous query                     |
| `error`        | `message: string`                                            | unrecognised query                  |

---

## Behaviour Contracts

### `ModelManager`

- **`checkWebGPU()`** — Inspect `navigator.gpu`. Return `{ webgpu: true, message: 'WebGPU is available' }` if present, `{ webgpu: false, message: '...' }` otherwise.
- **`load(modelId, onProgress)`** — Throw `Error` with "WebGPU" in message if `navigator.gpu` absent. Otherwise call `CreateMLCEngine` from `@mlc-ai/web-llm` dynamically (avoid static import). Map init progress events to `LoadProgress` shape and forward to callback. Set `ready = true` after engine resolves.
- **`unload()`** — Call engine's `unload()` method if available. Reset `ready = false`, set engine to `null`.
- **`isReady()`** — Return `false` before `load()` resolves, `true` after.
- **`getEngine()`** — Return raw web-llm engine handle (typed as `unknown`, cast by callers).

### `PromptBuilder`

**`build(context: PivotContext): string`** — Returns a multi-section system prompt string.

Sections in order:

1. **Role declaration** — instruct model it is a pivot table assistant
2. **Fields** — one line per field with type and distinct values where available (`- fieldName [type] (values: ...)`)
3. **Current pivot state** — active groupBy, sortBy, filters (write `none` when absent)
4. **Sample data** — up to 5 rows as markdown table
5. **Pivot output** — top 10 aggregated rows as markdown table
6. **Instructions** — respond ONLY with JSON action object; no text outside JSON

### `ActionParser`

**`parse(rawText: string): PivotAction`**

1. Extract first `{...}` block from raw string via regex `\{[\s\S]*\}`
2. `JSON.parse` it
3. Validate `parsed.type` is one of the 13 known action types
4. Return the typed `PivotAction`
5. On any failure (no JSON, parse error, unknown type) return `{ type: 'error', message: '<descriptive reason>' }`

### `LLMEngine` — Constructor

- Instantiate `ModelManager`, `PromptBuilder`, `ActionParser`
- Store `model` (default `Llama-3.2-3B-Instruct-q4f16_1-MLC`) and `maxHistory` (default `10`)
- If `options.onCapability` provided, call it **synchronously** with `modelManager.checkWebGPU()` result

### `LLMEngine` — `query(userMessage)`

1. Throw if `modelManager.isReady()` is false
2. Build messages array: `[{ role: 'system', content: systemPrompt }, ...recentHistory, { role: 'user', content: userMessage }]`
3. System prompt from `PromptBuilder.build(context)` if context set, else minimal fallback
4. `recentHistory` = last `maxHistory × 2` entries from history
5. Call `engine.chat.completions.create({ messages, stream: false })`
6. Append user + assistant messages to history; trim to `maxHistory × 2`
7. Parse with `ActionParser` and return `PivotAction`

### `LLMEngine` — `queryStream(userMessage, signal?)`

1. Throw if not ready
2. Same message array construction as `query()`
3. Call with `stream: true`
4. `yield` each delta token
5. On `AbortSignal` abort, break loop and discard partial output
6. Append to history after stream completes

### `LLMEngine` — other methods

- **`setContext(context)`** — Store `PivotContext` for use in next query
- **`clearHistory()`** — Empty conversation history
- **`load(onProgress?)`** — Delegate to `modelManager.load()`
- **`unload()`** — Delegate to `modelManager.unload()`
- **`isReady()`** — Delegate to `modelManager.isReady()`

### `ActionExecutor`

**Constructor options:**

- `pivotEngine: PivotEngineRef` — required
- `chartEngine?: ChartEngineRef` — optional
- `onActionApplied?: (action, result) => void`
- `onError?: (action, error) => void`

**`execute(action: PivotAction): Promise<void>`**

Every branch wrapped in try/catch. On success call `onActionApplied(action, { success: true, description })`. On failure call `onError(action, error)`.

| Action         | Engine call                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| `filter`       | `pivotEngine.applyFilter({ field, operator, value })`                               |
| `removeFilter` | `pivotEngine.removeFilter(field)`                                                   |
| `sort`         | `pivotEngine.sortData(field, direction)`                                            |
| `groupBy`      | `pivotEngine.groupData(field)`                                                      |
| `topN`         | `pivotEngine.applyTopN(n, measure, order)`                                          |
| `aggregate`    | `pivotEngine.setAggregation(field, func)`                                           |
| `resetAll`     | `pivotEngine.reset()`                                                               |
| `export`       | `pivotEngine.export(format)`                                                        |
| `switchTab`    | `window.dispatchEvent(new CustomEvent('pivothead:switchTab', { detail: { tab } }))` |
| `chartType`    | `chartEngine?.updateChartType(chartType)` — no-op if no chartEngine                 |
| `answer`       | Call `onActionApplied` with answer text. No engine call                             |
| `clarify`      | Call `onActionApplied` with clarifying question. No engine call                     |
| `error`        | Call `onError` with `new Error(action.message)`                                     |

---

## Acceptance Criteria

- [ ] `pnpm --filter @mindfiredigital/pivothead-llm build` completes with zero TypeScript errors
- [ ] `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` are all generated
- [ ] `new LLMEngine()` can be constructed without loading — `isReady()` returns `false`
- [ ] `onCapability` fires synchronously at construction time
- [ ] `load()` throws with "WebGPU" in message when `navigator.gpu` is absent
- [ ] `ActionParser` correctly parses all 13 action types from valid JSON strings
- [ ] `ActionParser` returns error action for invalid JSON or unknown type values
- [ ] `PromptBuilder` output contains every field name and the pivot state from given context
