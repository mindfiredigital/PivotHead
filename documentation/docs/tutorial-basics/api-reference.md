---
sidebar_position: 2
title: Api Reference
description: Understanding the Api References of PivotHead
---

# API Reference

## PivotEngine

The `PivotEngine` class is the core of the PivotHead library, providing the functionality for data manipulation, formatting, and state management.

### Constructor

```typescript
constructor(config: PivotTableConfig<T>)
```

Creates a new instance of PivotEngine with the given configuration.

**Example:**

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const config = {
  data: myData,
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
  // other configuration options...
};

const engine = new PivotEngine(config);
```

### State Management

#### getState()

```typescript
getState(): PivotTableState<T>
```

Returns the current state of the pivot table.

**Example:**

```javascript
const state = engine.getState();
console.log(state.data); // Logs the current data array
console.log(state.sortConfig); // Logs the current sort configuration
```

#### reset()

```typescript
reset(): void
```

Resets the pivot table to its initial state.

**Example:**

```javascript
engine.reset();
const state = engine.getState();
console.log(state); // Logs the initial state
```

### Data Manipulation

#### setMeasures()

```typescript
setMeasures(measureFields: MeasureConfig[]): void
```

Sets the measures for the pivot table.

**Example:**

```javascript
engine.setMeasures([
  {
    uniqueName: 'revenue',
    caption: 'Total Revenue',
    aggregation: 'sum',
    format: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
  },
  {
    uniqueName: 'profit',
    caption: 'Total Profit',
    aggregation: 'sum',
    format: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
  },
]);
```

#### setDimensions()

```typescript
setDimensions(dimensionFields: Dimension[]): void
```

Sets the dimensions for the pivot table.

**Example:**

```javascript
engine.setDimensions([
  { field: 'product', label: 'Product', type: 'string' },
  { field: 'region', label: 'Region', type: 'string' },
  { field: 'date', label: 'Date', type: 'date' },
]);
```

#### setAggregation()

```typescript
setAggregation(type: AggregationType): void
```

Sets the aggregation type for the pivot table.

**Example:**

```javascript
engine.setAggregation('avg'); // Set aggregation to average
```

### Formatting

#### formatValue()

```typescript
formatValue(value: any, field: string): string
```

Formats a value based on the specified field's format configuration.

**Example:**

```javascript
const formattedValue = engine.formatValue(1000, 'sales');
console.log(formattedValue); // "$1,000.00"
```

### Sorting and Grouping

#### sort()

```typescript
sort(field: string, direction: 'asc' | 'desc'): void
```

Sorts the pivot table data.

**Example:**

```javascript
engine.sort('sales', 'desc'); // Sort by sales in descending order
```

#### setGroupConfig()

```typescript
setGroupConfig(groupConfig: GroupConfig | null): void
```

Sets the group configuration for the pivot table.

**Example:**

```javascript
engine.setGroupConfig({
  rowFields: ['product'],
  columnFields: ['region'],
  grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
});
```

#### getGroupedData()

```typescript
getGroupedData(): Group[]
```

Returns the grouped data.

**Example:**

```javascript
const groupedData = engine.getGroupedData();
console.log(groupedData); // Logs the grouped data structure
```

### Row and Column Manipulation

#### resizeRow()

```typescript
resizeRow(index: number, height: number): void
```

Resizes a specific row in the pivot table.

**Example:**

```javascript
engine.resizeRow(2, 50); // Resize row at index 2 to 50px height
```

#### toggleRowExpansion()

```typescript
toggleRowExpansion(rowId: string): void
```

Toggles the expansion state of a row.

**Example:**

```javascript
engine.toggleRowExpansion('product-widget-a'); // Toggle expansion for a specific row
```

#### isRowExpanded()

```typescript
isRowExpanded(rowId: string): boolean
```

Checks if a specific row is expanded.

**Example:**

```javascript
const isExpanded = engine.isRowExpanded('product-widget-a');
console.log(isExpanded); // true or false
```

#### dragRow()

```typescript
dragRow(fromIndex: number, toIndex: number): void
```

Handles dragging a row to a new position.

**Example:**

```javascript
engine.dragRow(3, 5); // Move row from index 3 to index 5
```

#### dragColumn()

```typescript
dragColumn(fromIndex: number, toIndex: number): void
```

Handles dragging a column to a new position.

**Example:**

```javascript
engine.dragColumn(1, 3); // Move column from index 1 to index 3
```

### Filtering and Pagination

#### applyFilters()

```typescript
applyFilters(filters: FilterConfig[]): void
```

Applies filters to the data based on the provided filter configurations.

**Example:**

```javascript
engine.applyFilters([
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
]);
```

#### setPagination()

```typescript
setPagination(config: PaginationConfig): void
```

Sets the pagination configuration for the pivot table.

**Example:**

```javascript
engine.setPagination({
  currentPage: 2,
  pageSize: 20,
});
```

#### getFilterState()

```typescript
getFilterState(): FilterConfig[]
```

Returns the current filter configuration.

**Example:**

```javascript
const currentFilters = engine.getFilterState();
console.log(currentFilters); // Array of current filter configurations
```

#### getPaginationState()

```typescript
getPaginationState(): PaginationConfig
```

Returns the current pagination configuration.

**Example:**

```javascript
const paginationInfo = engine.getPaginationState();
console.log(
  `Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}`
);
```

## Configuration Interfaces

### PivotTableConfig

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

### MeasureConfig

```typescript
interface MeasureConfig {
  uniqueName: string;
  caption: string;
  aggregation: AggregationType;
  format?: FormatConfig;
  formula?: (item: any) => number;
}
```

### Dimension

```typescript
interface Dimension {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}
```

### FormatConfig

```typescript
interface FormatConfig {
  type: 'number' | 'currency' | 'percentage' | 'date';
  decimals?: number;
  locale?: string;
  currency?: string;
  dateFormat?: string;
}
```

### FilterConfig

```typescript
interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}
```

### PaginationConfig

```typescript
interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages?: number; // Read-only, calculated internally
}
```

### GroupConfig

```typescript
interface GroupConfig {
  rowFields: string[];
  columnFields: string[];
  grouper?: (item: any, fields: string[]) => string;
}
```

### ConditionalFormattingRule

```typescript
interface ConditionalFormattingRule {
  value: {
    type: 'Number' | 'Text' | 'Date';
    operator: string;
    value1: string;
    value2?: string;
  };
  format: {
    font?: string;
    size?: string;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}
```
