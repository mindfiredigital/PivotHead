<div align="center">

# PivotHead Web Component

**Universal Pivot Tables for Any JavaScript Framework**

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/pivothead-web-component?color=brightgreen)](https://www.npmjs.com/package/@mindfiredigital/pivothead-web-component)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Web Components](https://img.shields.io/badge/Web_Components-Standard-29ABE2?logo=webcomponents.org)](https://www.webcomponents.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API](#-api-reference) • [Examples](#-examples) • [Support](#-support)

</div>

---

## Screenshots

<!-- <img width="951" alt="PivotHead Web Component - Interactive Pivot Table" src="https://github.com/user-attachments/assets/78de8bf8-7738-4917-88ce-7cf0a16da24b" /> -->

> ** Try it live**: Check out the [examples directory](../../examples) for working demos across different modes and frameworks

---

## ⚡ Features

<table>
<tr>
<td width="50%" valign="top">

### **Framework Agnostic**

- **Vanilla JavaScript** - Works anywhere
- **React** - Native wrapper available
- **Vue** - Full compatibility
- **Angular** - Drop-in component
- **Svelte** - Seamless integration
- **Any framework** - Standard web component

</td>
<td width="50%" valign="top">

### **WebAssembly Performance**

- Process **up to 1GB CSV files**
- **10x faster** than JavaScript
- **Automatic optimization**
- < 1MB: Standard processing
- 1-8MB: Web Workers parallelization
- 8MB+: WASM + streaming hybrid
- **Near-native performance**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### **Three Rendering Modes**

**Default Mode** - Full UI included

```html
<pivot-head data="..." options="..."> </pivot-head>
```

**Minimal Mode** - Customizable slots

```html
<pivot-head mode="minimal">
  <div slot="header">Custom toolbar</div>
  <div slot="body">Custom table</div>
</pivot-head>
```

**Headless Mode** - Full API control

```html
<pivot-head mode="none"></pivot-head>
<!-- Build your own UI -->
```

</td>
<td width="50%" valign="top">

### **Rich Data Features**

- Drag & drop fields
- Dynamic aggregations (sum, avg, count, min, max)
- Advanced filtering
- Multi-level grouping
- Export to PDF, Excel, HTML
- Conditional formatting
- Custom calculations
- Responsive design

</td>
</tr>
</table>

---

## Installation

```bash
# npm
npm install @mindfiredigital/pivothead-web-component

# yarn
yarn add @mindfiredigital/pivothead-web-component

# pnpm
pnpm add @mindfiredigital/pivothead-web-component

# CDN (for quick prototyping)
<script type="module" src="https://unpkg.com/@mindfiredigital/pivothead-web-component"></script>
```

### Browser Requirements

- Modern browsers with Web Components support (Chrome 54+, Firefox 63+, Safari 10.1+, Edge 79+)
- For older browsers, include the [Web Components polyfill](https://www.webcomponents.org/polyfills)

---

## Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>PivotHead Demo</title>
  </head>
  <body>
    <pivot-head id="myPivot"></pivot-head>

    <script type="module">
      import '@mindfiredigital/pivothead-web-component';

      const pivotTable = document.getElementById('myPivot');

      // Sample data
      const salesData = [
        { product: 'Laptop', region: 'North', sales: 5000, quarter: 'Q1' },
        { product: 'Phone', region: 'South', sales: 3000, quarter: 'Q1' },
        { product: 'Tablet', region: 'East', sales: 2000, quarter: 'Q2' },
        // ... more data
      ];

      // Configure the pivot
      const options = {
        rows: ['product'],
        columns: ['region'],
        values: ['sales'],
      };

      pivotTable.data = salesData;
      pivotTable.options = options;

      // Listen for events
      pivotTable.addEventListener('stateChange', e => {
        console.log('Pivot state changed:', e.detail);
      });
    </script>
  </body>
</html>
```

### React Integration

```tsx
import { useEffect, useRef } from 'react';
import '@mindfiredigital/pivothead-web-component';

export default function PivotDemo() {
  const pivotRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pivotRef.current) {
      pivotRef.current.data = salesData;
      pivotRef.current.options = {
        rows: ['product'],
        columns: ['region'],
        values: ['sales'],
      };
    }
  }, []);

  return <pivot-head ref={pivotRef}></pivot-head>;
}
```

> **Prefer React?** Use our official React wrapper: [`@mindfiredigital/pivothead-react`](../react)

### Vue Integration

```vue
<template>
  <pivot-head
    :data="salesData"
    :options="pivotOptions"
    @stateChange="handleStateChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import '@mindfiredigital/pivothead-web-component';

const salesData = ref([...]);
const pivotOptions = ref({
  rows: ['product'],
  columns: ['region'],
  values: ['sales']
});

const handleStateChange = (e) => {
  console.log('State:', e.detail);
};
</script>
```

### Angular Integration

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@mindfiredigital/pivothead-web-component';

@Component({
  selector: 'app-root',
  template: `<pivot-head
    [attr.data]="dataJson"
    [attr.options]="optionsJson"
  ></pivot-head>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  dataJson = JSON.stringify(salesData);
  optionsJson = JSON.stringify({
    rows: ['product'],
    columns: ['region'],
    values: ['sales'],
  });
}
```

---

## Rendering Modes Deep Dive

### 1️ Default Mode - Full UI Included

Perfect for rapid development with zero configuration.

```html
<pivot-head
  data='[{"product":"A","sales":100}]'
  options='{"rows":["product"],"values":["sales"]}'
></pivot-head>
```

**Includes:**

- Pre-built responsive UI
- Drag & drop interface
- Filtering controls
- Pagination
- Export buttons
- Sorting indicators

**Best for**: Admin panels, dashboards, internal tools, rapid prototyping

---

### Minimal Mode - Customizable Slots

You control the UI, we handle the data.

```html
<pivot-head mode="minimal" id="customPivot">
  <!-- Custom Header Slot -->
  <div slot="header" class="my-toolbar">
    <button onclick="document.getElementById('customPivot').exportToPDF()">
      Export PDF
    </button>
    <button onclick="document.getElementById('customPivot').exportToExcel()">
      Export Excel
    </button>
  </div>

  <!-- Custom Body Slot -->
  <div slot="body" id="tableContainer"></div>
</pivot-head>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';

  const pivot = document.getElementById('customPivot');

  pivot.addEventListener('stateChange', e => {
    const { headers, rows, totals } = e.detail.processedData;

    // Render your custom table
    const tableHTML = `
      <table class="my-custom-table">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              row => `
            <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    document.getElementById('tableContainer').innerHTML = tableHTML;
  });

  pivot.data = yourData;
  pivot.options = yourOptions;
</script>
```

**Best for**: Custom designs, branded applications, unique UX requirements

---

### Headless Mode - Complete Control

Zero UI, maximum flexibility. Build anything on top of the pivot engine.

```html
<pivot-head id="headless" mode="none"></pivot-head>

<div id="myCustomUI">
  <!-- Your completely custom UI here -->
</div>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';

  const pivot = document.getElementById('headless');

  pivot.addEventListener('stateChange', e => {
    const state = e.detail;

    // Build your custom visualization
    renderCustomChart(state.processedData);
    renderCustomFilters(state.filters);
    renderCustomStats(state.processedData.totals);
  });

  pivot.data = yourData;
  pivot.options = yourOptions;

  // Use the full API
  function handleSort(field) {
    pivot.sort(field, 'desc');
  }

  function handleExport() {
    pivot.exportToPDF('my-report');
  }
</script>
```

**Best for**: Custom visualizations, D3.js integrations, charting libraries, unique interfaces

---

## WebAssembly Power - Large File Processing

### Automatic Performance Optimization

```html
<input type="file" id="csvUpload" accept=".csv" />
<pivot-head id="pivot"></pivot-head>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';

  const pivot = document.getElementById('pivot');

  document.getElementById('csvUpload').addEventListener('change', async e => {
    const file = e.target.files[0];

    // Just pass the File object - automatic optimization!
    pivot.data = file;

    pivot.addEventListener('stateChange', e => {
      console.log('Performance mode:', e.detail.performanceMode);
      // Output: 'standard', 'workers', 'wasm', or 'streaming-wasm'
    });
  });
</script>
```

### Performance Breakdown

| File Size | Strategy         | Processing Time\* | Memory        |
| --------- | ---------------- | ----------------- | ------------- |
| < 1 MB    | JavaScript       | ~50ms             | Low           |
| 1-8 MB    | Web Workers      | ~200ms            | Medium        |
| 8-100 MB  | WASM (in-memory) | ~800ms            | Medium        |
| 100MB-1GB | WASM + Streaming | ~3-5s             | Low (chunked) |

**Key Benefits:**

- **Zero configuration** - Automatic mode selection
- **Smart memory management** - Chunked processing for large files
- **Real-time progress** - Built-in loading indicators
- **Fallback support** - Graceful degradation if WASM unavailable

---

## API Reference

### Properties / Attributes

| Property     | Type                               | Default     | Description                                   |
| ------------ | ---------------------------------- | ----------- | --------------------------------------------- |
| `mode`       | `'default' \| 'minimal' \| 'none'` | `'default'` | Rendering mode                                |
| `data`       | `Array \| File \| string`          | `[]`        | Data source (array, CSV File, or JSON string) |
| `options`    | `object \| string`                 | `{}`        | Pivot configuration                           |
| `filters`    | `object \| string`                 | `[]`        | Active filters                                |
| `pagination` | `object \| string`                 | `{}`        | Pagination settings                           |

### Methods

Access via JavaScript:

```javascript
const pivot = document.querySelector('pivot-head');

// State Management
pivot.getState()                    // Get current state
pivot.refresh()                     // Refresh the pivot table
pivot.getData()                     // Get raw data
pivot.getProcessedData()            // Get processed/grouped data

// Configuration
pivot.setMeasures([...])            // Update measures
pivot.setDimensions([...])          // Update dimensions
pivot.setGroupConfig({...})         // Update grouping
pivot.setLayout(rows, cols, vals)   // Set complete layout

// Data Manipulation
pivot.sort(field, direction)        // Sort by field ('asc' | 'desc')
pivot.filter(field, operator, val)  // Apply filter
pivot.clearFilters()                // Remove all filters

// Pagination
pivot.setPageSize(size)             // Set page size
pivot.goToPage(pageNum)             // Navigate to page
pivot.getPagination()               // Get pagination state

// Export
pivot.exportToPDF(fileName)         // Export to PDF
pivot.exportToExcel(fileName)       // Export to Excel
pivot.exportToHTML(fileName)        // Export to HTML

// File Operations (ConnectService)
await pivot.connectToLocalCSV()     // Open CSV file picker
await pivot.connectToLocalJSON()    // Open JSON file picker
await pivot.connectToLocalFile()    // Open file picker (any supported format)
```

### Events

| Event         | Detail Type                 | Description                                            |
| ------------- | --------------------------- | ------------------------------------------------------ |
| `stateChange` | `PivotTableState`           | Emitted on any state change (data, sort, filter, etc.) |
| `dataLoaded`  | `{ recordCount, fileSize }` | Emitted when file loading completes                    |
| `error`       | `{ message, code }`         | Emitted on errors                                      |

```javascript
pivot.addEventListener('stateChange', event => {
  const state = event.detail;
  console.log('Headers:', state.processedData.headers);
  console.log('Rows:', state.processedData.rows);
  console.log('Totals:', state.processedData.totals);
  console.log('Performance mode:', state.performanceMode);
});

pivot.addEventListener('dataLoaded', event => {
  console.log(`Loaded ${event.detail.recordCount} records`);
});
```

### TypeScript Types

```typescript
import type {
  PivotTableState,
  PivotTableOptions,
  FilterConfig,
  PaginationConfig,
} from '@mindfiredigital/pivothead';

interface PivotTableState<T> {
  data: T[];
  processedData: {
    headers: string[];
    rows: any[][];
    totals: Record<string, number>;
  };
  filters: FilterConfig[];
  pagination: PaginationConfig;
  performanceMode?: 'standard' | 'workers' | 'wasm' | 'streaming-wasm';
  // ... other properties
}
```

---

## Real-World Examples

### Example 1: Sales Dashboard

```html
<div class="dashboard">
  <h1>Sales Analytics</h1>

  <pivot-head id="salesPivot"></pivot-head>

  <div class="actions">
    <button onclick="exportReport()">Export Report</button>
    <button onclick="refreshData()">Refresh</button>
  </div>
</div>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';

  const pivot = document.getElementById('salesPivot');

  // Fetch data from API
  async function loadSalesData() {
    const response = await fetch('/api/sales/2024');
    const data = await response.json();

    pivot.data = data;
    pivot.options = {
      rows: ['region', 'product'],
      columns: ['quarter'],
      values: ['sales', 'profit'],
    };
  }

  function exportReport() {
    pivot.exportToPDF('sales-report-2024');
  }

  function refreshData() {
    loadSalesData();
  }

  loadSalesData();
</script>
```

### Example 2: Custom Themed Table

```html
<style>
  .branded-pivot {
    --pivot-primary-color: #007bff;
    --pivot-header-bg: #f8f9fa;
    --pivot-border-color: #dee2e6;
  }
</style>

<pivot-head class="branded-pivot" mode="minimal">
  <div slot="header" class="custom-toolbar">
    <h2>Company Analytics</h2>
    <div class="toolbar-actions">
      <select id="timeRange">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last year</option>
      </select>
    </div>
  </div>

  <div slot="body" id="tableBody"></div>
</pivot-head>
```

### Example 3: Real-Time Data Streaming

```html
<pivot-head id="livePivot"></pivot-head>

<script type="module">
  import '@mindfiredigital/pivothead-web-component';

  const pivot = document.getElementById('livePivot');
  let currentData = [];

  // Connect to WebSocket for real-time updates
  const ws = new WebSocket('wss://api.example.com/live-data');

  ws.onmessage = event => {
    const newRecord = JSON.parse(event.data);
    currentData.push(newRecord);

    // Update pivot with new data
    pivot.data = [...currentData];
  };

  pivot.options = {
    rows: ['category'],
    columns: ['status'],
    values: ['count'],
  };
</script>
```

---

## Customization & Theming

### CSS Custom Properties

```css
pivot-head {
  /* Colors */
  --pivot-primary-color: #4a90e2;
  --pivot-secondary-color: #6c757d;
  --pivot-background: #ffffff;
  --pivot-text-color: #212529;

  /* Typography */
  --pivot-font-family: 'Inter', sans-serif;
  --pivot-font-size: 14px;

  /* Spacing */
  --pivot-padding: 16px;
  --pivot-gap: 8px;

  /* Borders */
  --pivot-border-color: #dee2e6;
  --pivot-border-radius: 4px;

  /* Table */
  --pivot-header-bg: #f8f9fa;
  --pivot-row-hover-bg: #f1f3f5;
  --pivot-cell-padding: 8px 12px;
}
```

---

## Related Packages

Build pivot tables for any framework:

| Package                                          | Description             | NPM                                                                                                                         | Documentation                |
| ------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **[@mindfiredigital/pivothead](../core)**        | Core TypeScript engine  | [![npm](https://img.shields.io/npm/v/@mindfiredigital/pivothead)](https://www.npmjs.com/package/@mindfiredigital/pivothead) | [README](../core/README.md)  |
| **[@mindfiredigital/pivothead-react](../react)** | React wrapper component | -                                                                                                                           | [README](../react/README.md) |
| **[@mindfiredigital/pivothead-vue](../vue)**     | Vue wrapper             | -                                                                                                                           | Coming soon                  |

---

### Contributing

We welcome contributions! See our [Contributing Guide](../../CONTRIBUTING.md) to get started.

### Show Your Support

If PivotHead helps your project, please consider:

- ⭐ [Star the repository](https://github.com/mindfiredigital/PivotHead)

---

## Examples

Check out complete working examples in the repository:

| Example               | Description                                | Path                                                                |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| **Vanilla JS**        | Pure JavaScript implementation             | [simple-js-demo](../../examples/simple-js-demo)                     |
| **Default Mode**      | Full UI with all features                  | [pivothead-default-demo](../../examples/pivothead-default-demo)     |
| **Minimal Mode**      | Custom rendering with slots                | [pivothead-minimal-demo](../../examples/pivothead-minimal-demo)     |
| **Headless Mode**     | Complete control for custom visualizations | [pivothead-none-demo](../../examples/pivothead-none-demo)           |
| **React Integration** | Using web component in React               | [react-web-component-demo](../../examples/react-web-component-demo) |
| **Vue Integration**   | Using web component in Vue                 | [vue-example](../../examples/vue-example)                           |

### Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/mindfiredigital/PivotHead.git
cd PivotHead

# Navigate to an example (e.g., simple-js-demo)
cd examples/simple-js-demo

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## License

MIT © [Mindfiredigital](https://github.com/mindfiredigital)

---

<div align="center">

**Built with ❤️ by the [Mindfiredigital](https://www.mindfiredigital.com) team**

[GitHub](https://github.com/mindfiredigital/PivotHead) • [NPM](https://www.npmjs.com/package/@mindfiredigital/pivothead-web-component) • [Website](https://www.mindfiredigital.com)

</div>
