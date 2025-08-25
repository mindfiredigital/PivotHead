# PivotHead None Mode Demo

This example shows how to use `<pivot-head mode="none">` as a headless data/engine provider while you fully control the DOM and rendering.

- The component renders nothing in `mode="none"`.
- You can use its public API (filters, sort, pagination, export, drill-down, view mode, etc.).
- The example builds a simple UI and table using the component events and methods.

How to run

- Build the web component package first so `dist/pivot-head.js` exists.
- Start a dev server using _npx vite_ (e.g., Vite) in this folder and open `index.html`.

Key files

- `index.html`: host page, mounts `<pivot-head>` and your custom toolbar/table.
- `main.js`: wiring to the component API and custom rendering logic.
- `style.css`: example styles.
