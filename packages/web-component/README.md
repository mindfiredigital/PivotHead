# PivotHead Headless Web Component

A headless web component implementation of PivotHead that provides core pivot table functionality without any UI opinions. This allows you to build your own UI while leveraging the powerful PivotHead engine.

## Installation

```bash
npm install @mindfiredigital/pivothead-web-component
```

## Core Concepts

This is a headless component, meaning it:

- Provides all data processing functionality
- Handles state management
- Emits state changes
- Leaves UI rendering completely up to you

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
  const yourUI = renderPivotTable(state);
  // Update your UI with the new state
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
