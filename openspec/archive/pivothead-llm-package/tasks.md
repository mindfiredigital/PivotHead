# Tasks — `@mindfiredigital/pivothead-llm`

Track implementation progress here. Mark each item `[x]` when done.

---

## Phase 1 — Package Scaffolding

- [x] Create `package.json` with name, deps, peer deps, scripts
- [x] Create `tsconfig.json` with strict mode + ESNext + Node16 module
- [x] Create `tsup.config.ts` for ESM + CJS + `.d.ts`
- [x] Create `src/index.ts` (initial re-export shell)

---

## Phase 2 — Type Definitions

- [x] Define `LLMEngineOptions`, `CapabilityReport`, `LoadProgress` in `types.ts`
- [x] Define `FieldSchema`, `PivotState`, `PivotContext` in `types.ts`
- [x] Define all 13 action interfaces in `types.ts`
- [x] Define `PivotAction` discriminated union in `types.ts`

---

## Phase 3 — Leaf Modules

### ModelManager

- [x] `checkWebGPU()` — inspects `navigator.gpu`, returns `CapabilityReport`
- [x] `load(modelId, onProgress)` — dynamic import of web-llm, maps progress events
- [x] `load()` throws with "WebGPU" in message when `navigator.gpu` absent
- [x] `unload()` — calls engine unload if available, resets state
- [x] `isReady()` — returns false before load, true after
- [x] `getEngine()` — returns raw engine handle

### PromptBuilder

- [x] Section 1: Role declaration
- [x] Section 2: Fields with type and optional distinct values
- [x] Section 3: Current pivot state (groupBy, sortBy, filters — "none" when absent)
- [x] Section 4: Sample data as markdown table (up to 5 rows)
- [x] Section 5: Pivot output as markdown table (top 10 rows)
- [x] Section 6: JSON-only response instructions

### ActionParser

- [x] Regex extraction of first `{...}` block
- [x] JSON.parse with try/catch
- [x] Validate `type` against 13-element set
- [x] Return typed `PivotAction` on success
- [x] Return `{ type: 'error', message }` on any failure

---

## Phase 4 — LLMEngine

- [x] Constructor instantiates leaf modules
- [x] Constructor calls `onCapability` synchronously if provided
- [x] `isReady()` delegates to ModelManager
- [x] `load()` delegates to ModelManager
- [x] `unload()` delegates to ModelManager
- [x] `setContext()` stores PivotContext
- [x] `clearHistory()` empties history array
- [x] `query()` — builds messages, calls engine, appends history, returns PivotAction
- [x] `query()` throws if not ready
- [x] `queryStream()` — streams deltas, respects AbortSignal, appends history on complete
- [x] `queryStream()` throws if not ready
- [x] History trimmed to `maxHistory × 2` entries

---

## Phase 5 — ActionExecutor

- [x] `PivotEngineRef` interface defined (all optional methods)
- [x] `ChartEngineRef` interface defined
- [x] `ActionExecutorOptions` interface defined
- [x] `execute()` — `filter` branch
- [x] `execute()` — `removeFilter` branch
- [x] `execute()` — `sort` branch
- [x] `execute()` — `groupBy` branch
- [x] `execute()` — `topN` branch
- [x] `execute()` — `aggregate` branch
- [x] `execute()` — `resetAll` branch
- [x] `execute()` — `export` branch
- [x] `execute()` — `switchTab` dispatches CustomEvent on window
- [x] `execute()` — `chartType` calls `chartEngine?.updateChartType()` (no-op if absent)
- [x] `execute()` — `answer` calls `onActionApplied` (no engine call)
- [x] `execute()` — `clarify` calls `onActionApplied` (no engine call)
- [x] `execute()` — `error` calls `onError` with new Error
- [x] All branches wrapped in try/catch

---

## Phase 6 — Public Surface

- [x] `index.ts` re-exports `LLMEngine`
- [x] `index.ts` re-exports `ActionExecutor`
- [x] `index.ts` re-exports all types from `types.ts`
- [x] `index.ts` re-exports `PivotEngineRef`, `ChartEngineRef`, `ActionExecutorOptions`

---

## Phase 7 — Build Verification

- [x] `pnpm --filter @mindfiredigital/pivothead-llm build` passes with zero errors
- [x] `dist/index.js` generated
- [x] `dist/index.cjs` generated
- [x] `dist/index.d.ts` generated

---

## Acceptance Criteria Checklist

- [x] `new LLMEngine()` constructs without error; `isReady()` returns `false`
- [x] `onCapability` fires synchronously at construction time
- [x] `load()` throws with "WebGPU" in message when `navigator.gpu` is absent
- [x] `ActionParser` parses all 13 action types from valid JSON strings
- [x] `ActionParser` returns error action for invalid JSON or unknown type
- [x] `PromptBuilder` output contains all field names and pivot state
