---
id: basic-setup
title: Basic Setup
sidebar_label: Basic Setup
---

# **Basic Setup**

Once you've installed the appropriate PivotHead package for your framework, the basic setup is straightforward. You'll need to:

1.  **Import PivotHead:** Import the necessary functions or components from the PivotHead package.
2.  **Provide Data:** Pass your data to PivotHead. This can be an array of objects or any other supported data format.
3.  **Configure Dimensions:** Define the rows, columns, and measures for your pivot table.
4.  **Render the UI:** Use the output from PivotHead to render your custom pivot table UI.

Here's a basic example of how you might set up a **headless pivot table** with PivotHead:

```javascript
import { PivotEngine } from '@mindfiredigital/pivothead';

// Step 1: Prepare your data
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
    quantity: 60,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 1200,
    quantity: 55,
  },
  {
    date: '2024-01-02',
    product: 'Widget B',
    region: 'West',
    sales: 1800,
    quantity: 70,
  },
  // ... more data
];

// Step 2: Create your configuration
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

// Step 3: Initialize the pivot engine
const engine = new PivotEngine(config);

// Step 4: Use the engine to render your pivot table
// (Actual rendering will depend on your UI framework)
```

## **Understanding the Configuration**

Let's break down the key parts of the configuration:

### **Data**

This is your raw dataset, typically an array of objects.

### **Rows and Columns**

These define the structure of your pivot table:

```javascript
rows: [{ uniqueName: 'product', caption: 'Product' }],
columns: [{ uniqueName: 'region', caption: 'Region' }],
```

This configuration will create a table with products as rows and regions as columns.

### **Measures**

Measures are the values that will be calculated and displayed in the cells:

```javascript
measures: [
  {
    uniqueName: 'sales',       // Field name in your data
    caption: 'Total Sales',    // Display name
    aggregation: 'sum',        // How to aggregate values
    format: {                  // How to format the display
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
  },
],
```

### **Dimensions**

Dimensions define the fields available for use in rows, columns, or filters:

```javascript
dimensions: [
  { field: 'product', label: 'Product', type: 'string' },
  { field: 'region', label: 'Region', type: 'string' },
  { field: 'date', label: 'Date', type: 'date' },
  { field: 'sales', label: 'Sales', type: 'number' },
  { field: 'quantity', label: 'Quantity', type: 'number' },
],
```

## **Rendering Your First Pivot Table**

After creating the PivotEngine, you'll need to render the results. Here's a simple example using vanilla JavaScript:

```javascript
// Get a reference to your container element
const container = document.getElementById('pivot-container');

// Function to render the pivot table
function renderPivotTable() {
  // Get the current state from the engine
  const state = engine.getState();

  // Clear the container
  container.innerHTML = '';

  // Create table element
  const table = document.createElement('table');
  table.className = 'pivot-table';

  // Create header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Add empty cell for top-left corner
  headerRow.appendChild(document.createElement('th'));

  // Add column headers
  state.columnHeaders.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.caption;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');

  // Add rows
  state.data.forEach(row => {
    const tr = document.createElement('tr');

    // Add row header
    const th = document.createElement('th');
    th.textContent = row.rowHeader;
    tr.appendChild(th);

    // Add cells
    state.columnHeaders.forEach(column => {
      const td = document.createElement('td');
      const value = row[column.uniqueName] || 0;
      td.textContent = engine.formatValue(value, 'sales');
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Initial render
renderPivotTable();
```

## **Complete Example**

Here's a complete example that you can copy and paste into an HTML file to get started:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PivotHead Example</title>
    <style>
      .pivot-table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      }
      .pivot-table th,
      .pivot-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: right;
      }
      .pivot-table th {
        background-color: #f2f2f2;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <h1>PivotHead Example</h1>
    <div id="pivot-container"></div>

    <script type="module">
      import { PivotEngine } from 'https://cdn.jsdelivr.net/npm/@mindfiredigital/pivothead/dist/index.js';

      // Sample data
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
          quantity: 60,
        },
        {
          date: '2024-01-02',
          product: 'Widget A',
          region: 'East',
          sales: 1200,
          quantity: 55,
        },
        {
          date: '2024-01-02',
          product: 'Widget B',
          region: 'West',
          sales: 1800,
          quantity: 70,
        },
      ];

      // Configuration
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

      // Initialize the engine
      const engine = new PivotEngine(config);

      // Render function (simplified for demo)
      function renderPivotTable() {
        const container = document.getElementById('pivot-container');
        container.innerHTML =
          '<pre>' + JSON.stringify(engine.getState(), null, 2) + '</pre>';
      }

      // Initial render
      renderPivotTable();
    </script>
  </body>
</html>
```

With these basics in place, you're ready to start building powerful data visualization tools with PivotHead!
