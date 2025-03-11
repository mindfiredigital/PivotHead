---
sidebar_position: 1
title: Core Concepts
description: Understanding the fundamental building blocks of PivotHead
---

# Core Concepts

To effectively use PivotHead, it's important to understand the core concepts and terminology used throughout the library. This page explains the fundamental building blocks that make up a pivot table and how they work together.

## The Anatomy of a Pivot Table

A pivot table consists of several key components:

![Pivot Table Anatomy](https://via.placeholder.com/800x400/e2e8f0/64748b?text=Pivot+Table+Anatomy)

### 1. Data Source

The foundation of any pivot table is the raw data. In PivotHead, this is typically an array of objects, where each object represents a record with multiple fields:

```javascript
const data = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  // More records...
];
```

### 2. Dimensions and Measures

Fields in your data are categorized as either dimensions or measures:

#### Dimensions

Dimensions are categorical fields used to organize and group your data. They typically contain text or dates:

- Product names
- Regions/locations
- Time periods
- Categories

In PivotHead, dimensions are defined in the configuration:

```javascript
dimensions: [
  { field: 'product', label: 'Product', type: 'string' },
  { field: 'region', label: 'Region', type: 'string' },
  { field: 'date', label: 'Date', type: 'date' },
],
```

#### Measures

Measures are numeric values that can be calculated or aggregated:

- Sales figures
- Quantities
- Counts
- Percentages

In PivotHead, measures define what values will be calculated and displayed in the cells:

```javascript
measures: [
  {
    uniqueName: 'sales',
    caption: 'Total Sales',
    aggregation: 'sum',
    format: {
      type: 'currency',
      currency: 'USD',
    },
  },
],
```

### 3. Rows and Columns

Rows and columns determine the structure of your pivot table:

- **Rows** define the horizontal organization of your data
- **Columns** define the vertical organization of your data

Both are typically populated with dimension fields:

```javascript
rows: [{ uniqueName: 'product', caption: 'Product' }],
columns: [{ uniqueName: 'region', caption: 'Region' }],
```

With this configuration, products would appear as rows, and regions would appear as columns.

### 4. Cells

The intersection of rows and columns creates cells that display the aggregated measure values:

- Each cell contains the result of applying the specified aggregation function to all records that match the corresponding row and column criteria
- Multiple measures can be displayed in each cell

### 5. Aggregations

Aggregations define how measure values are combined when multiple records share the same row and column dimensions:

- **Sum**: Add all values (most common for sales, revenue, etc.)
- **Average**: Calculate the mean of all values
- **Count**: Count the number of records
- **Min**: Find the smallest value
- **Max**: Find the largest value
- **Custom**: Apply a custom formula or function

```javascript
{
  uniqueName: 'sales',
  caption: 'Total Sales',
  aggregation: 'sum', // Can be 'sum', 'avg', 'count', 'min', 'max', or 'custom'
}
```

## The PivotEngine Class

The `PivotEngine` class is the core of PivotHead. It handles:

1. **Data Processing**: Organizing and aggregating your data
2. **State Management**: Keeping track of the current configuration and user interactions
3. **Calculations**: Performing aggregations and applying formulas
4. **Formatting**: Applying number and date formatting to cells

When you create a new PivotEngine, you provide a configuration object that defines how the pivot table should behave:

```javascript
const engine = new PivotEngine({
  data: yourData,
  rows: [...],
  columns: [...],
  measures: [...],
  dimensions: [...],
  // Additional configuration...
});
```

## Data Flow in PivotHead

Understanding how data flows through PivotHead helps you make better use of its capabilities:

1. **Initial Configuration**: You provide the raw data and configuration to create a PivotEngine
2. **Data Processing**: The engine processes the data according to the configuration
3. **State Generation**: The engine generates a state object containing the structured data
4. **Rendering**: Your application renders the UI based on the state
5. **User Interaction**: Users interact with the UI (sorting, filtering, etc.)
6. **State Updates**: The engine updates its internal state based on user actions
7. **Re-rendering**: Your application re-renders with the updated state

## Grouping and Hierarchies

PivotHead supports hierarchical data through grouping:

```javascript
groupConfig: {
  rowFields: ['category', 'product'], // Creates a hierarchy of category > product
  columnFields: ['year', 'quarter'],  // Creates a hierarchy of year > quarter
  grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
},
```

With this configuration:

- Products would be grouped by category (creating collapsible rows)
- Quarters would be grouped by year (creating collapsible columns)

## Filtering and Sorting

PivotHead provides a flexible system for filtering and sorting your data:

### Filtering

Filters narrow down the data based on specific criteria:

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
    value: 1000,
  },
]);
```

### Sorting

Sorting arranges data in a specific order:

```javascript
engine.sort('sales', 'desc'); // Sort by sales in descending order
```

## Formatting

PivotHead offers extensive formatting options for presenting your data:

```javascript
format: {
  type: 'currency',
  currency: 'USD',
  locale: 'en-US',
  decimals: 2,
}
```

Available format types:

- `number`: Basic number formatting
- `currency`: Currency values with symbol
- `percent`: Percentage values
- `date`: Date formatting

## Custom Measures and Formulas

One of PivotHead's most powerful features is the ability to create custom measures with formulas:

```javascript
{
  uniqueName: 'profitMargin',
  caption: 'Profit Margin',
  aggregation: 'custom',
  format: {
    type: 'percent',
    decimals: 2,
  },
  formula: item => (item.sales - item.cost) / item.sales,
}
```

This allows you to derive new insights from your existing data without modifying the original dataset.

## Pagination

For large datasets, PivotHead includes built-in pagination:

```javascript
engine.setPagination({
  currentPage: 2,
  pageSize: 25,
});
```

This divides your data into manageable chunks, improving performance and user experience.

## Event Handling

PivotHead provides callbacks for various user interactions:

```javascript
{
  onRowDragEnd: (fromIndex, toIndex, data) => {
    console.log(`Row moved from index ${fromIndex} to ${toIndex}`);
    // Custom logic...
  },
  onColumnDragEnd: (fromIndex, toIndex, columns) => {
    console.log(`Column moved from index ${fromIndex} to ${toIndex}`);
    // Custom logic...
  },
}
```

These callbacks allow you to integrate PivotHead with your application's logic and respond to user actions.

## Summary

Understanding these core concepts will help you make the most of PivotHead:

1. **Dimensions and Measures**: Categorize your fields appropriately
2. **Rows and Columns**: Define the structure of your pivot table
3. **Aggregations**: Choose the right calculation method for your data
4. **PivotEngine**: The central class that coordinates all functionality
5. **Grouping**: Create hierarchical structures in your data
6. **Filtering and Sorting**: Refine your data presentation
7. **Formatting**: Make your data visually meaningful
8. **Custom Measures**: Derive new insights with formulas
9. **Pagination**: Handle large datasets efficiently
10. **Events**: Respond to user interactions

With these concepts in mind, you're ready to build powerful data visualization tools with PivotHead!
