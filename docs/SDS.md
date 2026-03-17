# Software Design Specification

Project: PivotHead Monorepo
Version: 1.0.0
Date: 2026-03-12

---

## 1. Overview

PivotHead is a headless, framework-agnostic pivot table library for the web. It is distributed as a monorepo of composable packages: a core engine, framework adapters (React, Angular, Vue, Web Component), an analytics/chart package, and an in-browser LLM assistant package.

---

## 2. Repository Structure

```
PivotHead/
├── packages/
│   ├── core/          — pivot engine (@mindfiredigital/pivothead)
│   ├── analytics/     — chart engine (@mindfiredigital/pivothead-analytics)
│   ├── react/         — React adapter
│   ├── angular/       — Angular adapter
│   ├── vue/           — Vue adapter
│   ├── web-component/ — Web Component adapter
│   ├── llm/           — In-browser LLM assistant (@mindfiredigital/pivothead-llm)
│   └── tsconfig/      — Shared TypeScript configurations
├── docs/
│   ├── FRS.md         — Functional Requirements Spec
│   ├── SDS.md         — Software Design Spec (this file)
│   └── decisions/     — Architecture Decision Records
├── openspec/          — Spec artifacts (current state, changes, archive)
├── .claude/           — AI tooling (commands + agents)
├── AGENTS.md          — Universal AI context
└── CLAUDE.md          — Claude Code-specific rules
```

---

## 3. Tech Stack

| Layer               | Technology                        | Version            |
| ------------------- | --------------------------------- | ------------------ |
| Language            | TypeScript                        | 5.x (strict mode)  |
| Package manager     | pnpm                              | workspace protocol |
| Build orchestration | Turborepo                         | latest             |
| Package build tool  | tsup                              | 7.x                |
| Output formats      | ESM + CJS + `.d.ts`               | per package        |
| LLM runtime         | @mlc-ai/web-llm                   | ^0.2.73            |
| Default LLM model   | Llama-3.2-3B-Instruct-q4f16_1-MLC | —                  |

---

## 4. Key Commands

```bash
pnpm build                                           # build all packages (Turborepo)
pnpm --filter @mindfiredigital/pivothead-llm build   # build llm package only
pnpm lint                                            # lint all packages
pnpm test                                            # run all tests
pnpm dev                                             # dev watch mode (all packages)
```

---

## 5. Architecture Patterns

### 5.1 Monorepo Package Pattern

Each package is independently buildable:

- Own `package.json`, `tsconfig.json`, `tsup.config.ts`
- Peer dependencies for host framework (never bundled)
- Direct dependencies only for what the package actually bundles
- All builds output to `dist/` with ESM + CJS + type declarations

### 5.2 LLM Package Architecture

```
types.ts
   ↓
ModelManager.ts   PromptBuilder.ts   ActionParser.ts
         ↘              ↓              ↙
              LLMEngine.ts  (main public API)

types.ts → ActionExecutor.ts  (optional helper)

LLMEngine.ts + ActionExecutor.ts → index.ts
```

- **`ModelManager`** — wraps `@mlc-ai/web-llm`; checks WebGPU, loads/unloads model
- **`PromptBuilder`** — converts `PivotContext` → system prompt string
- **`ActionParser`** — extracts typed `PivotAction` from raw LLM text output
- **`LLMEngine`** — main public class; orchestrates the three above + manages history
- **`ActionExecutor`** — optional helper; maps `PivotAction` → engine method calls

### 5.3 PivotAction Discriminated Union

All LLM responses are typed as a `PivotAction` — one of 13 action types:
`filter`, `removeFilter`, `sort`, `groupBy`, `topN`, `aggregate`, `resetAll`,
`export`, `switchTab`, `chartType`, `answer`, `clarify`, `error`

---

## 6. Type Contracts

### `LLMEngineOptions`

| Field          | Type                                 | Default                             |
| -------------- | ------------------------------------ | ----------------------------------- |
| `model`        | `string`                             | `Llama-3.2-3B-Instruct-q4f16_1-MLC` |
| `onCapability` | `(report: CapabilityReport) => void` | —                                   |
| `maxHistory`   | `number`                             | `10`                                |

### `PivotContext`

| Field          | Type                                 |
| -------------- | ------------------------------------ |
| `fields`       | `FieldSchema[]`                      |
| `sampleRows`   | `Record<string, unknown>[]` (max 5)  |
| `pivotOutput`  | `Record<string, unknown>[]` (top 10) |
| `currentState` | `PivotState`                         |

### `PivotState`

| Field     | Type                                 |
| --------- | ------------------------------------ |
| `groupBy` | `string` (optional)                  |
| `sortBy`  | `string` (optional)                  |
| `filters` | `Record<string, unknown>` (optional) |

---

## 7. API Design Conventions

- **No HTTP API** — this is a client-side library, no REST endpoints
- Public surface exported from `src/index.ts` only
- All public types exported as named exports (no default exports)
- Constructor options typed via `Options` interface (e.g. `LLMEngineOptions`)
- Error responses are typed `PivotAction` with `type: 'error'` — never raw throws after load

---

## 8. Coding Standards

- TypeScript strict mode on all files — no `any`, no `@ts-ignore`
- Dynamic import for `@mlc-ai/web-llm` in `ModelManager` (avoid bundling issues in SSR environments)
- No duplicated type definitions — all shared types live in `types.ts`
- Every `execute()` branch wrapped in try/catch; errors forwarded via `onError` callback
- No hardcoded model IDs outside `LLMEngineOptions` defaults

---

## 9. Testing Approach

- Framework: TBD (no tests implemented in v1.0 of `packages/llm`)
- Test command: `pnpm test`
- Test location: `packages/<name>/src/__test__/` (pattern from `packages/core`)
- Each spec scenario must have a corresponding test

---

## 10. Build Output Contract

Every package produces:
| File | Format |
|---|---|
| `dist/index.js` | ESM |
| `dist/index.cjs` | CommonJS |
| `dist/index.d.ts` | TypeScript declarations |

---

## 11. Do NOT Do

- Do not import from `packages/core/` directly — use the published `@mindfiredigital/pivothead` peer
- Do not add static imports of `@mlc-ai/web-llm` at module level (breaks SSR/non-WebGPU environments)
- Do not modify `packages/core/` — it is stable and published
- Do not add external dependencies not listed in `package.json`
- Do not duplicate type definitions across packages
- Do not skip TypeScript strict checks

---

## 12. Out of Scope (v1.0)

- Node.js / SSR LLM inference
- Cloud API fallback (OpenAI, Anthropic)
- Persistent chat history across sessions
- Voice / speech input
- Multi-language support
