---
sidebar_position: 3
title: Examples & Usage
description: Examples & Usage of PivotHead
---

# Examples

## Basic Pivot Table

This example demonstrates how to create a simple pivot table with products and regions.

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
  {
    date: '2024-01-01',
    product: 'Widget B',
    region: 'North',
    sales: 1500,
    quantity: 60,
  },
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'South',
    sales: 1200,
    quantity: 55,
  },
  {
    date: '2024-01-01',
    product: 'Widget B',
    region: 'South',
    sales: 1800,
    quantity: 70,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'North',
    sales: 1100,
    quantity: 52,
  },
  {
    date: '2024-01-02',
    product: 'Widget B',
    region: 'North',
    sales: 1600,
    quantity: 62,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'South',
    sales: 1300,
    quantity: 58,
  },
  {
    date: '2024-01-02',
    product: 'Widget B',
    region: 'South',
    sales: 1900,
    quantity: 72,
  },
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
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
};

const engine = new PivotEngine(config);
const state = engine.getState();

// Now you can use the state to render your pivot table
console.log(state);

// In a real application, you would render the UI based on this state
```

## Advanced Configuration with Custom Measures

This example shows how to create custom measures using formulas.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const data = [
  // ... your data array
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
        decimals: 0,
        locale: 'en-US',
      },
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale Price',
      aggregation: 'custom',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity,
    },
    {
      uniqueName: 'profitMargin',
      caption: 'Profit Margin (%)',
      aggregation: 'custom',
      format: {
        type: 'percentage',
        decimals: 1,
        locale: 'en-US',
      },
      formula: item => ((item.sales - item.quantity * 10) / item.sales) * 100,
    },
  ],
  dimensions: [
    // ... your dimensions
  ],
};

const engine = new PivotEngine(config);
```

## Filtering and Pagination

This example demonstrates how to apply filters and pagination to your pivot table.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Initialize with your data and configuration
const engine = new PivotEngine(config);

// Apply filters to show only data for the North region with sales greater than 1000
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

// Set up pagination to show 10 items per page and view the first page
engine.setPagination({
  currentPage: 1,
  pageSize: 10,
});

// Get the current state with applied filters and pagination
const filteredState = engine.getState();
console.log(filteredState);

// Get pagination information
const paginationInfo = engine.getPaginationState();
console.log(
  `Showing page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}`
);
```

## Conditional Formatting

This example shows how to apply conditional formatting to highlight cells based on their values.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

const config = {
  // ... other configuration options
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50', // Green background for high values
        bold: true,
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#f44336', // Red background for low values
        bold: true,
      },
    },
  ],
};

const engine = new PivotEngine(config);
```

## Dynamic Configuration Changes

This example demonstrates how to dynamically change the configuration of the pivot table.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Initial configuration
const engine = new PivotEngine(initialConfig);

// Function to update the pivot table view
function updatePivotView(viewType) {
  switch (viewType) {
    case 'sales-by-product':
      engine.setMeasures([
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
      ]);
      engine.setGroupConfig({
        rowFields: ['product'],
        columnFields: ['region'],
      });
      break;

    case 'quantity-by-date':
      engine.setMeasures([
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
      ]);
      engine.setGroupConfig({
        rowFields: ['date'],
        columnFields: ['product'],
      });
      break;

    case 'reset':
      engine.reset();
      break;
  }

  // Get the updated state and re-render your UI
  const state = engine.getState();
  renderPivotTable(state);
}

// Example usage
document.getElementById('view-selector').addEventListener('change', e => {
  updatePivotView(e.target.value);
});
```

## Complete Application Example

This example shows a more complete application with event handlers for user interactions.

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Sample data
const data = [
  // ... your data array
];

// Initial configuration
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
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string' },
    { field: 'region', label: 'Region', type: 'string' },
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'sales', label: 'Sales', type: 'number' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
  ],
  onRowDragEnd: (fromIndex, toIndex, data) => {
    console.log(`Row moved from ${fromIndex} to ${toIndex}`);
    // You can perform additional actions here
  },
  onColumnDragEnd: (fromIndex, toIndex, columns) => {
    console.log(`Column moved from ${fromIndex} to ${toIndex}`);
    // You can perform additional actions here
  },
};

// Initialize the engine
const engine = new PivotEngine(config);

// Function to render the pivot table
function renderPivotTable(state) {
  // This is a simplified example. In a real application, you would:
  // 1. Create the table structure
  // 2. Populate headers based on state.columns
  // 3. Populate rows based on state.rows and state.data
  // 4. Apply formatting and conditional formatting

  const container = document.getElementById('pivot-container');
  // Clear previous content
  container.innerHTML = '';

  // Create a simple representation for this example
  const table = document.createElement('table');
  table.className = 'pivot-table';

  // Add headers
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Add corner cell
  const cornerCell = document.createElement('th');
  cornerCell.className = 'pivot-corner';
  headerRow.appendChild(cornerCell);

  // Add column headers
  state.columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.caption;
    th.className = 'pivot-column-header';
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Add rows
  const tbody = document.createElement('tbody');
  state.rows.forEach(row => {
    const tr = document.createElement('tr');

    // Add row header
    const rowHeader = document.createElement('th');
    rowHeader.textContent = row.caption;
    rowHeader.className = 'pivot-row-header';
    tr.appendChild(rowHeader);

    // Add data cells
    state.columns.forEach(column => {
      const td = document.createElement('td');
      td.className = 'pivot-cell';

      // Find value for this cell
      const cellValue = state.data.find(
        item =>
          item[row.uniqueName] === row.value &&
          item[column.uniqueName] === column.value
      );

      if (cellValue) {
        td.textContent = engine.formatValue(cellValue.sales, 'sales');
      } else {
        td.textContent = '-';
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Initial render
renderPivotTable(engine.getState());

// Event handlers for UI controls
document.getElementById('sort-button').addEventListener('click', () => {
  engine.sort('sales', 'desc');
  renderPivotTable(engine.getState());
});

document.getElementById('filter-button').addEventListener('click', () => {
  engine.applyFilters([
    {
      field: 'sales',
      operator: 'greaterThan',
      value: 1000,
    },
  ]);
  renderPivotTable(engine.getState());
});

document.getElementById('reset-button').addEventListener('click', () => {
  engine.reset();
  renderPivotTable(engine.getState());
});

// Pagination controls
document.getElementById('next-page').addEventListener('click', () => {
  const pagination = engine.getPaginationState();
  if (pagination.currentPage < pagination.totalPages) {
    engine.setPagination({
      currentPage: pagination.currentPage + 1,
      pageSize: pagination.pageSize,
    });
    renderPivotTable(engine.getState());
    updatePaginationInfo();
  }
});

document.getElementById('prev-page').addEventListener('click', () => {
  const pagination = engine.getPaginationState();
  if (pagination.currentPage > 1) {
    engine.setPagination({
      currentPage: pagination.currentPage - 1,
      pageSize: pagination.pageSize,
    });
    renderPivotTable(engine.getState());
    updatePaginationInfo();
  }
});

function updatePaginationInfo() {
  const pagination = engine.getPaginationState();
  document.getElementById('pagination-info').textContent =
    `Page ${pagination.currentPage} of ${pagination.totalPages}`;
}

// Initial pagination info
updatePaginationInfo();
```

## Getting Started

### Step 1: Installation

First, install the PivotHead library using your package manager:

```bash
pnpm install @mindfiredigital/pivothead
```

### Step 2: Import and Initialize

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Prepare your data
const data = [
  // Your data array
];

// Create configuration
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
  ],
  dimensions: [
    // Your dimensions
  ],
};

// Initialize engine
const engine = new PivotEngine(config);
```

### Step 3: Render Your Pivot Table

```javascript
// Get the state
const state = engine.getState();

// Render your table using your preferred UI library or vanilla JS
// This will depend on your specific implementation
```

## Working with Measures

Measures are the values you want to analyze in your pivot table. PivotHead supports various aggregation types and custom formulas.

### Basic Measures

```javascript
const measures = [
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
];
```

### Custom Formula Measures

```javascript
const measures = [
  // Basic measures
  // ...
  {
    uniqueName: 'averagePrice',
    caption: 'Average Price',
    aggregation: 'custom',
    format: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    formula: item => item.sales / item.quantity,
  },
];
```

## Handling User Interactions

### Sorting

```javascript
// Sort by a specific field
sortButton.addEventListener('click', () => {
  engine.sort('sales', 'desc'); // or 'asc'
  renderPivotTable(engine.getState());
});
```

### Filtering

```javascript
// Apply multiple filters
filterButton.addEventListener('click', () => {
  engine.applyFilters([
    {
      field: 'region',
      operator: 'equals',
      value: 'North',
    },
    {
      field: 'date',
      operator: 'greaterThan',
      value: new Date('2024-01-15'),
    },
  ]);
  renderPivotTable(engine.getState());
});

// Clear filters
clearFiltersButton.addEventListener('click', () => {
  engine.applyFilters([]);
  renderPivotTable(engine.getState());
});
```

### Pagination

```javascript
// Setup pagination controls
nextPageButton.addEventListener('click', () => {
  const pagination = engine.getPaginationState();
  if (pagination.currentPage < pagination.totalPages) {
    engine.setPagination({
      currentPage: pagination.currentPage + 1,
      pageSize: pagination.pageSize,
    });
    renderPivotTable(engine.getState());
  }
});

prevPageButton.addEventListener('click', () => {
  const pagination = engine.getPaginationState();
  if (pagination.currentPage > 1) {
    engine.setPagination({
      currentPage: pagination.currentPage - 1,
      pageSize: pagination.pageSize,
    });
    renderPivotTable(engine.getState());
  }
});

// Change page size
pageSizeSelector.addEventListener('change', e => {
  engine.setPagination({
    currentPage: 1,
    pageSize: parseInt(e.target.value),
  });
  renderPivotTable(engine.getState());
});
```

## Advanced Customization

### Conditional Formatting

```javascript
const config = {
  // Other configuration options
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1500',
        value2: '',
      },
      format: {
        backgroundColor: '#e6f7ff', // Light blue for high values
        color: '#0066cc',
        bold: true,
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
        backgroundColor: '#ffe6e6', // Light red for low values
        color: '#cc0000',
        bold: true,
      },
    },
  ],
};
```

### Working with Events

```javascript
const config = {
  // Other configuration options
  onRowDragEnd: (fromIndex, toIndex, data) => {
    console.log(`Row moved from ${fromIndex} to ${toIndex}`);
    saveUserPreference(
      'rowOrder',
      data.map(item => item.id)
    );
  },
  onColumnDragEnd: (fromIndex, toIndex, columns) => {
    console.log(`Column moved from ${fromIndex} to ${toIndex}`);
    saveUserPreference(
      'columnOrder',
      columns.map(col => col.uniqueName)
    );
  },
};
```
