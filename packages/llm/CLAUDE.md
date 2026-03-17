# CLAUDE.md — `@mindfiredigital/pivothead-llm`

## Package Purpose

This package integrates in-browser LLM inference (via `@mlc-ai/web-llm`) with PivotHead's pivot engine and chart engine. It enables natural-language control of pivot tables entirely client-side — no server required.

## Spec-Driven Development

All implementation MUST conform to the spec. Before changing any module:

1. Read `openspec/specs/llm/spec.md` (current system state — source of truth)
2. Check completed work in `openspec/archive/pivothead-llm-package/tasks.md`
3. For new work, create a proposal under `openspec/changes/<ticket>/`

Do not add features, types, or behaviours that are not specified in the spec.

## Module Map

| File                    | Role                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| `src/types.ts`          | Interfaces and types only — no implementation code                       |
| `src/ModelManager.ts`   | WebGPU check + web-llm model loading/unloading                           |
| `src/PromptBuilder.ts`  | Converts `PivotContext` → system prompt string                           |
| `src/ActionParser.ts`   | Extracts and validates JSON `PivotAction` from raw LLM text              |
| `src/LLMEngine.ts`      | Main public class — orchestrates the above three + manages history       |
| `src/ActionExecutor.ts` | Optional helper — maps `PivotAction` → `pivotEngine`/`chartEngine` calls |
| `src/index.ts`          | Public surface — re-exports only                                         |

## Key Constraints

- TypeScript strict mode on all files
- `@mlc-ai/web-llm` is a **direct** dependency — import dynamically in `ModelManager` to avoid bundling issues
- `@mindfiredigital/pivothead` is a **required peer** dependency
- `@mindfiredigital/pivothead-analytics` is an **optional peer** dependency
- Do NOT import from `packages/core/` directly — use the published peer
- No external deps beyond those in `package.json`

## Build

```bash
pnpm --filter @mindfiredigital/pivothead-llm build
```

Output: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` (types)

## Acceptance Criteria (from spec.md)

- Build completes with zero TypeScript errors
- `new LLMEngine()` constructs without loading — `isReady()` returns `false`
- `onCapability` fires synchronously in constructor
- `load()` throws with "WebGPU" in message when `navigator.gpu` is absent
- `ActionParser` handles all 13 action types + returns error action on failure
- `PromptBuilder` output contains all field names and pivot state
