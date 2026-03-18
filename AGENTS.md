# AGENTS.md

## 1. Project Overview

PivotHead is a headless, framework-agnostic pivot table library for the web. It provides a core pivot engine, framework adapters (React, Angular, Vue, Web Component), a chart/analytics package, and an in-browser LLM assistant package that enables natural-language control of pivot tables via WebGPU — no server required.

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
│   ├── SDS.md         — Software Design Spec
│   └── decisions/     — Architecture Decision Records
├── openspec/
│   ├── project.md     — OpenSpec project context
│   ├── specs/         — Current system state (living source of truth)
│   ├── changes/       — Active per-ticket proposals
│   └── archive/       — Every completed change (audit trail)
├── .claude/
│   ├── commands/      — /start /spec /plan /tasks /implement /review /pr
│   └── agents/        — reviewer, test-writer
├── AGENTS.md          — This file (universal AI context)
└── CLAUDE.md          — Claude Code-specific rules
```

## 3. Tech Stack

| Layer               | Technology          | Version           |
| ------------------- | ------------------- | ----------------- |
| Language            | TypeScript          | 5.x (strict mode) |
| Package manager     | pnpm                | workspaces        |
| Build orchestration | Turborepo           | latest            |
| Package build tool  | tsup                | 7.x               |
| Output formats      | ESM + CJS + `.d.ts` | per package       |
| LLM runtime         | @mlc-ai/web-llm     | ^0.2.73           |

## 4. Key Commands

```bash
pnpm build                                           # build all packages
pnpm --filter @mindfiredigital/pivothead-llm build   # build one package
pnpm lint                                            # lint all
pnpm test                                            # run all tests
pnpm dev                                             # dev watch mode
```

## 5. Architecture Patterns

- **Monorepo**: each package is independently buildable with its own `package.json`, `tsconfig.json`, `tsup.config.ts`
- **Peer deps**: framework adapters use peer dependencies — never bundle the host framework
- **LLM package layering**: `types.ts` → leaf modules (`ModelManager`, `PromptBuilder`, `ActionParser`) → `LLMEngine` → `index.ts`
- **Dynamic import**: `@mlc-ai/web-llm` must be dynamically imported in `ModelManager` to avoid SSR bundling issues
- **Typed actions**: all LLM responses are `PivotAction` discriminated union (13 types)

## 6. Coding Standards

- TypeScript strict mode on all files — no `any`, no `@ts-ignore`
- All types defined in `types.ts` per package — no duplication across files
- All public exports from `src/index.ts` only — nothing else is part of the public API
- All `execute()` branches wrapped in try/catch; errors forwarded via callbacks
- No hardcoded values (model IDs, magic numbers) outside their designated defaults

## 7. Auth Approach

N/A — PivotHead is a client-side library. No authentication.

## 8. API Design Conventions

- No HTTP API — this is a library, not a service
- Constructor options typed as `XxxOptions` interface
- Error results are typed returns (`{ type: 'error', message }`) not raw throws — after initialization
- Streaming via `AsyncGenerator<string>` (LLM package)
- `CustomEvent` for cross-component communication (`pivothead:switchTab`)

## 9. DB Schema Summary

N/A — no database. All state is in-memory, session-scoped.

## 10. Testing Approach

- Framework: TBD (no tests in `packages/llm` v1.0)
- Test location: `packages/<name>/src/__test__/` (pattern from `packages/core`)
- Each spec scenario in `openspec/specs/` must have a corresponding test
- Run: `pnpm test`

## 11. Do NOT Do

- Do not import from `packages/core/` directly — use the `@mindfiredigital/pivothead` peer
- Do not add static top-level imports of `@mlc-ai/web-llm` (breaks SSR/non-WebGPU)
- Do not modify `packages/core/` — it is stable and published
- Do not add external dependencies not listed in the package's `package.json`
- Do not duplicate type definitions across packages
- Do not skip TypeScript strict checks
- Do not bundle the host framework into adapter packages

## 12. Shared Packages

`packages/tsconfig/` — shared TypeScript configuration base. All packages extend from it.

No `packages/shared/` exists — types and utilities are co-located in each package's `src/types.ts`.
