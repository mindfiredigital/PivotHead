# OpenSpec — Project Context

## Project

PivotHead — a headless, framework-agnostic pivot table library for the web.

## Tech Stack

- Language: TypeScript 5.x (strict mode)
- Package manager: pnpm (workspaces)
- Build orchestration: Turborepo
- Package build tool: tsup (ESM + CJS + `.d.ts`)
- LLM runtime: @mlc-ai/web-llm (WebGPU, in-browser)

## Packages

| Package                                    | Path                      | Description              |
| ------------------------------------------ | ------------------------- | ------------------------ |
| `@mindfiredigital/pivothead`               | `packages/core/`          | Core pivot engine        |
| `@mindfiredigital/pivothead-analytics`     | `packages/analytics/`     | Chart engine             |
| `@mindfiredigital/pivothead-react`         | `packages/react/`         | React adapter            |
| `@mindfiredigital/pivothead-angular`       | `packages/angular/`       | Angular adapter          |
| `@mindfiredigital/pivothead-vue`           | `packages/vue/`           | Vue adapter              |
| `@mindfiredigital/pivothead-web-component` | `packages/web-component/` | Web Component adapter    |
| `@mindfiredigital/pivothead-llm`           | `packages/llm/`           | In-browser LLM assistant |

## Architectural Constraints

- Each package is independently buildable with its own tsup config
- Framework packages use peer dependencies — never bundle the host framework
- `packages/core/` is stable and published — do not modify it
- Dynamic import required for `@mlc-ai/web-llm` to avoid SSR bundling issues
- All LLM inference runs client-side — no server dependency

## Quality Standards

- TypeScript strict mode: no `any`, no `@ts-ignore`
- Build: zero TypeScript errors, zero warnings
- Every public API must be typed and exported from `src/index.ts`
- No duplicated type definitions across packages

## Key Documents

- `docs/FRS.md` — Functional Requirements Spec (business truth)
- `docs/SDS.md` — Software Design Spec (technical truth)
- `AGENTS.md` — Universal AI context
