# PivotHead Developer Guide

This guide covers everything you need to set up, build, test, and work with the PivotHead monorepo locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Packages Overview](#packages-overview)
- [Build System](#build-system)
- [Running in Development Mode](#running-in-development-mode)
- [Running Tests](#running-tests)
- [Linting and Formatting](#linting-and-formatting)
- [Git Hooks and Commit Conventions](#git-hooks-and-commit-conventions)
- [Branching Strategy](#branching-strategy)
- [Working with Individual Packages](#working-with-individual-packages)
- [Working with Example Apps](#working-with-example-apps)
- [CI/CD Pipeline](#cicd-pipeline)
- [Versioning and Releases](#versioning-and-releases)
- [Architecture Overview](#architecture-overview)
- [Key Design Patterns](#key-design-patterns)
- [Performance Features](#performance-features)
- [Security Practices](#security-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool        | Version               | Install                                       |
| ----------- | --------------------- | --------------------------------------------- |
| **Node.js** | >= 20.x (recommended) | [nodejs.org](https://nodejs.org) or via `nvm` |
| **pnpm**    | 8.6.0                 | `npm install -g pnpm@8.6.0`                   |
| **Git**     | latest                | [git-scm.com](https://git-scm.com)            |

> **Note**: The project enforces pnpm via a `preinstall` script. Running `npm install` or `yarn install` will fail intentionally.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nickmflorin/pivothead.git
cd PivotHead
```

### 2. Install dependencies

```bash
pnpm install
```

This will:

- Install all dependencies across the monorepo (root + all packages + all examples)
- Set up Husky git hooks (pre-commit and commit-msg)
- Run any package-specific postinstall scripts (e.g., analytics library selection prompt)

### 3. Build all packages

```bash
pnpm build
```

This runs `turbo run build`, which builds all packages in dependency order:

1. `@mindfiredigital/pivothead` (core) — built first since others depend on it
2. `@mindfiredigital/pivothead-web-component` — depends on core
3. `@mindfiredigital/pivothead-react`, `@mindfiredigital/pivothead-vue`, `@mindfiredigital/pivothead-angular`, `@mindfiredigital/pivothead-analytics`, `@mindfiredigital/pivothead-llm` — depend on core and/or web-component
4. Example apps — depend on the packages above

### 4. Run tests

```bash
pnpm test
```

### 5. Verify linting

```bash
pnpm lint
```

If all three commands pass with zero errors, your local setup is complete.

---

## Repository Structure

```
PivotHead/
├── packages/                    # Library packages (publishable to npm)
│   ├── core/                    # Pivot engine — @mindfiredigital/pivothead
│   ├── web-component/           # Web Component — @mindfiredigital/pivothead-web-component
│   ├── react/                   # React adapter — @mindfiredigital/pivothead-react
│   ├── angular/                 # Angular adapter — @mindfiredigital/pivothead-angular
│   ├── vue/                     # Vue adapter — @mindfiredigital/pivothead-vue
│   ├── analytics/               # Chart engine — @mindfiredigital/pivothead-analytics
│   ├── llm/                     # LLM assistant — @mindfiredigital/pivothead-llm
│   └── tsconfig/                # Shared TypeScript configurations
│
├── examples/                    # Demo applications
│   ├── react-demo/              # React integration demo
│   ├── angular-demo/            # Angular integration demo
│   ├── vue-example/             # Vue 3 integration demo
│   ├── simple-js-demo/          # Vanilla JS with charts + LLM
│   ├── react-web-component-demo/# React + Web Component + charts
│   └── ...                      # Additional demos
│
├── docs/                        # Technical specifications
│   ├── FRS.md                   # Functional Requirements Spec
│   ├── SDS.md                   # System Design Spec
│   └── error-handling.md        # Error handling patterns
│
├── developer-docs/              # Developer documentation
│   ├── DEVELOPER_GUIDE.md       # This file
│   └── ERROR_HANDLING.md        # Error classes reference
│
├── documentation/               # Docusaurus site (auto-deployed to gh-pages)
│
├── openspec/                    # OpenSpec system for spec management
│   ├── specs/                   # Current system state (living source of truth)
│   ├── changes/                 # Active per-ticket proposals
│   └── archive/                 # Completed change audit trail
│
├── .github/
│   ├── workflows/
│   │   ├── release.yml          # Build + publish to npm
│   │   └── release-docs.yml     # Build + deploy Docusaurus to gh-pages
│   ├── changeset-version.js     # Custom changeset version script
│   └── changeset-autogenerate.mjs # Auto-generate changesets from commits
│
├── .husky/                      # Git hooks
│   ├── pre-commit               # Runs lint-staged
│   └── commit-msg               # Runs commitlint
│
├── turbo.json                   # Turborepo task configuration
├── eslint.config.mjs            # ESLint flat config (ESLint 9+)
├── .prettierrc                  # Prettier configuration
├── commitlint.config.cjs        # Commitlint rules
├── branchValidation.sh          # Branch name validation
├── CONTRIBUTING.md              # Contribution guidelines
├── AGENTS.md                    # Universal AI/developer context
└── CLAUDE.md                    # Claude Code-specific rules
```

---

## Packages Overview

### Core (`packages/core/`)

The pivot engine. Handles data processing, aggregation, sorting, filtering, pagination, export, and virtual scrolling. No UI — pure logic.

| Item                 | Detail                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **npm name**         | `@mindfiredigital/pivothead`                                                                                                                                                                                        |
| **Build tool**       | Vite (library mode) + AssemblyScript (WASM)                                                                                                                                                                         |
| **Output**           | `dist/pivothead-core.mjs` (ESM), `dist/pivothead-core.js` (CJS), `dist/index.d.ts`, `dist/wasm/csvParser.wasm`                                                                                                      |
| **Key source files** | `src/engine/pivotEngine.ts`, `src/engine/dataProcessor.ts`, `src/engine/aggregator.ts`, `src/engine/sorter.ts`, `src/engine/exportService.ts`, `src/engine/connectService.ts`, `src/engine/VirtualScrollManager.ts` |
| **Types**            | `src/types/interfaces.ts`                                                                                                                                                                                           |
| **WASM**             | `assembly/csvParser.ts` → compiled to `dist/wasm/csvParser.wasm`                                                                                                                                                    |
| **Workers**          | `src/workers/WorkerPool.ts`, `src/workers/csv-parser.worker.ts`, `src/workers/StreamingFileReader.ts`                                                                                                               |

### Web Component (`packages/web-component/`)

The `<pivot-head>` custom element. Bridges core engine to the DOM with Shadow DOM encapsulation.

| Item                 | Detail                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **npm name**         | `@mindfiredigital/pivothead-web-component`                                                                                                                                                                               |
| **Build tool**       | Rollup + TypeScript                                                                                                                                                                                                      |
| **Output**           | `dist/pivot-head.mjs` (ESM only)                                                                                                                                                                                         |
| **Main file**        | `src/pivot-head/pivotHead.ts`                                                                                                                                                                                            |
| **Internal modules** | `src/pivot-head/internal/` — `render.ts`, `ui.ts`, `engine.ts`, `pagination.ts`, `filters-refresh.ts`, `dnd-api.ts`, `io.ts`, `sanitize.ts`, `format.ts`, `attributes.ts`, `api-engine.ts`, `fieldservice.ts`, `host.ts` |

### React (`packages/react/`)

React wrapper component using `forwardRef` + `useImperativeHandle`.

| Item           | Detail                             |
| -------------- | ---------------------------------- |
| **npm name**   | `@mindfiredigital/pivothead-react` |
| **Build tool** | tsup                               |
| **Main file**  | `src/PivotHead.tsx`                |
| **Peer deps**  | `react >= 17`, `react-dom >= 17`   |

### Vue (`packages/vue/`)

Vue 3 `defineComponent` wrapper with composition API support.

| Item           | Detail                           |
| -------------- | -------------------------------- |
| **npm name**   | `@mindfiredigital/pivothead-vue` |
| **Build tool** | tsup                             |
| **Main file**  | `src/PivotHead.ts`               |
| **Peer deps**  | `vue >= 3.0.0`                   |

### Angular (`packages/angular/`)

Angular standalone component wrapper.

| Item           | Detail                                            |
| -------------- | ------------------------------------------------- |
| **npm name**   | `@mindfiredigital/pivothead-angular`              |
| **Build tool** | ng-packagr (v20)                                  |
| **Output**     | `../../dist/angular/` (special turbo output path) |
| **Main file**  | `src/lib/pivothead-wrapper.component.ts`          |
| **Peer deps**  | `@angular/core ^17 \|\| ^18 \|\| ^19 \|\| ^20`    |

### Analytics (`packages/analytics/`)

Chart rendering with multi-library support (Chart.js, ECharts, Plotly, D3).

| Item                 | Detail                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **npm name**         | `@mindfiredigital/pivothead-analytics`                                                                                                                                                                      |
| **Build tool**       | tsup                                                                                                                                                                                                        |
| **Key source files** | `src/core/ChartEngine.ts`, `src/ChartService.ts`, `src/renderers/` (4 renderers), `src/charts/` (chart type classes), `src/utils/` (DataSampler, ProgressiveRenderer, ColorPalettes, Formatters, Exporters) |

### LLM (`packages/llm/`)

In-browser LLM assistant using WebGPU via `@mlc-ai/web-llm`.

| Item                  | Detail                                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **npm name**          | `@mindfiredigital/pivothead-llm`                                                                                                         |
| **Build tool**        | tsup                                                                                                                                     |
| **Key source files**  | `src/LLMEngine.ts`, `src/LLMAssistant.ts`, `src/ModelManager.ts`, `src/PromptBuilder.ts`, `src/ActionParser.ts`, `src/ActionExecutor.ts` |
| **Supported actions** | 13 types: filter, sort, aggregate, groupBy, chartType, export, resetAll, topN, answer, clarify, style, switchTab, error                  |

---

## Build System

### Turborepo

All builds are orchestrated by Turborepo (`turbo.json`). Key behaviors:

- **Dependency ordering**: `"dependsOn": ["^build"]` ensures packages build after their workspace dependencies
- **Caching**: Build outputs (`dist/**`) are cached. Subsequent builds are instant if source hasn't changed
- **Parallelism**: Independent packages build in parallel

### Build commands

```bash
# Build everything
pnpm build

# Build a specific package
pnpm --filter @mindfiredigital/pivothead build
pnpm --filter @mindfiredigital/pivothead-web-component build
pnpm --filter @mindfiredigital/pivothead-react build
pnpm --filter @mindfiredigital/pivothead-vue build
pnpm --filter @mindfiredigital/pivothead-angular build
pnpm --filter @mindfiredigital/pivothead-analytics build
pnpm --filter @mindfiredigital/pivothead-llm build

# Build a specific example
pnpm --filter react-demo build
pnpm --filter angular-demo build
```

### Build tools per package

| Package       | Build Tool                           | Output Formats                          |
| ------------- | ------------------------------------ | --------------------------------------- |
| core          | Vite (library mode) + AssemblyScript | ESM + CJS + `.d.ts` + `.wasm`           |
| web-component | Rollup                               | ESM + `.d.ts`                           |
| react         | tsup                                 | ESM + CJS + `.d.ts`                     |
| vue           | tsup                                 | ESM + CJS + `.d.ts`                     |
| angular       | ng-packagr                           | Angular Package Format (FESM + `.d.ts`) |
| analytics     | tsup                                 | ESM + CJS + `.d.ts`                     |
| llm           | tsup                                 | ESM + CJS + `.d.ts`                     |

---

## Running in Development Mode

### Watch mode for all packages

```bash
pnpm dev
```

This starts all packages in watch mode (Turbo `persistent: true`). Changes to source files trigger automatic rebuilds.

### Watch mode for a specific package

```bash
pnpm --filter @mindfiredigital/pivothead dev
pnpm --filter @mindfiredigital/pivothead-web-component dev
pnpm --filter @mindfiredigital/pivothead-analytics dev
```

### Running example apps

Most example apps use Vite dev server:

```bash
# Simple JS demo (vanilla JS + charts + LLM)
cd examples/simple-js-demo
pnpm dev

# React demo
cd examples/react-demo
pnpm dev

# Vue demo
cd examples/vue-example
pnpm dev

# Angular demo
cd examples/angular-demo
pnpm start    # or: ng serve
```

> **Important**: Always run `pnpm build` from the root first so that the library packages are compiled before the example apps try to import them.

---

## Running Tests

### All tests

```bash
pnpm test
```

This runs `turbo run test`, which executes tests in all packages that have a `test` script. Tests depend on `^build` (packages must be built first).

### Package-specific tests

```bash
pnpm --filter @mindfiredigital/pivothead test
pnpm --filter @mindfiredigital/pivothead-web-component test
pnpm --filter @mindfiredigital/pivothead-analytics test
pnpm --filter @mindfiredigital/pivothead-llm test
pnpm --filter @mindfiredigital/pivothead-vue test
pnpm --filter @mindfiredigital/pivothead-angular test
```

### Watch mode

```bash
pnpm --filter @mindfiredigital/pivothead-web-component test:watch
pnpm --filter @mindfiredigital/pivothead-vue test:watch
```

### Test coverage (Vue package)

```bash
pnpm --filter @mindfiredigital/pivothead-vue test:coverage
```

### Test framework

All packages use **Vitest** with `jsdom` environment. Test files are located in:

- `packages/<name>/src/__test__/` or `packages/<name>/src/__tests__/`

### Test file naming

- `*.test.ts` or `*.spec.ts`

### Current test counts

| Package       | Test Files | Tests |
| ------------- | ---------- | ----- |
| core          | 11         | 88    |
| web-component | 4          | 75    |
| analytics     | 4          | 126   |
| llm           | 5          | 79    |
| angular       | 2          | 92    |
| vue           | 4          | —     |
| react         | 3          | —     |

---

## Linting and Formatting

### ESLint

```bash
# Lint all packages
pnpm lint

# Lint a specific package
pnpm --filter @mindfiredigital/pivothead lint
```

**Configuration** (`eslint.config.mjs`):

- ESLint 9 flat config with `@typescript-eslint`
- Ignores: `dist/`, `node_modules/`, `examples/`, `documentation/`, `.js/.mjs/.cjs` files
- Core package has relaxed rules (`no-explicit-any: warn`, `no-unused-vars: warn`) since it is stable and published

### Prettier

```bash
# Format all files
pnpm format
```

**Configuration** (`.prettierrc`):

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### lint-staged

On every commit, `lint-staged` (triggered by Husky pre-commit hook) automatically formats staged files:

- `**/*.{js,ts}` → `prettier --write`
- `**/*.json` → `prettier --write`
- `**/*.md` → `prettier --write`

---

## Git Hooks and Commit Conventions

### Husky hooks

| Hook           | File                | What it runs                                                   |
| -------------- | ------------------- | -------------------------------------------------------------- |
| **pre-commit** | `.husky/pre-commit` | `npx lint-staged` — formats staged files with Prettier         |
| **commit-msg** | `.husky/commit-msg` | `npx commitlint --edit "$1"` — validates commit message format |

### Commit message format

Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject
```

**Types**: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `test`, `perf`, `ci`

**Required scopes**: `core`, `react`, `web-component`, `angular`, `docs`, `release`, `vue`, `charts`, `llm`

**Examples**:

```bash
git commit -m "feat(core): add virtual scrolling support"
git commit -m "fix(web-component): resolve pagination off-by-one error"
git commit -m "chore(release): version packages"
git commit -m "test(analytics): add chart detector unit tests"
git commit -m "docs(vue): update integration guide"
```

**Breaking changes**:

```bash
git commit -m "feat(core)!: change PivotEngine constructor API

BREAKING CHANGE: Constructor now requires an options object instead of positional arguments."
```

### Version impact

| Commit type                                        | Version bump          |
| -------------------------------------------------- | --------------------- |
| `feat`                                             | MINOR (1.1.0 → 1.2.0) |
| `fix`, `perf`                                      | PATCH (1.1.1 → 1.1.2) |
| `feat!` / `BREAKING CHANGE`                        | MAJOR (1.0.0 → 2.0.0) |
| `docs`, `chore`, `style`, `refactor`, `test`, `ci` | No bump               |

---

## Branching Strategy

### Branch types

| Branch          | Purpose                                   |
| --------------- | ----------------------------------------- |
| `main`          | Production-ready code                     |
| `dev`           | Integration branch for features and fixes |
| `feature/*`     | New features                              |
| `bug/*`         | Bug fixes                                 |
| `hotfix/*`      | Critical production fixes                 |
| `fixes/*`       | General non-urgent fixes                  |
| `docs/*`        | Documentation changes                     |
| `enhancement/*` | Improvements                              |
| `patch/*`       | Maintenance tasks                         |

### Naming convention

```
<type>/<issue-id>-<description>
```

Examples:

```
feature/12345-add-virtual-scroll
bug/456-fix-pagination-offset
docs/789-update-api-reference
```

### Workflow

1. Branch from `dev`
2. Make changes, commit with conventional commits
3. Push to your fork
4. Open PR targeting `dev`
5. Get review and approval
6. Merge into `dev`
7. `dev` is periodically merged into `main` for releases

---

## Working with Individual Packages

### Adding a dependency to a package

```bash
# Add a runtime dependency
pnpm --filter @mindfiredigital/pivothead-analytics add chart.js

# Add a dev dependency
pnpm --filter @mindfiredigital/pivothead-react add -D @types/react

# Add a peer dependency (edit package.json manually)
```

### Creating a new package

1. Create `packages/<name>/` with:
   - `package.json` (name: `@mindfiredigital/pivothead-<name>`)
   - `tsconfig.json` (extend from `@mindfiredigital/pivothead-tsconfig`)
   - `src/index.ts` (public API entry point)
   - `src/types.ts` (type definitions)

2. Add the scope to `commitlint.config.cjs` → `scope-enum` array

3. Run `pnpm install` to link the workspace package

### Package dependency rules

- Framework adapters use **peer dependencies** for the host framework (React, Vue, Angular) — never bundle the host framework
- All packages depend on core via `workspace:*`
- All public exports must go through `src/index.ts` — nothing else is part of the public API
- Types are co-located in each package's `src/types.ts` — no duplication across packages

---

## Working with Example Apps

### Available examples

| Example                    | Framework         | Features shown                                                                                          |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| `react-demo`               | React             | Default + minimal modes, filtering, sorting, pagination, export                                         |
| `angular-demo`             | Angular 20        | 7 feature demos via routing (basic, drag-drop, export, events, file-import, modes, field-introspection) |
| `vue-example`              | Vue 3             | Composition API, minimal mode, drill-down, formatting                                                   |
| `simple-js-demo`           | Vanilla JS        | File upload, charts, LLM panel, WASM parsing, virtual scrolling                                         |
| `react-web-component-demo` | React + WC        | CSV upload, chart rendering, analytics tab                                                              |
| `vanilla-pivot-demo`       | Vanilla JS/HTML   | Basic pivot table usage                                                                                 |
| `node-server-demo`         | Node.js + Express | Server-side file upload and processing                                                                  |
| `analytics-demo`           | Vanilla JS        | Chart rendering showcase                                                                                |
| `pivothead-default-demo`   | Vanilla JS        | Default render mode                                                                                     |
| `pivothead-minimal-demo`   | Vanilla JS        | Minimal render mode                                                                                     |
| `pivothead-none-demo`      | Vanilla JS        | Headless (no UI) mode                                                                                   |

### Running an example

```bash
# 1. Build all packages first (examples depend on compiled packages)
pnpm build

# 2. Navigate to the example and start dev server
cd examples/simple-js-demo
pnpm dev
```

Most examples use Vite and start on `http://localhost:5173` (or next available port).

---

## CI/CD Pipeline

### Release workflow (`.github/workflows/release.yml`)

Triggered on push to `main` or manual dispatch:

1. Checkout repository (full history)
2. Setup Node.js 20 + pnpm
3. `pnpm install --no-frozen-lockfile`
4. `pnpm turbo run build` — build all packages
5. Auto-generate changesets from commit messages
6. **Changesets action**: Creates a "Release Pull Request" with version bumps OR publishes to npm if the release PR is merged

### Docs workflow (`.github/workflows/release-docs.yml`)

Triggered on push to `main` or manual dispatch:

1. Build Docusaurus site (`documentation/`)
2. Deploy build artifacts to `gh-pages` branch
3. GitHub Pages serves the documentation site

### Required secrets

| Secret         | Purpose                              |
| -------------- | ------------------------------------ |
| `NPM_TOKEN`    | Publish packages to npm              |
| `GITHUB_TOKEN` | Create release PRs, push to gh-pages |

---

## Versioning and Releases

PivotHead uses **Changesets** for automated versioning.

### How it works

1. Developers write commits with conventional commit messages
2. On push to `main`, CI auto-generates changesets from commit messages
3. Changesets action creates a "Release Pull Request" that bumps versions
4. When the release PR is merged, packages are published to npm

### Manual changeset creation

```bash
# Create a changeset interactively
pnpm changeset

# Version packages based on changesets
pnpm version-packages

# Publish to npm
pnpm release
```

### Current published versions

| Package                                    | Version            |
| ------------------------------------------ | ------------------ |
| `@mindfiredigital/pivothead`               | 1.18.0             |
| `@mindfiredigital/pivothead-web-component` | 1.0.12             |
| `@mindfiredigital/pivothead-react`         | 1.0.12             |
| `@mindfiredigital/pivothead-vue`           | 1.0.10             |
| `@mindfiredigital/pivothead-angular`       | 0.1.8 (private)    |
| `@mindfiredigital/pivothead-analytics`     | 1.0.7              |
| `@mindfiredigital/pivothead-llm`           | 0.0.0 (unreleased) |

---

## Architecture Overview

### Headless design

```
┌──────────────────────────────────────────────────────┐
│                    Core Engine                        │
│  (data processing, aggregation, sorting, filtering,  │
│   pagination, export, virtual scroll, WASM, workers) │
└────────────────────────┬─────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    Web Component    │
              │   (<pivot-head>)    │
              │  Shadow DOM + ARIA  │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
    │   React   │ │    Vue    │ │  Angular  │
    │  Adapter  │ │  Adapter  │ │  Adapter  │
    └───────────┘ └───────────┘ └───────────┘

    ┌─────────────────┐  ┌──────────────────┐
    │   Analytics     │  │       LLM        │
    │  (Chart Engine) │  │  (WebGPU + NLP)  │
    └─────────────────┘  └──────────────────┘
```

- **Core** is pure logic — no DOM, no framework dependencies
- **Web Component** bridges core to the DOM with Shadow DOM encapsulation
- **Framework adapters** wrap the web component using native framework patterns (never bundle the host framework)
- **Analytics** subscribes to the core engine and renders charts
- **LLM** accepts natural language queries and maps them to engine actions

### State flow

```
PivotEngine (Observable pattern)
    │
    ├── subscribe() → returns unsubscribe function
    ├── _emit() → notifies all listeners (with try-catch per listener)
    │
    ├── Web Component listens → updates DOM
    │   ├── React wrapper bridges CustomEvents → React callbacks
    │   ├── Vue wrapper uses watchers for synchronization
    │   └── Angular wrapper uses @Output() emitters
    │
    └── ChartEngine subscribes → auto-rerenders charts on state change
```

### Render modes

The web component supports 3 render modes:

| Mode      | Description                                             | Use case           |
| --------- | ------------------------------------------------------- | ------------------ |
| `default` | Full built-in UI (table, controls, pagination, filters) | Quick integration  |
| `minimal` | Slots for custom header/body — you build the UI         | Full customization |
| `none`    | No UI — API-only control                                | Headless operation |

---

## Key Design Patterns

### Observable pattern (Core)

```typescript
// packages/core/src/engine/pivotEngine.ts
private listeners: Set<(state: PivotTableState<T>) => void> = new Set();

public subscribe(fn: (state) => void): () => void {
  this.listeners.add(fn);
  return () => this.listeners.delete(fn);  // returns unsubscribe
}

private _emit(): void {
  this.listeners.forEach(fn => {
    try { fn(this.state); }
    catch (error) { logger.error('Error in subscriber:', error); }
  });
}
```

### Adapter pattern (Framework wrappers)

Each wrapper adapts the web component to framework-native patterns:

- **React**: `forwardRef` + `useImperativeHandle` + event bridging
- **Vue**: `defineComponent` with props/emits + watch-based sync
- **Angular**: Standalone component with `@Input`/`@Output` + `CUSTOM_ELEMENTS_SCHEMA`

### CustomEvent communication

```typescript
// Emitted by web component:
'stateChange'       → detail: PivotTableState
'paginationChange'  → detail: { currentPage, totalPages, pageSize }
'viewModeChange'    → detail: { mode: 'raw' | 'processed' }
'pivothead:switchTab' → cross-component tab switching
```

### Structured error hierarchy

```typescript
// packages/core/src/errors/ErrorHandler.ts
BaseError (message, code, statusCode, metadata)
  ├── ValidationError (code: 'VALIDATION_ERROR', status: 400)
  └── InternalError   (code: 'INTERNAL_ERROR', status: 500)
```

---

## Performance Features

### Multi-tier file processing

Files are routed to the optimal backend based on size (`packages/core/src/config/constants.ts`):

| File Size | Technology              | File                             |
| --------- | ----------------------- | -------------------------------- |
| < 1 MB    | Main thread JS          | `connectService.ts`              |
| 1–5 MB    | Web Workers (parallel)  | `workers/WorkerPool.ts`          |
| 5–8 MB    | Pure WASM               | `wasm/WasmCSVProcessor.ts`       |
| > 8 MB    | Streaming + WASM chunks | `workers/StreamingFileReader.ts` |

### WASM CSV parser

- AssemblyScript source: `packages/core/assembly/csvParser.ts`
- Compiled to: `dist/wasm/csvParser.wasm`
- Uses charcode comparisons (3-5x faster than string ops), two-pass parsing, manual number parsing

### Worker pool

- `packages/core/src/workers/WorkerPool.ts`
- Dynamic worker count: `navigator.hardwareConcurrency - 1`
- Workers created once and reused across file loads

### Virtual scrolling

- `packages/core/src/engine/VirtualScrollManager.ts`
- RAF-throttled scroll handling (60fps)
- Buffer zones above/below visible area
- GPU-accelerated positioning via `transform: translateY()`

### Chart optimization

- **Data sampling** (`packages/analytics/src/utils/DataSampler.ts`): LTTB algorithm reduces 10M+ points to 1000 while preserving visual shape
- **Progressive rendering** (`packages/analytics/src/utils/ProgressiveRenderer.ts`): Chunked async rendering prevents UI freezes
- **Lazy library loading**: Chart.js/ECharts/Plotly/D3 loaded on demand, not bundled

### React memoization

- `useMemo` for slot computation
- `useCallback` for event handlers
- Microtask-based pagination sync via `Promise.resolve().then()`

---

## Security Practices

### XSS prevention

- `packages/web-component/src/pivot-head/internal/sanitize.ts` — `escapeHtml()` escapes all 5 HTML metacharacters (`& < > " '`)
- Applied at 23 call sites in `render.ts` and 3 in `ui.ts` before every innerHTML interpolation
- Unit tested in `sanitize.test.ts`

### URL validation

- `packages/web-component/src/pivot-head/internal/io.ts` — validates URL protocol to HTTP/HTTPS only
- Prevents `javascript:`, `data:`, `file://` schemes

### Shadow DOM isolation

- Web component uses `attachShadow({ mode: 'open' })` for style and DOM isolation

### File import safety

- File size gating (max 1GB default)
- Extension validation
- `JSON.parse()` only — no `eval()`
- Record limits with `AbortController` to prevent memory exhaustion

### Dependency security

- `pnpm.overrides` in root `package.json` pins security-critical transitive dependencies (dompurify, serialize-javascript, qs, undici, lodash, etc.)

---

## Troubleshooting

### `pnpm install` fails with "only pnpm allowed"

The `preinstall` script enforces pnpm. Install it with:

```bash
npm install -g pnpm@8.6.0
```

### Angular build fails with TypeScript version error

```
The Angular Compiler requires TypeScript >=5.2.0 and <5.5.0 but X.X.X was found
```

Ensure `packages/angular/package.json` has `ng-packagr: ^20.3.2` and `typescript: ~5.8.0` in devDependencies. Run `pnpm install` after updating.

### WASM build fails with "Conversion from type 'f64' to 'i32'"

This is a known AssemblyScript compilation warning. The core build script uses `|| true` to continue even if WASM compilation fails. A pre-built `csvParser.wasm` is restored from `.temp-wasm/` during the Vite build step.

### Turbo cache stale

```bash
# Clear turbo cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Tests fail with "module not found"

Tests depend on packages being built first (`"dependsOn": ["^build"]` in turbo.json). Run:

```bash
pnpm build && pnpm test
```

### Commitlint rejects my commit

Ensure your message follows the format `type(scope): subject` with a valid scope. Valid scopes:
`core`, `react`, `web-component`, `angular`, `docs`, `release`, `vue`, `charts`, `llm`

### Example app shows blank page

1. Ensure all packages are built: `pnpm build` from root
2. Check the browser console for import errors
3. For WASM-dependent features, ensure `csvParser.wasm` exists in the example's `public/wasm/` directory
