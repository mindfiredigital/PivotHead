# PivotHead

PivotHead is a powerful and flexible library for creating interactive pivot tables in JavaScript applications. It provides a core engine for data manipulation and, in the future, will be compatible with wrappers for React, Vue, Svelte, and Angular, making it easy to integrate into applications built with these frameworks.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [PivotEngine API](#pivotengine-api)
5. [Advanced Features](#advanced-features)
6. [Configuration](#configuration)
7. [Examples](#examples)

## Features

- Flexible data pivoting and aggregation
- Sorting and filtering capabilities
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
pnpm install @mindfiredigital/pivot-head-core

```

## Basic Usage

```javascript
import { PivotEngine } from '@mindfiredigital/pivot-head-core';

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

Example :-

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

Example :-

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

## Advanced Features

## Formatting cells

PivotHead supports conditional formatting for cells like decimal values , currency symbol etc.

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
  groupConfig?: GroupConfig;
  formatting?: Record<string, FormatConfig>;
  conditionalFormatting?: ConditionalFormattingRule[];
}
```

For detailed information on each configuration option, please refer to the source code and comments.

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

For more detailed examples and usage scenarios, please refer to the example files in the repository.
