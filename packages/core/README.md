# PivotHead

PivotHead is a powerful and flexible library for creating interactive pivot tables in JavaScript applications. It provides a core engine for data manipulation and upcoming React wrapper for easy integration into React applications.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Package Methods and Examples](#package-methods-and-examples)
5. [Advanced Features](#advanced-features)
   - [Sorting](#sorting)
   - [Grouping](#grouping)
   - [Column Resizing](#column-resizing)
   - [Drag and Drop](#drag-and-drop)
6. [API Reference](#api-reference)
7. [Examples](#examples)

## Features

- Flexible data pivoting and aggregation
- Sorting and filtering capabilities
- Grouping data by multiple fields
- Column resizing
- Drag and drop for rows and columns
- React integration (Upcoming)
- Customizable styling

## Installation

To install PivotHead, use pnpm:

```bash
pnpm install @pivothead/core
```

## Basic Usage

```javascript
// Basic usage example
```

## Package Methods and Examples

### Core Package Methods

The `PivotEngine` class provides several methods for manipulating and querying the pivot table data.

1. **constructor(config: PivotTableConfig)**

   Creates a new instance of the PivotEngine.

   ```javascript
   // Importing the Package
   const { PivotEngine } = PivotheadCore;

   const data = [
     { date: '2024-01-01', category: 'Electronics', product: 'Laptop', region: 'North', sales: 1000, units: 5, profit: 300 },
     { date: '2024-01-01', category: 'Furniture', product: 'Desk', region: 'South', sales: 800, units: 10, profit: 200 },
     // ... more data
   ];

   const config = {
     data: data,
     columns: [
       { field: 'date', label: 'Date' },
       { field: 'category', label: 'Category' },
       { field: 'product', label: 'Product' },
       { field: 'region', label: 'Region' },
       { field: 'sales', label: 'Sales Amount' },
       { field: 'units', label: 'Units Sold' },
       { field: 'profit', label: 'Profit' }
     ],
     groupConfig: null,
     aggregationFields: [
       { field: 'sales', type: 'sum', label: 'Total Sales' },
       { field: 'units', type: 'sum', label: 'Total Units' },
       { field: 'profit', type: 'sum', label: 'Total Profit' }
     ]
   };

   const engine = new PivotEngine(config);
   ```

2. **getState(): PivotTableState**

   Returns the current state of the pivot table.

   ```javascript
   const state = engine.getState();
   console.log(state.data); // Logs the current data array
   console.log(state.sortConfig); // Logs the current sort configuration
   ```

3. **sort(field: string, direction: 'asc' | 'desc')**

   Sorts the data based on the specified field and direction.

   ```javascript
   engine.sort('sales', 'desc');
   const state = engine.getState();
   console.log(state.data); // Logs the sorted data array
   ```

4. **setGroupConfig(groupConfig: GroupConfig | null)**

   Sets the grouping configuration for the pivot table.

   ```javascript
   engine.setGroupConfig({
     fields: ['product'],
     grouper: (item, fields) => item[fields[0]]
   });
   const state = engine.getState();
   console.log(state.groups); // Logs the grouped data
   ```

5. **reset()**

   Resets the pivot table to its initial state.

   ```javascript
   engine.reset();
   const state = engine.getState();
   console.log(state); // Logs the initial state
   ```

6. **resizeColumn(field: string, width: number)**

   Resizes a column to the specified width.

   ```javascript
   engine.resizeColumn('product', 200);
   const state = engine.getState();
   console.log(state.columnSizes); // Logs the updated column sizes
   ```

7. **dragRow(fromIndex: number, toIndex: number)**

   Moves a row from one index to another.

   ```javascript
   engine.dragRow(0, 2);
   const state = engine.getState();
   console.log(state.data); // Logs the reordered data array
   ```

8. **dragColumn(fromIndex: number, toIndex: number)**

   Moves a column from one index to another.

   ```javascript
   engine.dragColumn(0, 2);
   const state = engine.getState();
   console.log(state.columns); // Logs the reordered columns array
   ```

9. **setMeasures(selectedMeasures: string[])**

   Updates the selected measures for the pivot table.

   ```javascript
   const selectedMeasures = ['sales', 'units', 'profit'];
   engine.setMeasures(selectedMeasures);
   ```

10. **setAggregationType(type: string)**

    Sets the aggregation type for the measures.

    ```javascript
    engine.setAggregationType('avg');
    ```

11. **getGroupedData(): { rowGroups: Group[], columnGroups: Group[] }**

    Returns the grouped data based on the current configuration.

    ```javascript
    const { rowGroups, columnGroups } = engine.getGroupedData();
    ```

12. **isRowExpanded(group: string): boolean**

    Checks if a specific group is expanded.

    ```javascript
    const isExpanded = engine.isRowExpanded(group.key);
    ```

13. **toggleRowExpansion(group: string)**

    Toggles the expansion state of a specific group.

    ```javascript
    engine.toggleRowExpansion(group.key);
    ```

14. **formatValue(value: any, type: string): string**

    Formats a value based on its type. This method is typically implemented in the rendering logic:

    ```javascript
    function formatValue(value, type) {
      if (type.includes('customerRating')) {
        return value.toFixed(1);
      }
      if (type.includes('sales') || type.includes('profit')) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value);
      }
      return new Intl.NumberFormat().format(value);
    }
    ```

15. **updateGrouping()**

    Updates the grouping based on the current row and column field selections. This method is typically used in the UI logic:

    ```javascript
    function updateGrouping() {
      const rowFields = Array.from(document.getElementById('row-groups').selectedOptions).map(opt => opt.value);
      const colFields = Array.from(document.getElementById('col-groups').selectedOptions).map(opt => opt.value);
      
      engine.setGroupConfig({
        rowFields,
        columnFields: colFields,
        grouper: (item, fields) => fields.map(f => item[f]).join(' - ')
      });
      
      renderTable();
    }
    ```

## Rendering the Pivot Table

To render the pivot table, you typically follow these steps:

1. Create the analysis controls (grouping, measures, aggregation type).
2. Render the table header with column groups.
3. Render the table body with row groups and their data.

Here's a simplified example of rendering the pivot table:

```javascript
function renderTable() {
  const state = engine.getState();
  const container = document.getElementById('pivotTable');
  if (!container) return;

  container.innerHTML = '';
  container.appendChild(createAnalysisControls());

  const tableElement = document.createElement('table');
  
  // Render column groups
  const { columnGroups } = engine.getGroupedData();
  if (columnGroups.length > 0) {
    renderColumnGroups(tableElement, columnGroups);
  }

  // Render row groups
  const { rowGroups } = engine.getGroupedData();
  if (rowGroups.length > 0) {
    renderRowGroups(tableElement, rowGroups);
  } else {
    renderDataRows(tableElement, state.data);
  }

  container.appendChild(tableElement);
}

// Call renderTable() whenever the pivot table state changes
```

This structure allows for a dynamic and interactive pivot table that can be easily manipulated using the PivotEngine methods.

## Advanced Features

### Sorting

The PivotEngine supports sorting data by any field in ascending or descending order. This is typically handled in the UI logic:

```javascript
function handleSort(field) {
  const currentDirection = engine.getState().sortConfig?.direction;
  const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
  engine.sort(field, newDirection);
  renderTable();
}
```

### Grouping

You can group data by multiple fields for both rows and columns. This is handled by the `setGroupConfig` method:

```javascript
engine.setGroupConfig({
  rowFields: ['category', 'product'],
  columnFields: ['region'],
  grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
});
```

### Custom Measures

Define custom measures with specific formulas and aggregations in the initial configuration:

```javascript
const config = {
  // ... other config options
  aggregationFields: [
    { field: 'sales', type: 'sum', label: 'Total Sales' },
    { field: 'units', type: 'sum', label: 'Total Units' },
    { field: 'profit', type: 'sum', label: 'Total Profit' },
    { 
      field: 'profitMargin', 
      type: 'custom', 
      label: 'Profit Margin',
      formula: (item) => (item.profit / item.sales) * 100
    }
  ],
};

```

## API Reference

- `PivotEngine`: The main class for creating and managing pivot tables.
- `PivotTableConfig`: Configuration object for initializing the PivotEngine.
- `PivotTableState`: Represents the current state of the pivot table.
- `GroupConfig`: Configuration for grouping data in the pivot table.
- `AggregationType`: Type of aggregation ('sum', 'avg', 'count', 'min', 'max').

For detailed API documentation, please refer to the source code and comments.

## Examples

To run the examples:

1. Go to the `examples/vanilla-js-demo` folder.
2. Install dependencies with `pnpm i`.
3. Build the project with `pnpm run build`.
4. Start the development server with `pnpm start`.
5. Open your browser and navigate to the local host address provided.

These examples demonstrate various features of the PivotHead library, including basic usage, custom measures, grouping, and more.

