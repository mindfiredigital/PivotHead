# PivotHead Web Component

A flexible web component for PivotHead. It supports three rendering modes so you can choose how much UI the component provides:

- Default: built-in UI rendered by the component.
- Minimal: component provides shell/slots; you own the inner markup.
- None (headless): component renders nothing; you fully own the UI and just use its APIs/events.

## Installation

```bash
npm install @mindfiredigital/pivothead-web-component
```

## Core Concepts

- Provides all pivot processing, state, and events.
- You decide the rendering approach via the `mode` attribute: `default` | `minimal` | `none`.
- Interact through properties/attributes, methods, and events (see API below).

## Modes

### Default (full UI)

The component renders a complete UI (filters, pagination, table, etc.).

```html
<pivot-head
  data="[...]"
  options='{"rows":[...],"columns":[...],"measures":[...]}'
></pivot-head>
```

Notes:

- Omit `mode` or set `mode="default"`.
- Use events like `stateChange`, and methods like `sort`, `setPageSize` if needed.

### Minimal (slots-based shell)

The component renders a lightweight container with two slots you can fill:

```html
<pivot-head
  mode="minimal"
  data="[...]"
  options='{"rows":[...],"columns":[...],"measures":[...]}'
>
  <div slot="header">...your toolbar...</div>
  <div slot="body">...your table...</div>
</pivot-head>
```

Notes:

- You own the DOM inside `header` and `body` slots.
- Read state via `getState()` and listen to `stateChange` to re-render.
- Use exported helpers like `getGroupedData()`, `sort()`, pagination APIs, and export methods.

### None (headless)

The component renders no markup but exposes the full API and events.

```html
<pivot-head id="pivot" mode="none"></pivot-head>
<script type="module">
  const pivot = document.getElementById('pivot');
  pivot.data = yourData;
  pivot.options = yourOptions;
  pivot.addEventListener('stateChange', e => {
    const state = e.detail;
    // Render your own UI here from state
  });
  // Call APIs like pivot.sort(...), pivot.setPageSize(...), pivot.exportToPDF(...)
</script>
```

## Demos

Run any demo with Vite from its folder:

- `examples/pivothead-default-demo` – Default mode UI
  - cd examples/pivothead-default-demo && npx vite
- `examples/pivothead-minimal-demo` – Minimal mode with slots
  - cd examples/pivothead-minimal-demo && npx vite
- `examples/pivothead-none-demo` – Headless (mode="none") usage
  - cd examples/pivothead-none-demo && npx vite

Notes:

- In this monorepo the demos alias the local build: `packages/web-component/dist/pivot-head.js`.
- If using the published package outside the repo, install it and remove the alias in each demo’s `vite.config.js`.

## Usage

### Basic Usage with Custom Rendering

```javascript
import '@mindfiredigital/pivothead-web-component';

// Your custom rendering function
function renderPivotTable(state) {
  const { headers, rows, totals } = state.processedData;
  // Implement your own rendering logic
  // Return your custom UI elements
}

// Initialize the component
const pivot = document.createElement('pivot-head');
pivot.setAttribute('data', JSON.stringify(yourData));
pivot.setAttribute('options', JSON.stringify(yourOptions));

// Listen for state changes
pivot.addEventListener('stateChange', e => {
  const state = e.detail;
  renderPivotTable(state);
});
```

### React Example

```tsx
import { useEffect, useRef, useState } from 'react';
import '@mindfiredigital/pivothead-web-component';
import type { PivotTableState } from '@mindfiredigital/pivothead';

function YourPivotTable() {
  const pivotRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<PivotTableState<any>>();

  useEffect(() => {
    const pivot = pivotRef.current;
    if (pivot) {
      pivot.addEventListener('stateChange', (e: CustomEvent) => {
        setState(e.detail);
      });
    }
  }, []);

  // Your custom rendering logic
  const renderTable = () => {
    if (!state) return null;

    const { headers, rows, totals } = state.processedData;
    return (
      <table className="your-table-class">
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <pivot-head
        ref={pivotRef}
        data={JSON.stringify(yourData)}
        options={JSON.stringify(yourOptions)}
      />
      {renderTable()}
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <pivot-head
      ref="pivotRef"
      :data="JSON.stringify(data)"
      :options="JSON.stringify(options)"
      @stateChange="handleStateChange"
    />
    <!-- Your custom UI -->
    <table v-if="state">
      <thead>
        <tr>
          <th v-for="header in state.processedData.headers" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in state.processedData.rows" :key="i">
          <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import '@mindfiredigital/pivothead-web-component';

export default {
  name: 'PivotTable',
  data() {
    return {
      data: yourData,
      options: yourOptions,
      state: null,
    };
  },
  methods: {
    handleStateChange(e) {
      this.state = e.detail;
    },
  },
};
</script>
```

## API Reference

### Properties

| Property   | Type          | Description              |
| ---------- | ------------- | ------------------------ |
| data       | string (JSON) | The data to be processed |
| options    | string (JSON) | Configuration options    |
| filters    | string (JSON) | Filter configuration     |
| pagination | string (JSON) | Pagination configuration |

### Events

| Event       | Detail          | Description                                 |
| ----------- | --------------- | ------------------------------------------- |
| stateChange | PivotTableState | Emitted whenever the internal state changes |

### Methods

| Method                    | Description                   |
| ------------------------- | ----------------------------- |
| getState()                | Get current state             |
| refresh()                 | Reset and refresh the engine  |
| sort(field, direction)    | Sort data by field            |
| setMeasures(measures)     | Update measures               |
| setDimensions(dimensions) | Update dimensions             |
| setGroupConfig(config)    | Update grouping configuration |
| getFilters()              | Get current filters           |
| getPagination()           | Get pagination state          |
| getData()                 | Get raw data                  |
| getProcessedData()        | Get processed data            |

## State Interface

```typescript
interface PivotTableState<T> {
  data: T[];
  processedData: {
    headers: string[];
    rows: any[][];
    totals: Record<string, number>;
  };
  // ... other state properties
}
```

## Examples

### Custom Sorting

```javascript
const pivot = document.querySelector('pivot-head');
pivot.sort('Sales', 'desc');
```

### Custom Filtering

```javascript
const filters = [{ field: 'Category', operator: 'equals', value: 'Furniture' }];
pivot.setAttribute('filters', JSON.stringify(filters));
```

### Custom Pagination

```javascript
const pagination = {
  currentPage: 1,
  pageSize: 10,
};
pivot.setAttribute('pagination', JSON.stringify(pagination));
```

## TypeScript Support

The package includes TypeScript definitions for all APIs and events.
