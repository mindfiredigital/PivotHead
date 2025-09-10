# @mindfiredigital/pivothead-vue

Vue wrapper for PivotHead web component, providing seamless integration with Vue 3 applications.

## Installation

```bash
npm install @mindfiredigital/pivothead-vue
```

## Installation Requirements

This package requires Vue 3.0.0 or higher and has peer dependencies:

```bash
npm install @mindfiredigital/pivothead-vue vue@^3.0.0
```

For web component support in older browsers, you may also need:

```bash
npm install @webcomponents/webcomponentsjs
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Use `Object.freeze()` on large data arrays to prevent unnecessary reactivity
- For large datasets, consider implementing virtual scrolling in minimal mode
- Use pagination to limit rendered rows for better performance
- Debounce filter operations when dealing with real-time data updates

## Usage

### Basic Usage

```vue
<template>
  <PivotHead
    :data="pivotData"
    :options="pivotOptions"
    @state-change="handleStateChange"
    @view-mode-change="handleViewModeChange"
    @pagination-change="handlePaginationChange"
  />
</template>

<script setup>
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotData = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'Los Angeles' },
  { name: 'Bob', age: 35, city: 'New York' },
  { name: 'Alice', age: 28, city: 'Los Angeles' },
];

const pivotOptions = {
  rows: [{ uniqueName: 'city', caption: 'City' }],
  columns: [{ uniqueName: 'age', caption: 'Age' }],
  measures: [
    { uniqueName: 'name', caption: 'Count of Names', aggregation: 'count' },
  ],
};

const handleStateChange = state => {
  console.log('State changed:', state);
};

const handleViewModeChange = data => {
  console.log('View mode changed:', data.mode);
};

const handlePaginationChange = pagination => {
  console.log('Pagination changed:', pagination);
};
</script>
```

### Modes

The Vue wrapper supports three modes:

#### Default Mode

Full-featured pivot table with all controls and UI elements.

```vue
<PivotHead mode="default" :data="data" :options="options" />
```

#### Minimal Mode

Customizable pivot table with header and body slots.

```vue
<PivotHead
  mode="minimal"
  :data="data"
  :options="options"
  :filters="filters"
  @state-change="handleStateChange"
  @view-mode-change="handleViewModeChange"
  @pagination-change="handlePaginationChange"
>
  <template #header>
    <div class="custom-toolbar">
      <select v-model="selectedField">
        <option value="country">Country</option>
        <option value="category">Category</option>
      </select>
      <input v-model="filterValue" placeholder="Filter value" />
      <button @click="applyFilter">Apply Filter</button>
      <button @click="toggleViewMode">Toggle View</button>
    </div>
  </template>
  <template #body>
    <div class="custom-table-container">
      <!-- Your custom table implementation -->
      <table v-if="pivotState">
        <!-- Custom table rendering based on pivot state -->
      </table>
    </div>
  </template>
</PivotHead>
```

#### None Mode

Headless pivot table for complete customization.

```vue
<PivotHead mode="none" :data="data" :options="options" />
```

### Template Refs

Access the underlying web component methods through template refs:

```vue
<template>
  <PivotHead ref="pivotRef" :data="data" :options="options" />
  <button @click="refreshData">Refresh</button>
</template>

<script setup>
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const pivotRef = ref();

const refreshData = () => {
  pivotRef.value?.refresh();
};
</script>
```

## Advanced Usage

### Working with Template Refs

```vue
<template>
  <PivotHead
    ref="pivotRef"
    :data="data"
    :options="options"
    @state-change="onStateChange"
  />
  <div class="controls">
    <button @click="exportData">Export to Excel</button>
    <button @click="refreshData">Refresh</button>
    <button @click="sortByField">Sort by Country</button>
    <button @click="toggleView">Toggle View Mode</button>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import {
  PivotHead,
  type PivotHeadMethods,
  type PivotTableState,
} from '@mindfiredigital/pivothead-vue';

const pivotRef: Ref<PivotHeadMethods | null> = ref(null);

const exportData = () => {
  pivotRef.value?.exportToExcel('my-pivot-data');
};

const refreshData = () => {
  pivotRef.value?.refresh();
};

const sortByField = () => {
  pivotRef.value?.sort('country', 'asc');
};

const toggleView = () => {
  const currentMode = pivotRef.value?.getViewMode();
  const newMode = currentMode === 'raw' ? 'processed' : 'raw';
  pivotRef.value?.setViewMode(newMode);
};

const onStateChange = (state: PivotTableState) => {
  console.log('Current state:', state);
  // Access raw data: state.rawData
  // Access processed data: state.processedData
};
</script>
```

### Custom Filtering

```vue
<template>
  <PivotHead
    :data="data"
    :options="options"
    :filters="activeFilters"
    @state-change="handleStateChange"
  />
  <div class="filter-controls">
    <select v-model="filterField">
      <option value="country">Country</option>
      <option value="category">Category</option>
    </select>
    <input v-model="filterValue" placeholder="Filter value" />
    <button @click="addFilter">Add Filter</button>
    <button @click="clearFilters">Clear All</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PivotHead } from '@mindfiredigital/pivothead-vue';

const activeFilters = ref([]);
const filterField = ref('country');
const filterValue = ref('');

const addFilter = () => {
  if (filterField.value && filterValue.value) {
    activeFilters.value.push({
      field: filterField.value,
      operator: 'equals',
      value: filterValue.value,
    });
    filterValue.value = '';
  }
};

const clearFilters = () => {
  activeFilters.value = [];
};
</script>
```

### Available Methods

The component exposes all web component methods through template refs:

- `getState()` - Get current pivot state
- `refresh()` - Refresh the pivot table
- `sort(field, direction)` - Sort by field
- `setMeasures(measures)` - Set measures
- `setDimensions(dimensions)` - Set dimensions
- `setGroupConfig(config)` - Set group configuration
- `getFilters()` - Get current filters
- `getPagination()` - Get pagination state
- `getData()` - Get raw data
- `getProcessedData()` - Get processed data
- `getFilteredData()` - Get filtered raw data
- `getFilteredAndProcessedData()` - Get filtered and processed data
- `formatValue(value, field)` - Format a value
- `updateFieldFormatting(field, format)` - Update field formatting
- `getFieldAlignment(field)` - Get field text alignment
- `showFormatPopup()` - Show formatting popup
- `swapRows(from, to)` - Swap row positions
- `swapColumns(from, to)` - Swap column positions
- `previousPage()` - Go to previous page
- `nextPage()` - Go to next page
- `setPageSize(size)` - Set page size
- `goToPage(page)` - Go to specific page
- `setViewMode(mode)` - Set view mode ('raw' or 'processed')
- `getViewMode()` - Get current view mode
- `exportToHTML(fileName)` - Export to HTML
- `exportToPDF(fileName)` - Export to PDF
- `exportToExcel(fileName)` - Export to Excel
- `openPrintDialog()` - Open print dialog

### Events

- `@state-change` - Emitted when pivot state changes
- `@view-mode-change` - Emitted when view mode changes
- `@pagination-change` - Emitted when pagination changes

## Props

| Prop         | Type                               | Default     | Description              |
| ------------ | ---------------------------------- | ----------- | ------------------------ |
| `mode`       | `'default' \| 'minimal' \| 'none'` | `'default'` | Display mode             |
| `data`       | `Array`                            | `undefined` | Pivot data               |
| `options`    | `Object`                           | `undefined` | Pivot configuration      |
| `filters`    | `Array`                            | `undefined` | Active filters           |
| `pagination` | `Object`                           | `undefined` | Pagination configuration |
| `class`      | `String`                           | `undefined` | CSS class                |
| `style`      | `Object \| String`                 | `undefined` | Inline styles            |

## Architecture

This Vue wrapper is built on top of the PivotHead web component, providing:

- **Vue 3 Reactivity**: Full integration with Vue's reactive system
- **TypeScript Support**: Complete type definitions for all APIs
- **Event Bridge**: Converts web component events to Vue events
- **Slot System**: Custom slot support for minimal mode
- **Template Refs**: Access to all underlying web component methods

### Dependencies

```
@mindfiredigital/pivothead-vue
├── @mindfiredigital/pivothead-web-component
    └── @mindfiredigital/pivothead (core engine)
```

The Vue wrapper serves as a bridge between Vue applications and the underlying web component, handling:

- Prop reactivity and deep watching
- Event emission and handling
- Vue-specific optimizations
- Type safety for Vue developers

## TypeScript Support

This package includes full TypeScript definitions for type-safe development.

```typescript
import type {
  PivotHeadProps,
  PivotDataRecord,
  PivotOptions,
  PaginationConfig,
  FilterConfig,
  FormatOptions,
  PivotTableState,
  PivotHeadMethods,
  PivotHeadMode,
} from '@mindfiredigital/pivothead-vue';

// Example usage with types
const data: PivotDataRecord[] = [
  { country: 'USA', sales: 1000, category: 'Electronics' },
];

const options: PivotOptions = {
  rows: [{ uniqueName: 'country', caption: 'Country' }],
  columns: [{ uniqueName: 'category', caption: 'Category' }],
  measures: [{ uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' }],
};
```
