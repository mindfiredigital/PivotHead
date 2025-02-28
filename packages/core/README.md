# PivotHead

PivotHead is a powerful and flexible library for creating interactive pivot tables in JavaScript applications. It provides a core engine for data manipulation and, in the future, will be compatible with wrappers for React, Vue, Svelte, and Angular, making it easy to integrate into applications built with these frameworks.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [PivotEngine API](#pivotengine-api)
5. [Advanced Features](#advanced-features)
6. [Configuration](#configuration)
7. [Filtering](#filtering)
8. [Pagination](#pagination)
9. [Examples](#examples)

## Features

- Flexible data pivoting and aggregation
- Sorting and filtering capabilities
- Pagination support
- Grouping data by multiple fields
- Column resizing
- Drag and drop for rows and columns
- Conditional formatting
- Custom measures and formulas
- Responsive design
- Customizable styling
- React integration (Upcoming)

## Installation

To install PivotHead, use npm or yarn:

```bash
pnpm install @mindfiredigital/pivothead
```

## Basic Usage

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const data = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  // ... more data
];

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
        decimals: 2,
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
  pageSize: 10, // Default page size for pagination
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
  },
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    quantity: {
      type: 'number',
      decimals: 2,
      locale: 'en-US',
    },
  },
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
        backgroundColor: '#4CAF50',
      },
    },
    // ... more conditional formatting rules
  ],
};

const engine = new PivotEngine(config);

// Use the engine to render your pivot table
```

## PivotEngine API

The `PivotEngine` class is the core of the PivotHead library. Here are its key methods:

### Constructor

```typescript
constructor(config: PivotTableConfig<T>)
```

Creates a new instance of PivotEngine with the given configuration.

### State Management

#### getState()

```typescript
getState(): PivotTableState<T>
```

Example:

- **getState(): PivotTableState**

  Returns the current state of the pivot table.

  ```javascript
  const state = engine.getState();
  console.log(state.data); // Logs the current data array
  console.log(state.sortConfig); // Logs the current sort configuration
  ```

Returns the current state of the pivot table.

#### reset()

Resets the pivot table to its initial state.

```typescript
reset();
```

Example:

- **reset()**

  ```javascript
  engine.reset();
  const state = engine.getState();
  console.log(state); // Logs the initial state
  ```

Resets the pivot table to its initial state.

### Data Manipulation

#### setMeasures(measureFields: MeasureConfig[])

```typescript
setMeasures(measureFields: MeasureConfig[])
```

Sets the measures for the pivot table.

#### setDimensions(dimensionFields: Dimension[])

```typescript
setDimensions(dimensionFields: Dimension[])
```

Sets the dimensions for the pivot table.

#### setAggregation(type: AggregationType)

```typescript
setAggregation(type: AggregationType)
```

Sets the aggregation type for the pivot table.

### Formatting

#### formatValue(value: any, field: string): string

```typescript
formatValue(value: any, field: string): string
```

Formats a value based on the specified field's format configuration.

Example:

```javascript
const formattedValue = engine.formatValue(1000, 'sales');
console.log(formattedValue); // "$1,000.00"
```

### Sorting and Grouping

#### sort(field: string, direction: 'asc' | 'desc')

```typescript
sort(field: string, direction: 'asc' | 'desc')
```

Sorts the pivot table data.

#### setGroupConfig(groupConfig: GroupConfig | null)

```typescript
setGroupConfig(groupConfig: GroupConfig | null)
```

Sets the group configuration for the pivot table.

#### getGroupedData(): Group[]

```typescript
getGroupedData(): Group[]
```

Returns the grouped data.

### Row and Column Manipulation

#### resizeRow(index: number, height: number)

```typescript
resizeRow(index: number, height: number)
```

Resizes a specific row in the pivot table.

#### toggleRowExpansion(rowId: string)

```typescript
toggleRowExpansion(rowId: string)
```

Toggles the expansion state of a row.

#### isRowExpanded(rowId: string): boolean

```typescript
isRowExpanded(rowId: string): boolean
```

Checks if a specific row is expanded.

#### dragRow(fromIndex: number, toIndex: number)

```typescript
dragRow(fromIndex: number, toIndex: number)
```

Handles dragging a row to a new position.

#### dragColumn(fromIndex: number, toIndex: number)

```typescript
dragColumn(fromIndex: number, toIndex: number)
```

Handles dragging a column to a new position.

### Filtering and Pagination

#### applyFilters(filters: FilterConfig[])

```typescript
applyFilters(filters: FilterConfig[])
```

Applies filters to the data based on the provided filter configurations.

#### setPagination(config: PaginationConfig)

```typescript
setPagination(config: PaginationConfig)
```

Sets the pagination configuration for the pivot table.

#### getFilterState(): FilterConfig[]

```typescript
getFilterState(): FilterConfig[]
```

Returns the current filter configuration.

#### getPaginationState(): PaginationConfig

```typescript
getPaginationState(): PaginationConfig
```

Returns the current pagination configuration.

## Advanced Features

### Formatting cells

PivotHead supports conditional formatting for cells like decimal values, currency symbol etc.

Example configuration:

```javascript
const config = {
  // ... other configuration options
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 4,
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 2,
        locale: 'en-US',
      },
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 4,
      },
      formula: item => item.sales / item.quantity,
    },
  ],
  // ... other configuration options
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 4,
    },
    quantity: {
      type: 'number',
      // decimals: 2,
      // locale: 'en-US'
    },
    averageSale: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 4,
    },
  },
};
```

### Conditional Formatting

PivotHead supports conditional formatting, allowing you to apply custom styles to cells based on their values.

Example configuration:

```javascript
const config = {
  // ... other configuration options
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
        backgroundColor: '#4CAF50',
      },
    },
    // ... more conditional formatting rules
  ],
};
```

### Custom Measures

You can define custom measures with specific formulas:

```javascript
const config = {
  // ... other configuration options
  measures: [
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity,
    },
  ],
};
```

## Configuration

The `PivotTableConfig` object allows you to customize various aspects of the pivot table:

```typescript
interface PivotTableConfig<T> {
  data: T[];
  rows: { uniqueName: string; caption: string }[];
  columns: { uniqueName: string; caption: string }[];
  measures: MeasureConfig[];
  dimensions: Dimension[];
  defaultAggregation?: AggregationType;
  isResponsive?: boolean;
  pageSize?: number; // Default page size for pagination
  groupConfig?: GroupConfig;
  formatting?: Record<string, FormatConfig>;
  conditionalFormatting?: ConditionalFormattingRule[];
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

For detailed information on each configuration option, please refer to the source code and comments.

## Filtering

PivotHead provides robust filtering capabilities through the `FilterConfig` interface. Filters can be applied to any field in your data with various operators.

### Filter Configuration

```typescript
interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any; // Can be a single value or an array for 'between' operator
}
```

### Basic Filtering Example

```javascript
// Apply filters to show only data for the North region with sales greater than 500
const filters = [
  {
    field: 'region',
    operator: 'equals',
    value: 'North',
  },
  {
    field: 'sales',
    operator: 'greaterThan',
    value: 500,
  },
];

engine.applyFilters(filters);
```

### Filter Operators

- **equals**: Exact match comparison
- **contains**: String contains check (case-insensitive)
- **greaterThan**: Numeric greater than comparison
- **lessThan**: Numeric less than comparison
- **between**: Value is within a range (requires an array of two values)

### Range Filter Example

```javascript
// Filter sales between 500 and 1500
const rangeFilter = [
  {
    field: 'sales',
    operator: 'between',
    value: [500, 1500],
  },
];

engine.applyFilters(rangeFilter);
```

### Retrieving Current Filters

```javascript
const currentFilters = engine.getFilterState();
console.log(currentFilters); // Array of current FilterConfig objects
```

## Pagination

PivotHead includes built-in pagination capabilities to handle large datasets efficiently.

### Pagination Configuration

```typescript
interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages?: number; // Read-only, calculated internally
}
```

### Setting Up Pagination

Pagination can be configured during initialization:

```javascript
const config = {
  // ... other configuration
  pageSize: 25, // Show 25 items per page
};

const engine = new PivotEngine(config);
```

### Changing Pagination During Runtime

```javascript
// Change to page 3 with 50 items per page
engine.setPagination({
  currentPage: 3,
  pageSize: 50,
});
```

### Getting Current Pagination State

```javascript
const paginationInfo = engine.getPaginationState();
console.log(
  `Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}`
);
console.log(`Showing ${paginationInfo.pageSize} items per page`);
```

### Combining Pagination with Filters

Pagination works seamlessly with filters. When filters are applied, the pagination is automatically adjusted based on the filtered dataset:

```javascript
// Apply filters first
engine.applyFilters([{ field: 'region', operator: 'equals', value: 'North' }]);

// Then update pagination if needed
engine.setPagination({ currentPage: 1 }); // Go to first page of filtered results
```

## Examples

To run the examples:

1. Clone the repository
2. Navigate to the `examples/vanilla-js-demo` folder
3. Install dependencies with `npm install` or `yarn install`
4. Build the project with `npm run build` or `yarn build`
5. Start the development server with `npm start` or `yarn start`
6. Open your browser and navigate to the local host address provided

These examples demonstrate various features of the PivotHead library, including:

- Basic pivot table setup
- Custom measures and formulas
- Grouping and aggregation
- Conditional formatting
- Drag and drop functionality
- Responsive design
- Filtering and pagination

### Filter and Pagination Example

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Initialize the engine with your data and configuration
const engine = new PivotEngine(config);

// Apply filters to show only high-value sales in the North region
engine.applyFilters([
  { field: 'region', operator: 'equals', value: 'North' },
  { field: 'sales', operator: 'greaterThan', value: 1000 },
]);

// Set up pagination to show 10 items per page and display the second page
engine.setPagination({
  currentPage: 2,
  pageSize: 10,
});

// Get pagination info to update UI
const paginationInfo = engine.getPaginationState();
updatePaginationControls(paginationInfo);

// Function to handle page navigation
function goToPage(pageNumber) {
  engine.setPagination({
    currentPage: pageNumber,
    pageSize: paginationInfo.pageSize,
  });

  // Get updated state and re-render your UI
  const state = engine.getState();
  renderPivotTable(state);
}
```

For more detailed examples and usage scenarios, please refer to the example files in the repository.
