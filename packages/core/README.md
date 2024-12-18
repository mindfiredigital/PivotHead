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

`pnpm install @pivothead/core`

## Basic Usage

` javascript
// Basic usage example
`

## Package Methods and Examples

### Core Package Methods

The `PivotEngine` class provides several methods for manipulating and querying the pivot table data.

1. **constructor(config: PivotTableConfig)**
   
   Creates a new instance of the PivotEngine.

   ```
    const data = [
       { date: '2024-01-01', product: 'Widget A', sales: 100 },
       { date: '2024-01-02', product: 'Widget B', sales: 200 },
     ];
   ```

   ```
   const columnConfig = [
       { field: 'date', label: 'Date' },
       { field: 'product', label: 'Product' },
       { field: 'sales', label: 'Sales' }
     ];
   ```

   ```
   const engine = new PivotEngine({
     data: data,
     columns: columnConfig
   });
   ```

2. **getState(): PivotTableState**
   
   Returns the current state of the pivot table.

   ```
   const state = engine.getState();
   
   console.log(state.data); // Logs the current data array
   
   console.log(state.sortConfig); // Logs the current sort configuration
   ```

3. **sort(field: string, direction: 'asc' | 'desc')**
   
   Sorts the data based on the specified field and direction.

   ```
   engine.sort('sales', 'desc');
   const state = engine.getState();
   console.log(state.data); // Logs the sorted data array
   ```

4. **setGroupConfig(groupConfig: GroupConfig | null)**
   
   Sets the grouping configuration for the pivot table.

   ```
   engine.setGroupConfig({
     fields: ['product'],
     grouper: (item, fields) => item[fields[0]]
   });
   const state = engine.getState();
   console.log(state.groups); // Logs the grouped data
   ```

5. **reset()**
   
   Resets the pivot table to its initial state.

   ```
   engine.reset();
   const state = engine.getState();
   console.log(state); // Logs the initial state
   ```

6. **resizeColumn(field: string, width: number)**
   
   Resizes a column to the specified width.

   ```
   engine.resizeColumn('product', 200);
   const state = engine.getState();
   console.log(state.columnSizes); // Logs the updated column sizes
   ```

7. **dragRow(fromIndex: number, toIndex: number)**
   
   Moves a row from one index to another.

   ```
   engine.dragRow(0, 2);
   const state = engine.getState();
   console.log(state.data); // Logs the reordered data array
   ```

8. **dragColumn(fromIndex: number, toIndex: number)**
   
   Moves a column from one index to another.

   ```
   engine.dragColumn(0, 2);
   const state = engine.getState();
   console.log(state.columns); // Logs the reordered columns array
   ```


## API Reference
- Coming soon

## Examples
- Go `examples/vanilla-js-demo` folder.
- Rhen install `pnpm i`.
- Run test by command `pnpm run build`.
- Then start `pnpm start`.
- Go to local host on browser.



