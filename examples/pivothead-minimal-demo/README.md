# PivotHead Minimal Mode Demo

This example uses the web component in minimal mode: `<pivot-head mode="minimal">`. The component exposes state, events, and methods while you own the DOM via slots (`header`, `body`). The demo wires filtering, pagination, sorting, drag & drop reordering, and drill‑down.

## Prerequisites

- Node 18+ (or compatible)
- Optional (monorepo): build local package once so `dist/pivot-head.js` exists
  - From repo root: `pnpm -C packages/web-component build`

## Run

From the repo root or this folder:

```bash
cd examples/pivothead-minimal-demo
npx vite
```

Then open the printed local URL (Vite will auto-open if configured).

## Files

- `index.html` – mounts `<pivot-head mode="minimal">`, provides `header` and `body` slots.
- `main.js` – connects toolbar actions to component APIs (filters, sort, pagination), renders table, DnD, drill‑down.
- `style.css` – basic styling.
- `vite.config.js` – aliases `@mindfiredigital/pivothead-web-component` to the local build: `../../packages/web-component/dist/pivot-head.js`.

## Using the published package instead of local alias

If you want to run this outside the monorepo:

1. Install the package: `npm i @mindfiredigital/pivothead-web-component`
2. Remove the `resolve.alias` section in `vite.config.js` (or point to `node_modules`).

## Minimal vs Default

- Minimal: you supply the markup via slots; use the component methods/events for behavior.
- Default: the component renders full UI for you.
