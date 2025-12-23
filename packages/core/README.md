<div align="center">

# PivotHead Core

**Powerful TypeScript Pivot Table Engine for JavaScript Applications**

[![npm version](https://img.shields.io/npm/v/@mindfiredigital/pivothead?color=brightgreen)](https://www.npmjs.com/package/@mindfiredigital/pivothead)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mindfiredigital/PivotHead/pulls)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Examples](#-examples) • [Support](#-support)

</div>

---

## Screenshots

<img width="951" alt="PivotHead - Interactive Pivot Table" src="https://github.com/user-attachments/assets/78de8bf8-7738-4917-88ce-7cf0a16da24b" />

---

## Features

<table>
<tr>
<td width="33%" valign="top">

### ** Core Capabilities**

- Flexible data pivoting & aggregation
- Multi-level grouping
- Dynamic measures & dimensions
- Custom formulas support
- Sorting (asc/desc)
- Advanced filtering

</td>
<td width="33%" valign="top">

### ** Formatting & UI**

- Conditional formatting
- Currency & number formatting
- Custom cell styling
- Column resizing
- Drag & drop for rows/columns
- Responsive design
- Toolbar customization

</td>
<td width="33%" valign="top">

### ** Data Management**

- Pagination support
- Large dataset handling
- Export to PDF/Excel/HTML
- Local JSON/CSV file import
- TypeScript support
- Framework agnostic

</td>
</tr>
</table>

### Supported Aggregations

- **Sum** - Total of all values
- **Average** - Mean value
- **Count** - Number of records
- **Min** - Minimum value
- **Max** - Maximum value
- **Custom formulas** - Define your own calculations

---

## Installation

```bash
# npm
npm install @mindfiredigital/pivothead

# yarn
yarn add @mindfiredigital/pivothead

# pnpm
pnpm add @mindfiredigital/pivothead
```

**That's it!** All dependencies including WebAssembly modules are automatically bundled. No additional configuration or manual file copying required.

### Requirements

- **TypeScript** (optional): 4.5.0 or higher
- **Node.js**: 12.0.0 or higher

---

## Quick Start

### Basic Usage

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Your sales data
const data = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  {
    date: '2024-01-01',
    product: 'Widget B',
    region: 'South',
    sales: 1500,
    quantity: 75,
  },
  // ... more data
];

// Configure your pivot table
const config = {
  data: data,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 0,
        locale: 'en-US',
      },
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  pageSize: 10, // Enable pagination
};

// Create the pivot engine
const engine = new PivotEngine(config);

// Get the current state to render your UI
const state = engine.getState();
console.log('Pivot Data:', state);
```

### With TypeScript

```typescript
import {
  PivotEngine,
  PivotTableConfig,
  MeasureConfig,
} from '@mindfiredigital/pivothead';

interface SalesRecord {
  date: string;
  product: string;
  region: string;
  sales: number;
  quantity: number;
}

const config: PivotTableConfig<SalesRecord> = {
  data: salesData,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'sales', label: 'Sales', type: 'number' },
  ],
};

const engine = new PivotEngine<SalesRecord>(config);
```

---

## API Reference

### PivotEngine Class

The `PivotEngine` class is the core of the PivotHead library.

#### Constructor

```typescript
constructor(config: PivotTableConfig<T>)
```

Creates a new instance of PivotEngine with the given configuration.

---

### State Management

#### `getState(): PivotTableState<T>`

Returns the current state of the pivot table.

```javascript
const state = engine.getState();
console.log(state.data); // Current data array
console.log(state.sortConfig); // Current sort configuration
console.log(state.filters); // Active filters
```

#### `reset(): void`

Resets the pivot table to its initial state.

```javascript
engine.reset();
const state = engine.getState();
console.log(state); // Initial state restored
```

---

### Data Manipulation

#### `setMeasures(measureFields: MeasureConfig[]): void`

Sets the measures for the pivot table.

```javascript
engine.setMeasures([
  {
    uniqueName: 'revenue',
    caption: 'Total Revenue',
    aggregation: 'sum',
    format: { type: 'currency', currency: 'USD' },
  },
]);
```

#### `setDimensions(dimensionFields: Dimension[]): void`

Sets the dimensions for the pivot table.

```javascript
engine.setDimensions([
  { field: 'category', label: 'Category', type: 'string' },
  { field: 'date', label: 'Date', type: 'date' },
]);
```

#### `setAggregation(type: AggregationType): void`

Sets the default aggregation type.

```typescript
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

engine.setAggregation('avg');
```

---

### Formatting

#### `formatValue(value: any, field: string): string`

Formats a value based on the specified field's format configuration.

```javascript
const formattedValue = engine.formatValue(1000, 'sales');
console.log(formattedValue); // "$1,000.00"
```

---

### Sorting and Grouping

#### `sort(field: string, direction: 'asc' | 'desc'): void`

Sorts the pivot table data.

```javascript
engine.sort('sales', 'desc'); // Sort by sales descending
```

#### `setGroupConfig(groupConfig: GroupConfig | null): void`

Sets the group configuration for the pivot table.

```javascript
engine.setGroupConfig({
  rowFields: ['product', 'category'],
  columnFields: ['region'],
  grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
});
```

#### `getGroupedData(): Group[]`

Returns the grouped data.

```javascript
const groupedData = engine.getGroupedData();
console.log(groupedData);
```

---

### Row and Column Manipulation

#### `resizeRow(index: number, height: number): void`

Resizes a specific row in the pivot table.

```javascript
engine.resizeRow(2, 60); // Set row 2 height to 60px
```

#### `toggleRowExpansion(rowId: string): void`

Toggles the expansion state of a row.

```javascript
engine.toggleRowExpansion('product-123');
```

#### `isRowExpanded(rowId: string): boolean`

Checks if a specific row is expanded.

```javascript
if (engine.isRowExpanded('product-123')) {
  console.log('Row is expanded');
}
```

#### `dragRow(fromIndex: number, toIndex: number): void`

Handles dragging a row to a new position.

```javascript
engine.dragRow(0, 5); // Move row from index 0 to 5
```

#### `dragColumn(fromIndex: number, toIndex: number): void`

Handles dragging a column to a new position.

```javascript
engine.dragColumn(1, 3); // Move column from index 1 to 3
```

---

### Filtering and Pagination

#### `applyFilters(filters: FilterConfig[]): void`

Applies filters to the data.

```javascript
engine.applyFilters([
  { field: 'region', operator: 'equals', value: 'North' },
  { field: 'sales', operator: 'greaterThan', value: 500 },
]);
```

**Filter Operators:**

- `equals` - Exact match
- `contains` - String contains (case-insensitive)
- `greaterThan` - Numeric greater than
- `lessThan` - Numeric less than
- `between` - Value within range (requires array: `[min, max]`)

#### `setPagination(config: PaginationConfig): void`

Sets the pagination configuration.

```javascript
engine.setPagination({
  currentPage: 2,
  pageSize: 25,
});
```

#### `getFilterState(): FilterConfig[]`

Returns the current filter configuration.

```javascript
const currentFilters = engine.getFilterState();
console.log(currentFilters);
```

#### `getPaginationState(): PaginationConfig`

Returns the current pagination configuration.

```javascript
const paginationInfo = engine.getPaginationState();
console.log(
  `Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}`
);
```

---

## Advanced Features

### Conditional Formatting

Apply custom styles to cells based on their values.

```javascript
const config = {
  // ... other configuration
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50', // Green background for high values
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#f44336', // Red background for low values
      },
    },
  ],
};
```

### Custom Measures with Formulas

Define custom calculated measures:

```javascript
const config = {
  // ... other configuration
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale Price',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity, // Custom calculation
    },
  ],
};
```

### Cell Formatting

Format numbers and currencies:

```javascript
const config = {
  // ... other configuration
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'EUR', // Euro symbol
        locale: 'de-DE', // German locale
        decimals: 2,
      },
    },
    {
      uniqueName: 'percentage',
      caption: 'Growth Rate',
      aggregation: 'avg',
      format: {
        type: 'number',
        decimals: 2,
        locale: 'en-US',
      },
    },
  ],
};
```

### Initial Sorting

Configure initial sort order:

```javascript
const config = {
  // ... other configuration
  initialSort: [
    {
      field: 'sales',
      direction: 'desc',
      type: 'measure',
      aggregation: 'sum',
    },
  ],
};
```

### Toolbar Visibility

Show or hide the toolbar:

```javascript
const config = {
  // ... other configuration
  toolbar: true, // or false to hide
};
```

---

## Configuration Interface

```typescript
interface PivotTableConfig<T> {
  data: T[];
  rows: { uniqueName: string; caption: string }[];
  columns: { uniqueName: string; caption: string }[];
  measures: MeasureConfig[];
  dimensions: Dimension[];
  defaultAggregation?: AggregationType;
  isResponsive?: boolean;
  pageSize?: number;
  toolbar?: boolean;
  groupConfig?: GroupConfig;
  formatting?: Record<string, FormatConfig>;
  conditionalFormatting?: ConditionalFormattingRule[];
  initialSort?: SortConfig[];
  dataSource?: {
    type: 'remote' | 'file';
    url?: string;
    file?: File;
  };
  onRowDragEnd?: (fromIndex: number, toIndex: number, data: T[]) => void;
  onColumnDragEnd?: (
    fromIndex: number,
    toIndex: number,
    columns: Array<{ uniqueName: string; caption: string }>
  ) => void;
}
```

---

## Examples

### Example 1: Sales Dashboard with Filtering

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const engine = new PivotEngine(config);

// Apply filters to show only high-value sales in the North region
engine.applyFilters([
  { field: 'region', operator: 'equals', value: 'North' },
  { field: 'sales', operator: 'greaterThan', value: 1000 },
]);

// Set up pagination
engine.setPagination({
  currentPage: 1,
  pageSize: 10,
});

// Get the filtered, paginated data
const state = engine.getState();
renderPivotTable(state);
```

### Example 2: Range Filtering

```javascript
// Filter sales between $500 and $1500
engine.applyFilters([
  {
    field: 'sales',
    operator: 'between',
    value: [500, 1500],
  },
]);
```

### Example 3: Custom Grouping

```javascript
const config = {
  // ... other configuration
  groupConfig: {
    rowFields: ['category', 'product'],
    columnFields: ['region', 'quarter'],
    grouper: (item, fields) => {
      return fields.map(field => item[field]).join(' > ');
    },
  },
};

const engine = new PivotEngine(config);
const groupedData = engine.getGroupedData();
```

---

## Live Examples

Check out complete working examples:

- **[Vanilla JS Demo](../../examples/vanilla-pivot-demo)** - Basic implementation
- **[React Demo](../../examples/react-demo)** - React integration
- **[Vue Demo](../../examples/vue-example)** - Vue integration
- **[Web Component Demo](../../examples/simple-js-demo)** - Web component usage

### Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/mindfiredigital/PivotHead.git
cd PivotHead

# Navigate to an example (e.g., vanilla-pivot-demo)
cd examples/vanilla-pivot-demo

# Install dependencies
pnpm install

# Build the project
pnpm build

# Start the development server
pnpm start

# Open your browser to the local host address provided
```

---

## Related Packages

Build pivot tables for any framework:

| Package                                                          | Description                      | Documentation                        |
| ---------------------------------------------------------------- | -------------------------------- | ------------------------------------ |
| **[@mindfiredigital/pivothead-react](../react)**                 | React wrapper component          | [README](../react/README.md)         |
| **[@mindfiredigital/pivothead-web-component](../web-component)** | Framework-agnostic web component | [README](../web-component/README.md) |
| **[@mindfiredigital/pivothead-vue](../vue)**                     | Vue wrapper                      | Coming soon                          |

---

### Show Your Support

If PivotHead helps your project, please consider:

- ⭐ [Star the repository](https://github.com/mindfiredigital/PivotHead)

---

## License

Copyright © [Mindfiredigital](https://github.com/mindfiredigital). All rights reserved.

Licensed under the [MIT](https://opensource.org/licenses/MIT) license.

---

<div align="center">

**Built with ❤️ by the [Mindfiredigital](https://www.mindfiredigital.com) team**

[NPM](https://www.npmjs.com/package/@mindfiredigital/pivothead) • [GitHub](https://github.com/mindfiredigital/PivotHead) • [Website](https://www.mindfiredigital.com)

</div>
