# Implementation Plan — `@mindfiredigital/pivothead-llm`

## Strategy

Spec-driven development: implement each module in isolation, driven strictly by `spec.md`. Each module is independently testable. Build order follows dependency graph — types first, then leaf modules, then orchestrator.

---

## Phase 1 — Package Scaffolding

**Goal:** A valid pnpm workspace package that TypeScript can compile.

Steps:

1. Create `package.json` with correct name, deps, peer deps, build scripts
2. Create `tsconfig.json` with strict mode, ESNext target, Node16 module resolution
3. Create `tsup.config.ts` for ESM + CJS + `.d.ts` output
4. Create `src/index.ts` with placeholder export

Acceptance: `pnpm --filter @mindfiredigital/pivothead-llm build` succeeds (empty package).

---

## Phase 2 — Type Definitions (`types.ts`)

**Goal:** All interfaces and types in one file, no implementation.

Steps:

1. Define `LLMEngineOptions`, `CapabilityReport`, `LoadProgress`
2. Define `FieldSchema`, `PivotState`, `PivotContext`
3. Define 13 individual action interfaces
4. Define `PivotAction` as discriminated union of all 13

Acceptance: `types.ts` compiles with zero errors under strict mode.

---

## Phase 3 — Leaf Modules

**Goal:** Implement `ModelManager`, `PromptBuilder`, `ActionParser` independently.

### 3a — `ModelManager`

- `checkWebGPU()` reads `navigator.gpu`
- `load()` dynamically imports `@mlc-ai/web-llm`, creates engine, maps progress
- `unload()` calls engine's unload, resets state
- `isReady()` / `getEngine()` accessors

### 3b — `PromptBuilder`

- `build(context)` assembles the 6-section system prompt per spec
- Markdown table formatting for sample rows and pivot output
- Writes "none" for absent state fields

### 3c — `ActionParser`

- Regex-extracts first `{...}` block
- Validates `type` against 13-element set
- Returns typed `PivotAction` or `{ type: 'error', message }` on any failure

Acceptance: Each module compiles cleanly; behaviour matches spec section.

---

## Phase 4 — Orchestrator (`LLMEngine`)

**Goal:** Public API class wiring the three leaf modules.

Steps:

1. Constructor — instantiate leaf modules, store options, call `onCapability` synchronously
2. `load()` / `unload()` / `isReady()` — delegate to `ModelManager`
3. `setContext()` / `clearHistory()` — simple state management
4. `query()` — build messages, call engine, append history, parse result
5. `queryStream()` — same but stream: true, yield deltas, respect AbortSignal

Acceptance: Constructor works without a loaded model; `isReady()` returns `false`.

---

## Phase 5 — Action Executor (`ActionExecutor`)

**Goal:** Optional helper that maps `PivotAction` to engine calls.

Steps:

1. Define `PivotEngineRef` and `ChartEngineRef` interface shapes
2. Implement `execute()` switch with all 13 branches
3. Wrap every call in try/catch
4. Dispatch `CustomEvent` for `switchTab`
5. Call `onActionApplied` / `onError` callbacks

Acceptance: Compiles cleanly; `chartEngine` is truly optional.

---

## Phase 6 — Public Surface (`index.ts`)

**Goal:** Clean re-export of everything consumers need.

Steps:

1. `export { LLMEngine }` from `LLMEngine.ts`
2. `export { ActionExecutor }` from `ActionExecutor.ts`
3. `export type { ... }` all interfaces from `types.ts`
4. `export type { PivotEngineRef, ChartEngineRef, ActionExecutorOptions }` from `ActionExecutor.ts`

Acceptance: `import { LLMEngine, ActionExecutor } from '@mindfiredigital/pivothead-llm'` resolves all types.

---

## Phase 7 — Build Verification

Run: `pnpm --filter @mindfiredigital/pivothead-llm build`

Check:

- Zero TypeScript errors
- `dist/index.js` (ESM) exists
- `dist/index.cjs` (CJS) exists
- `dist/index.d.ts` (types) exists

---

## Dependency Graph

```
types.ts
   ↓
ModelManager.ts   PromptBuilder.ts   ActionParser.ts
         ↘              ↓              ↙
              LLMEngine.ts

types.ts → ActionExecutor.ts

LLMEngine.ts + ActionExecutor.ts → index.ts
```

---

## Out of Scope (for this package)

- Chat UI in `examples/simple-js-demo` — tracked separately
- Unit tests — tracked separately
- Any modification to `packages/core/`
