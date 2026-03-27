# @mindfiredigital/pivothead-llm

In-browser LLM integration for [PivotHead](https://github.com/mindfiredigital/PivotHead). Enables natural-language control of pivot tables entirely client-side — no server required.

Powered by [WebLLM](https://github.com/mlc-ai/web-llm) and WebGPU. Works in any modern Chromium-based browser that supports WebGPU.

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/pivothead-llm)](https://www.npmjs.com/package/@mindfiredigital/pivothead-llm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Requirements

- Browser with [WebGPU support](https://caniuse.com/webgpu) (Chrome 113+, Edge 113+)
- `@mindfiredigital/pivothead` (required peer dependency)
- `@mindfiredigital/pivothead-analytics` (optional peer dependency — enables chart actions)

---

## Installation

```bash
npm install @mindfiredigital/pivothead-llm
# peer dependency
npm install @mindfiredigital/pivothead
```

---

## Quick Start

```typescript
import { LLMEngine } from '@mindfiredigital/pivothead-llm';
import type { PivotContext } from '@mindfiredigital/pivothead-llm';

// 1. Create the engine (synchronous — no model loaded yet)
const engine = new LLMEngine({
  onCapability: report => {
    console.log('WebGPU available:', report.webgpu);
    console.log(report.message);
  },
});

// 2. Load the model (downloads ~2 GB on first run, cached by browser)
await engine.load(progress => {
  console.log(`${Math.round(progress.progress * 100)}% — ${progress.text}`);
});

// 3. Provide the pivot table context
const context: PivotContext = {
  fields: [
    { name: 'category', type: 'string', values: ['Electronics', 'Clothing'] },
    { name: 'sales', type: 'number' },
  ],
  sampleRows: [
    { category: 'Electronics', sales: 1500 },
    { category: 'Clothing', sales: 800 },
  ],
  pivotOutput: [{ category: 'Electronics', sales: 1500 }],
  currentState: { groupBy: 'category', sortBy: 'sales', filters: {} },
};

engine.setContext(context);

// 4. Query in natural language
const action = await engine.query('Sort by sales descending');
console.log(action);
// → { type: 'sort', field: 'sales', direction: 'desc' }
```

---

## Streaming Responses

```typescript
for await (const chunk of engine.queryStream(
  'Show top 5 products by revenue'
)) {
  process.stdout.write(chunk); // stream tokens as they arrive
}
```

Use an `AbortSignal` to cancel mid-stream:

```typescript
const controller = new AbortController();
for await (const chunk of engine.queryStream('...', controller.signal)) {
  // call controller.abort() to stop early
}
```

---

## Applying Actions with `ActionExecutor`

`ActionExecutor` maps parsed `PivotAction` objects to your pivot engine methods:

```typescript
import { LLMEngine, ActionExecutor } from '@mindfiredigital/pivothead-llm';

const executor = new ActionExecutor({
  pivotEngine: {
    applyFilter: opts => myPivotEngine.filter(opts),
    sortData: (field, dir) => myPivotEngine.sort(field, dir),
    groupData: field => myPivotEngine.groupBy(field),
    reset: () => myPivotEngine.reset(),
    export: format => myPivotEngine.export(format),
  },
  onActionApplied: (action, result) => {
    console.log('Applied:', result.description);
  },
  onError: (action, err) => {
    console.error('Failed:', err.message);
  },
});

const action = await engine.query('Filter category to Electronics');
await executor.execute(action);
```

---

## Supported Actions

| Action type    | Description                                      |
| -------------- | ------------------------------------------------ |
| `filter`       | Apply a field filter with operator and value     |
| `removeFilter` | Remove an existing filter on a field             |
| `sort`         | Sort by field ascending or descending            |
| `groupBy`      | Group rows by a field                            |
| `topN`         | Show top N rows by a measure                     |
| `aggregate`    | Set aggregation function (sum/avg/count/min/max) |
| `resetAll`     | Reset all filters, sorting, and grouping         |
| `export`       | Export table as CSV, JSON, or PDF                |
| `switchTab`    | Switch between table and analytics views         |
| `chartType`    | Change the active chart type                     |
| `style`        | Apply CSS styling to a row or column             |
| `resetStyle`   | Remove all LLM-applied styles                    |
| `answer`       | Text answer to a data question                   |
| `clarify`      | Request clarification from the user              |
| `error`        | Parsing or model error description               |

---

## API Reference

### `LLMEngine`

```typescript
new LLMEngine(options?: LLMEngineOptions)
```

| Option         | Type                                 | Default                             | Description                                  |
| -------------- | ------------------------------------ | ----------------------------------- | -------------------------------------------- |
| `model`        | `string`                             | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | WebLLM model ID                              |
| `onCapability` | `(report: CapabilityReport) => void` | —                                   | Fires synchronously with WebGPU availability |
| `maxHistory`   | `number`                             | `10`                                | Max conversation turns retained for context  |

| Method                              | Returns                  | Description                                     |
| ----------------------------------- | ------------------------ | ----------------------------------------------- |
| `isReady()`                         | `boolean`                | Whether the model is loaded and ready           |
| `load(onProgress?)`                 | `Promise<void>`          | Download and initialize the model               |
| `unload()`                          | `Promise<void>`          | Release model from GPU memory                   |
| `setContext(context)`               | `void`                   | Update pivot table context sent with each query |
| `clearHistory()`                    | `void`                   | Reset the conversation history                  |
| `query(userMessage)`                | `Promise<PivotAction>`   | Send a message, receive a parsed action         |
| `queryStream(userMessage, signal?)` | `AsyncGenerator<string>` | Stream raw tokens; parse after stream completes |

---

## Build

```bash
pnpm --filter @mindfiredigital/pivothead-llm build
```

Output: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` (types)

---

## License

MIT — see [LICENSE](../../LICENSE)
