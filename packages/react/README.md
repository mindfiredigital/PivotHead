# PivotHead React Wrapper

A thin React wrapper around `@mindfiredigital/pivothead-web-component` for seamless use in React apps. Supports all three modes: **default**, **minimal**, and **none**.

---

## Modes Overview

### 1. Default Mode

- **What:** Out-of-the-box PivotHead UI with all built-in controls and features.
- **How:**
  - Use `<PivotHead mode="default" ... />`.
  - All UI (toolbar, filters, export, etc.) is managed by the web component.
- **Example:**
  ```tsx
  <PivotHead mode="default" data={data} options={options} />
  ```
- **Ref functions:**
  - Use `ref.current?.methods` to call imperative API (e.g., `setViewMode`, `showFormatPopup`, `exportToExcel`, etc.).

### 2. Minimal Mode

- **What:** Only the pivot table is rendered; you build your own toolbar, filters, and controls in React.
- **How:**
  - Use `<PivotHead mode="minimal" ... />`.
  - Pass custom React nodes to `headerSlot` and `bodySlot` props for custom toolbars/UI.
  - All state (sorting, DnD, filters, pagination, etc.) can be managed in React, or you can use the web component's API via ref.
- **Example:**
  ```tsx
  <PivotHead
    mode="minimal"
    data={data}
    options={options}
    headerSlot={<MyToolbar />}
    bodySlot={<MyCustomBody />}
    ref={ref}
  />
  ```
- **Ref functions:**
  - All imperative methods available (see below).
  - You can fully control view mode, filters, pagination, etc. from React.

### 3. None Mode

- **What:** Renders only the raw table, no UI or controls. For full custom rendering and logic.
- **How:**
  - Use `<PivotHead mode="none" ... />`.
  - You are responsible for all UI, state, and event handling.
- **Example:**
  ```tsx
  <PivotHead mode="none" data={data} options={options} ref={ref} />
  ```
- **Ref functions:**
  - Use all imperative methods to drive the table from React.

---

## Imperative API (via ref)

All modes expose a rich set of methods via `ref.current?.methods`:

- `getState()`, `refresh()`, `sort(field, dir)`, `setMeasures()`, `setDimensions()`, `setGroupConfig()`, `getFilters()`, `getPagination()`, `getData()`, `getProcessedData()`, `formatValue()`, `updateFieldFormatting()`, `getFieldAlignment()`, `showFormatPopup()`, `getGroupedData()`, `swapRows()`, `swapColumns()`, `previousPage()`, `nextPage()`, `setPageSize()`, `goToPage()`, `setViewMode()`, `getViewMode()`, `exportToHTML()`, `exportToPDF()`, `exportToExcel()`, `openPrintDialog()`

See [react-wrapper-example](../../examples/react-wrapper-example/) for real usage of all three modes, including:

- How to build your own toolbar and filters in React (minimal/none mode)
- How to use DnD, sorting, and drill-down with local or component state
- How to use the imperative API for advanced control

---

## Example Project

See [`examples/react-wrapper-example`](../../examples/react-wrapper-example/) for a full working demo.  
This example demonstrates all three modes (`default`, `minimal`, `none`) and shows how to use refs to call methods on the underlying web component.

**Example App structure:**

- `src/App.tsx`: Renders all three modes with shared config.
- `src/components/DefaultMode.tsx`, `MinimalMode.tsx`, `NoneMode.tsx`: Show how to use the wrapper in each mode.
- Uses React refs to access imperative methods (e.g., `setViewMode`, `showFormatPopup`, `exportToExcel`).

**To run the example:**

```sh
cd examples/react-wrapper-example
pnpm install
pnpm dev
```
