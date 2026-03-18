# PivotHead — Implementation Scope (Pending Work)

---

## FEATURE — `@mindfiredigital/pivothead-llm` (WebLLM / In-Browser)

### Package Location

`packages/llm/` — Create as a new pnpm workspace package.

### Package Config Requirements

- Name: `@mindfiredigital/pivothead-llm`
- Build output: ESM + CJS + `.d.ts` type declarations via `tsup`
- TypeScript strict mode enabled
- `@mlc-ai/web-llm` as a direct dependency
- `@mindfiredigital/pivothead` as a required peer dependency
- `@mindfiredigital/pivothead-analytics` as an optional peer dependency
- `tsup` and `typescript` as dev dependencies only
- Build command: `pnpm --filter @mindfiredigital/pivothead-llm build`

### File Structure

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

### Module Responsibilities

| File                | Responsibility                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`          | All TypeScript interfaces and types for the entire package. No implementation.                                                         |
| `ModelManager.ts`   | Wraps `@mlc-ai/web-llm`. Checks WebGPU, loads/unloads the model, fires progress events, exposes the raw engine handle.                 |
| `PromptBuilder.ts`  | Converts a `PivotContext` object into the system prompt string that is prepended to every LLM query.                                   |
| `ActionParser.ts`   | Extracts and validates the JSON object from raw LLM text output. Returns a typed `PivotAction` or an error action on failure.          |
| `LLMEngine.ts`      | Main public class. Orchestrates `ModelManager`, `PromptBuilder`, `ActionParser`. Manages conversation history. Exposes the public API. |
| `ActionExecutor.ts` | Optional helper. Takes a `PivotAction` and calls the matching method on `PivotEngine` or `ChartEngine`.                                |
| `index.ts`          | Re-exports `LLMEngine`, `ActionExecutor`, and all types as the public package surface.                                                 |

---

### Type Contracts (`types.ts`)

#### Engine Options

| Field          | Type                                 | Required | Description                                                      |
| -------------- | ------------------------------------ | -------- | ---------------------------------------------------------------- |
| `model`        | `string`                             | No       | WebLLM model ID. Defaults to `Llama-3.2-3B-Instruct-q4f16_1-MLC` |
| `onCapability` | `(report: CapabilityReport) => void` | No       | Called synchronously in constructor with WebGPU check result     |
| `maxHistory`   | `number`                             | No       | Max conversation turns to retain. Default `10`                   |

#### CapabilityReport

| Field     | Type      | Description                    |
| --------- | --------- | ------------------------------ |
| `webgpu`  | `boolean` | Whether `navigator.gpu` exists |
| `message` | `string`  | Human-readable status message  |

#### LoadProgress

| Field      | Type                                         | Description              |
| ---------- | -------------------------------------------- | ------------------------ |
| `progress` | `number`                                     | 0 to 1                   |
| `text`     | `string`                                     | Status text from web-llm |
| `stage`    | `'downloading' \| 'initializing' \| 'ready'` | Current phase            |

#### PivotContext

| Field          | Type                        | Description                                          |
| -------------- | --------------------------- | ---------------------------------------------------- |
| `fields`       | `FieldSchema[]`             | All field names, types, and optional distinct values |
| `sampleRows`   | `Record<string, unknown>[]` | Up to 5 raw rows from the dataset                    |
| `pivotOutput`  | `Record<string, unknown>[]` | Top 10 rows from current aggregated pivot output     |
| `currentState` | `PivotState`                | Active filters, groupBy, and sortBy                  |

#### FieldSchema

| Field    | Type                             | Description                                                      |
| -------- | -------------------------------- | ---------------------------------------------------------------- |
| `name`   | `string`                         | Field name                                                       |
| `type`   | `'string' \| 'number' \| 'date'` | Inferred data type                                               |
| `values` | `string[]`                       | Optional. Distinct values for low-cardinality string fields only |

#### PivotAction — Discriminated Union

| `type`         | Additional Fields                                    | Example Trigger                     |
| -------------- | ---------------------------------------------------- | ----------------------------------- |
| `filter`       | `field`, `operator`, `value`                         | "filter region to North"            |
| `removeFilter` | `field`                                              | "remove the region filter"          |
| `sort`         | `field`, `direction: 'asc'\|'desc'`                  | "sort by sales descending"          |
| `groupBy`      | `field`                                              | "group by quarter"                  |
| `topN`         | `n`, `measure`, `order: 'asc'\|'desc'`               | "show top 5 products by sales"      |
| `aggregate`    | `field`, `func: 'sum'\|'avg'\|'count'\|'min'\|'max'` | "change sales to average"           |
| `resetAll`     | —                                                    | "reset the table"                   |
| `export`       | `format: 'csv'\|'json'\|'pdf'`                       | "export as PDF"                     |
| `switchTab`    | `tab`                                                | "go to analytics tab"               |
| `chartType`    | `chartType`                                          | "show a pie chart"                  |
| `answer`       | `text`                                               | "which region has highest revenue?" |
| `clarify`      | `question`                                           | ambiguous query                     |
| `error`        | `message`                                            | unrecognised query                  |

---

### Behaviour Requirements

#### ModelManager

- On `checkWebGPU()`: inspect `navigator.gpu`. Return `{ webgpu: true }` if present, `{ webgpu: false, message: '...' }` otherwise
- On `load(callback)`: throw with a message containing "WebGPU" if `navigator.gpu` is absent. Otherwise call `CreateMLCEngine` from `@mlc-ai/web-llm`, mapping its init progress events to `LoadProgress` shape and forwarding to callback
- On `unload()`: call the web-llm engine's unload method if available. Reset ready state
- `isReady()` returns `false` before load and `true` after successful load

#### PromptBuilder

System prompt sections in order:

1. Role declaration — instruct the model it is a pivot table assistant
2. Fields — one line per field with type and distinct values where available
3. Current pivot state — active groupBy, sortBy, and filters (write "none" when absent)
4. Sample data — up to 5 rows as a markdown table
5. Pivot output — top 10 aggregated rows as a markdown table
6. Instructions — tell the model to respond ONLY with a JSON action object for modification queries, a JSON answer action for data questions, a clarify action for ambiguous queries, and an error action otherwise. No text outside the JSON

#### ActionParser

- Extract the first `{...}` block from the raw string
- `JSON.parse` it
- Validate that `parsed.type` is one of the 13 known action types
- Return the typed `PivotAction`
- On any failure (no JSON found, parse error, unknown type) return `{ type: 'error', message: '<descriptive reason>' }`

#### LLMEngine — query()

1. Throw if model is not ready
2. Build the messages array: system prompt from `PromptBuilder`, then the last `maxHistory × 2` messages from history, then the new user message
3. Call `engine.chat.completions.create` with `stream: false`
4. Append the user message and assistant response to history (trim to `maxHistory × 2`)
5. Parse the response with `ActionParser` and return the `PivotAction`

#### LLMEngine — queryStream()

1. Throw if model is not ready
2. Same message array construction as `query()`
3. Call `engine.chat.completions.create` with `stream: true`
4. Yield each delta token as it arrives
5. On `AbortSignal` abort, break the loop and discard partial output
6. Append to history after stream completes

#### ActionExecutor — execute()

Map each action type to an engine call:

| Action         | Engine call                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `filter`       | `pivotEngine.applyFilter({ field, operator, value })`                    |
| `removeFilter` | `pivotEngine.removeFilter(field)`                                        |
| `sort`         | `pivotEngine.sortData(field, direction)`                                 |
| `groupBy`      | `pivotEngine.groupData(field)`                                           |
| `topN`         | `pivotEngine.applyTopN(n, measure, order)`                               |
| `aggregate`    | `pivotEngine.setAggregation(field, func)`                                |
| `resetAll`     | `pivotEngine.reset()`                                                    |
| `export`       | `pivotEngine.export(format)`                                             |
| `switchTab`    | Dispatch `CustomEvent('pivothead:switchTab')` on `window` with `{ tab }` |
| `chartType`    | `chartEngine.updateChartType(chartType)` — no-op if no chartEngine       |
| `answer`       | Call `onActionApplied` with the answer text. No engine call              |
| `clarify`      | Call `onActionApplied` with the clarifying question. No engine call      |
| `error`        | Call `onError` with a new `Error(action.message)`                        |

Wrap every engine call in try/catch. On success call `onActionApplied(action, { success: true, description })`. On failure call `onError(action, error)`.

---

### Chat UI — `examples/simple-js-demo`

Modify `examples/simple-js-demo/index.html` and `examples/simple-js-demo/index.js`. Do not create new files.

#### UI Elements to Add

| Element          | Description                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Floating button  | Fixed bottom-right. Opens/closes the chat panel on click                                     |
| Chat panel       | 350px wide, slides up from bottom-right, `z-index` above table                               |
| Header           | Title "AI Assistant", Clear button, Close button                                             |
| Progress bar     | Shown only while model is loading. Hidden once model is ready                                |
| No-WebGPU notice | Replaces chat body if WebGPU is unavailable                                                  |
| Message area     | Scrollable. User messages on right, assistant messages on left, system confirmations centred |
| Input row        | Text input + Send button at panel bottom                                                     |

#### Behaviour

- On first panel open, start `llm.load()` and show the progress bar
- Before every query, call `llm.setContext()` with fresh context built from `pivotEngine.getConfig()` and `pivotEngine.getProcessedData()`
- For action-type responses, call `executor.execute(action)` and append a system confirmation message
- For `answer`-type responses, stream tokens into the assistant bubble using `llm.queryStream()`
- Clear button empties the message list and calls `llm.clearHistory()`
- The panel is independent of the Table and Analytics tabs — it does not affect tab state

---

### Acceptance Criteria

- `pnpm --filter @mindfiredigital/pivothead-llm build` completes with zero TypeScript errors
- `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` are all generated
- `new LLMEngine()` can be constructed without loading a model — `isReady()` returns `false`
- `onCapability` fires synchronously at construction time
- `load()` throws with "WebGPU" in the message when `navigator.gpu` is absent
- `ActionParser` correctly parses all 13 action types from valid JSON strings
- `ActionParser` returns an error action for invalid JSON or unknown type values
- `PromptBuilder` output contains every field name and the pivot state from the given context
- Chat panel appears in the demo and model loading progress is visible on first open
- Action queries update the table; answer queries stream into the chat bubble

---

## Constraints

- TypeScript strict mode on all new files
- Do not modify `packages/core/` — it is stable and published
- Do not modify any existing passing tests
- No new external dependencies beyond those explicitly listed per feature
