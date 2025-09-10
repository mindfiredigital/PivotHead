---
sidebar_position: 5
---

# PivotHead Web Component

The PivotHead Web Component provides a flexible, framework-agnostic solution for integrating pivot table functionality into any web application. Built as a native Web Component, it offers three distinct rendering modes to accommodate different use cases and UI requirements.

## Overview

The `@mindfiredigital/pivothead-web-component` package wraps the core PivotHead functionality in a custom HTML element (`<pivot-head>`). This approach ensures compatibility with any JavaScript framework or vanilla HTML while providing:

- **Framework Agnostic**: Works with React, Vue, Angular, or plain HTML
- **Three Rendering Modes**: Choose between full UI, slot-based, or headless implementation
- **Rich API**: Complete access to pivot functionality through properties, methods, and events
- **TypeScript Support**: Full type definitions included
- **Shadow DOM**: Encapsulated styles prevent CSS conflicts

## Installation

Install the web component package in your project:

```bash
npm install @mindfiredigital/pivothead-web-component
```

For polyfill support in older browsers:

```bash
npm install @webcomponents/webcomponentsjs
```

## Core Architecture

The web component is built around the following key concepts:

### Component Structure

- **Custom Element**: `<pivot-head>` registered as a native web component
- **Shadow DOM**: Encapsulated styling and DOM structure
- **Slot Support**: Named slots for custom content in minimal mode
- **Event System**: Custom events for state changes and user interactions

### Dependencies

- Built on top of `@mindfiredigital/pivothead` core engine
- Utilizes Rollup for bundling and TypeScript for type safety
- Peer dependency on Web Components polyfills for broader browser support

## Rendering Modes

The web component supports three distinct modes, controlled by the `mode` attribute:

### 1. Default Mode (Full UI)

In default mode, the component renders a complete pivot table interface with built-in controls, filters, and pagination.

**Usage:**

```html
<pivot-head
  data='[{"country":"Australia","category":"Electronics","price":1200}]'
  options='{
    "rows":[{"uniqueName":"country","caption":"Country"}],
    "columns":[{"uniqueName":"category","caption":"Category"}],
    "measures":[{"uniqueName":"price","caption":"Total Price","aggregation":"sum"}]
  }'
></pivot-head>
```

**Features:**

- Complete UI rendered by the component
- Built-in sorting, filtering, and pagination
- Export functionality (PDF, Excel, HTML)
- Print support
- Responsive design with shadow DOM styling

**When to Use:**

- Quick integration with minimal setup
- Standard pivot table requirements
- Prototyping and demos
- When you want full functionality out-of-the-box

### 2. Minimal Mode (Slot-based)

Minimal mode provides a lightweight container with named slots, giving you control over the UI while leveraging the component's data processing capabilities.

**Usage:**

```html
<pivot-head mode="minimal" data="[...]" options="{...}">
  <div slot="header">
    <!-- Your custom toolbar -->
    <button id="exportBtn">Export</button>
    <select id="pageSize">
      <option value="10">10</option>
      <option value="25">25</option>
    </select>
  </div>

  <div slot="body">
    <!-- Your custom table -->
    <table id="pivotTable">
      <!-- Table content populated via JavaScript -->
    </table>
  </div>
</pivot-head>
```

**Implementation Pattern:**

```javascript
import '@mindfiredigital/pivothead-web-component';

const pivot = document.getElementById('pivot');
const table = document.getElementById('pivotTable');

pivot.addEventListener('stateChange', e => {
  const state = e.detail;
  renderCustomTable(state.processedData);
});

function renderCustomTable(data) {
  // Your custom rendering logic
  const { headers, rows, totals } = data;
  // Populate your table element
}
```

**When to Use:**

- Custom UI requirements
- Brand-specific styling needs
- Integration with existing design systems
- Partial control over user interface

### 3. None Mode (Headless)

None mode provides pure data processing without any rendered UI. You have complete control over the presentation layer while accessing all pivot functionality.

**Usage:**

```html
<pivot-head id="pivot" mode="none" style="display: none;"></pivot-head>

<div id="customUI">
  <div class="toolbar">
    <button id="sortBtn">Sort</button>
    <select id="filterSelect"></select>
    <input id="filterInput" placeholder="Filter value" />
  </div>
  <table id="resultsTable"></table>
</div>
```

**Implementation Pattern:**

```javascript
import '@mindfiredigital/pivothead-web-component';

const pivot = document.getElementById('pivot');
const resultsTable = document.getElementById('resultsTable');

// Set data and options
pivot.data = yourDataArray;
pivot.options = yourPivotOptions;

// Listen for state changes
pivot.addEventListener('stateChange', e => {
  const state = e.detail;
  buildCompleteUI(state);
});

// Use component APIs
document.getElementById('sortBtn').onclick = () => {
  pivot.sort('fieldName', 'desc');
};

function buildCompleteUI(state) {
  // Full control over rendering
  // Access to state.processedData, state.rawData, etc.
}
```

**When to Use:**

- Complete UI customization required
- Integration with complex application layouts
- Custom interaction patterns
- Maximum flexibility needed

## Practical Examples

### Example 1: Default Mode Implementation

This example demonstrates the simplest integration using default mode:

<details>
<summary>Click to view the complete HTML example (Default Mode)</summary>

```html
<!DOCTYPE html>
<html>
  <head>
    <title>PivotHead Default Demo</title>
  </head>
  <body>
    <h2>Sales Analysis Dashboard</h2>

    <pivot-head
      data='[
      {"country":"Australia","category":"Accessories","price":174,"discount":23},
      {"country":"Australia","category":"Electronics","price":1200,"discount":120},
      {"country":"Canada","category":"Cars","price":1800,"discount":90},
      {"country":"USA","category":"Electronics","price":1500,"discount":150}
    ]'
      options='{
      "rows":[{"uniqueName":"country","caption":"Country"}],
      "columns":[{"uniqueName":"category","caption":"Category"}],
      "measures":[
        {"uniqueName":"price","caption":"Sum of Price","aggregation":"sum"},
        {"uniqueName":"discount","caption":"Sum of Discount","aggregation":"sum"}
      ],
      "pageSize":10
    }'
    ></pivot-head>

    <script type="module">
      import '@mindfiredigital/pivothead-web-component';

      const pivot = document.querySelector('pivot-head');
      pivot.addEventListener('stateChange', e => {
        console.log('Pivot state updated:', e.detail);
      });
    </script>
  </body>
</html>
```

</details>

### Example 2: Minimal Mode with Custom Controls

This example shows how to use minimal mode with custom toolbar controls:

<details>
<summary>Click to view the complete HTML example (Minimal Mode)</summary>

```html
<!DOCTYPE html>
<html>
  <head>
    <title>PivotHead Minimal Demo</title>
    <style>
      .custom-toolbar {
        display: flex;
        gap: 10px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
      }
      .custom-table th,
      .custom-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .custom-table th {
        background-color: #4caf50;
        color: white;
      }
    </style>
  </head>
  <body>
    <h2>Custom Pivot Interface</h2>

    <pivot-head id="pivot" mode="minimal">
      <div slot="header" class="custom-toolbar">
        <label>Filter Field:</label>
        <select id="filterField"></select>
        <input type="text" id="filterValue" placeholder="Enter value" />
        <button id="applyFilter">Apply Filter</button>
        <button id="resetFilter">Reset</button>

        <div style="margin-left: auto;">
          <label>Page Size:</label>
          <select id="pageSize">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="25">25</option>
          </select>
          <button id="exportPDF">Export PDF</button>
        </div>
      </div>

      <div slot="body">
        <table id="pivotTable" class="custom-table">
          <thead id="tableHead"></thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </pivot-head>

    <script type="module">
      import '@mindfiredigital/pivothead-web-component';

      const pivot = document.getElementById('pivot');
      const tableHead = document.getElementById('tableHead');
      const tableBody = document.getElementById('tableBody');
      const filterField = document.getElementById('filterField');

      // Sample data
      const sampleData = [
        {
          country: 'Australia',
          category: 'Accessories',
          price: 174,
          discount: 23,
        },
        { country: 'Canada', category: 'Cars', price: 180, discount: 80 },
        { country: 'USA', category: 'Electronics', price: 1500, discount: 150 },
      ];

      const options = {
        rows: [{ uniqueName: 'country', caption: 'Country' }],
        columns: [{ uniqueName: 'category', caption: 'Category' }],
        measures: [
          { uniqueName: 'price', caption: 'Price', aggregation: 'sum' },
          { uniqueName: 'discount', caption: 'Discount', aggregation: 'sum' },
        ],
      };

      // Set data
      pivot.setAttribute('data', JSON.stringify(sampleData));
      pivot.setAttribute('options', JSON.stringify(options));

      // Listen for state changes
      pivot.addEventListener('stateChange', e => {
        const state = e.detail;
        renderTable(state.processedData);
        populateFilterOptions(state);
      });

      function renderTable(data) {
        // Render headers
        const headerRow = document.createElement('tr');
        data.headers.forEach(header => {
          const th = document.createElement('th');
          th.textContent = header;
          headerRow.appendChild(th);
        });
        tableHead.innerHTML = '';
        tableHead.appendChild(headerRow);

        // Render rows
        tableBody.innerHTML = '';
        data.rows.forEach(row => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          tableBody.appendChild(tr);
        });
      }

      function populateFilterOptions(state) {
        filterField.innerHTML = '';
        [...state.rows, ...state.columns].forEach(field => {
          const option = document.createElement('option');
          option.value = field.uniqueName;
          option.textContent = field.caption;
          filterField.appendChild(option);
        });
      }

      // Event handlers
      document.getElementById('applyFilter').onclick = () => {
        const field = filterField.value;
        const value = document.getElementById('filterValue').value;
        if (field && value) {
          pivot.addFilter(field, 'contains', value);
        }
      };

      document.getElementById('resetFilter').onclick = () => {
        pivot.clearFilters();
      };

      document.getElementById('pageSize').onchange = e => {
        pivot.setPageSize(parseInt(e.target.value));
      };

      document.getElementById('exportPDF').onclick = () => {
        pivot.exportToPDF();
      };
    </script>
  </body>
</html>
```

</details>

### Example 3: Headless Mode with Full Custom UI

This example demonstrates complete UI control using none mode:

<details>
<summary>Click to view the complete HTML example (None/Headless Mode)</summary>

```html
<!DOCTYPE html>
<html>
  <head>
    <title>PivotHead Headless Demo</title>
    <style>
      .dashboard {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 20px;
        height: 100vh;
      }
      .controls {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
      }
      .control-group {
        margin-bottom: 20px;
      }
      .results {
        overflow: auto;
      }
      .pivot-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      .pivot-table th {
        background: #007bff;
        color: white;
        padding: 12px 8px;
        text-align: left;
        position: sticky;
        top: 0;
      }
      .pivot-table td {
        padding: 8px;
        border-bottom: 1px solid #dee2e6;
      }
      .pivot-table tr:hover {
        background-color: #f5f5f5;
      }
      .summary-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }
      .stat-card {
        background: white;
        padding: 15px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex: 1;
      }
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
      }
    </style>
  </head>
  <body>
    <!-- Hidden web component -->
    <pivot-head id="pivot" mode="none"></pivot-head>

    <div class="dashboard">
      <div class="controls">
        <h3>Pivot Configuration</h3>

        <div class="control-group">
          <label>View Mode:</label>
          <select id="viewMode">
            <option value="processed">Processed Data</option>
            <option value="raw">Raw Data</option>
          </select>
        </div>

        <div class="control-group">
          <label>Sort Field:</label>
          <select id="sortField"></select>
          <select id="sortDir">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <button id="applySortBtn">Apply Sort</button>
        </div>

        <div class="control-group">
          <label>Filter:</label>
          <select id="filterFieldSelect"></select>
          <select id="filterOperator">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" id="filterValueInput" placeholder="Value" />
          <button id="applyFilterBtn">Apply</button>
          <button id="clearFiltersBtn">Clear All</button>
        </div>

        <div class="control-group">
          <label>Page Size:</label>
          <select id="pageSizeSelect">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div class="control-group">
          <h4>Export Options</h4>
          <button id="exportHTMLBtn">Export HTML</button>
          <button id="exportPDFBtn">Export PDF</button>
          <button id="exportExcelBtn">Export Excel</button>
          <button id="printBtn">Print</button>
        </div>
      </div>

      <div class="results">
        <h2>Sales Analysis Results</h2>

        <div class="summary-stats" id="summaryStats">
          <!-- Dynamic summary cards -->
        </div>

        <div class="pagination" id="paginationControls">
          <!-- Pagination controls -->
        </div>

        <table class="pivot-table" id="resultsTable">
          <thead id="tableHeaders"></thead>
          <tbody id="tableRows"></tbody>
        </table>
      </div>
    </div>

    <script type="module">
      import '@mindfiredigital/pivothead-web-component';

      const pivot = document.getElementById('pivot');

      // Sample data
      const salesData = [
        {
          country: 'Australia',
          category: 'Accessories',
          price: 174,
          discount: 23,
          quantity: 5,
        },
        {
          country: 'Australia',
          category: 'Electronics',
          price: 1200,
          discount: 120,
          quantity: 2,
        },
        {
          country: 'Canada',
          category: 'Cars',
          price: 1800,
          discount: 90,
          quantity: 1,
        },
        {
          country: 'USA',
          category: 'Electronics',
          price: 1500,
          discount: 150,
          quantity: 3,
        },
        {
          country: 'Germany',
          category: 'Cars',
          price: 2200,
          discount: 110,
          quantity: 1,
        },
        {
          country: 'France',
          category: 'Accessories',
          price: 380,
          discount: 38,
          quantity: 8,
        },
      ];

      const pivotOptions = {
        rows: [{ uniqueName: 'country', caption: 'Country' }],
        columns: [{ uniqueName: 'category', caption: 'Category' }],
        measures: [
          { uniqueName: 'price', caption: 'Total Price', aggregation: 'sum' },
          {
            uniqueName: 'discount',
            caption: 'Total Discount',
            aggregation: 'sum',
          },
          {
            uniqueName: 'quantity',
            caption: 'Total Quantity',
            aggregation: 'sum',
          },
        ],
        pageSize: 10,
      };

      // Initialize component
      pivot.setAttribute('data', JSON.stringify(salesData));
      pivot.setAttribute('options', JSON.stringify(pivotOptions));

      let currentState = null;

      // Listen for state changes
      pivot.addEventListener('stateChange', e => {
        currentState = e.detail;
        renderDashboard(currentState);
        populateControlOptions(currentState);
      });

      function renderDashboard(state) {
        renderSummaryStats(state);
        renderTable(state);
        renderPagination(state);
      }

      function renderSummaryStats(state) {
        const summaryStats = document.getElementById('summaryStats');
        const data = state.processedData;

        // Calculate summary statistics
        const totalRows = data.rows.length;
        const totalCountries = new Set(salesData.map(item => item.country))
          .size;
        const totalRevenue = salesData.reduce(
          (sum, item) => sum + item.price,
          0
        );

        summaryStats.innerHTML = `
        <div class="stat-card">
          <div>Total Records</div>
          <div class="stat-value">${totalRows}</div>
        </div>
        <div class="stat-card">
          <div>Countries</div>
          <div class="stat-value">${totalCountries}</div>
        </div>
        <div class="stat-card">
          <div>Total Revenue</div>
          <div class="stat-value">$${totalRevenue.toLocaleString()}</div>
        </div>
      `;
      }

      function renderTable(state) {
        const headers = document.getElementById('tableHeaders');
        const rows = document.getElementById('tableRows');
        const data = state.processedData;

        // Render headers
        headers.innerHTML = '';
        const headerRow = document.createElement('tr');
        data.headers.forEach(header => {
          const th = document.createElement('th');
          th.textContent = header;
          th.style.cursor = 'pointer';
          th.onclick = () => sortByColumn(header);
          headerRow.appendChild(th);
        });
        headers.appendChild(headerRow);

        // Render rows
        rows.innerHTML = '';
        data.rows.forEach(row => {
          const tr = document.createElement('tr');
          row.forEach((cell, index) => {
            const td = document.createElement('td');
            // Format numbers if they appear to be currency
            if (
              typeof cell === 'number' &&
              data.headers[index].includes('Price')
            ) {
              td.textContent = `$${cell.toLocaleString()}`;
            } else {
              td.textContent = cell;
            }
            tr.appendChild(td);
          });
          rows.appendChild(tr);
        });
      }

      function renderPagination(state) {
        const pagination = state.pagination || {};
        const controls = document.getElementById('paginationControls');

        if (pagination.totalPages > 1) {
          controls.innerHTML = `
          <button onclick="previousPage()" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
          <span>Page ${pagination.currentPage} of ${pagination.totalPages}</span>
          <button onclick="nextPage()" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
        `;
        } else {
          controls.innerHTML = '';
        }
      }

      function populateControlOptions(state) {
        // Populate sort fields
        const sortField = document.getElementById('sortField');
        const filterField = document.getElementById('filterFieldSelect');

        sortField.innerHTML = '';
        filterField.innerHTML = '';

        // Add row fields
        state.rows?.forEach(row => {
          sortField.innerHTML += `<option value="${row.uniqueName}">${row.caption}</option>`;
          filterField.innerHTML += `<option value="${row.uniqueName}">${row.caption}</option>`;
        });

        // Add column fields
        state.columns?.forEach(col => {
          sortField.innerHTML += `<option value="${col.uniqueName}">${col.caption}</option>`;
          filterField.innerHTML += `<option value="${col.uniqueName}">${col.caption}</option>`;
        });
      }

      function sortByColumn(columnName) {
        pivot.sort(columnName, 'asc');
      }

      // Global functions for pagination
      window.previousPage = () => {
        if (currentState?.pagination?.currentPage > 1) {
          pivot.previousPage();
        }
      };

      window.nextPage = () => {
        if (
          currentState?.pagination?.currentPage <
          currentState?.pagination?.totalPages
        ) {
          pivot.nextPage();
        }
      };

      // Event handlers
      document.getElementById('applySortBtn').onclick = () => {
        const field = document.getElementById('sortField').value;
        const direction = document.getElementById('sortDir').value;
        pivot.sort(field, direction);
      };

      document.getElementById('applyFilterBtn').onclick = () => {
        const field = document.getElementById('filterFieldSelect').value;
        const operator = document.getElementById('filterOperator').value;
        const value = document.getElementById('filterValueInput').value;

        if (field && value) {
          pivot.addFilter(field, operator, value);
        }
      };

      document.getElementById('clearFiltersBtn').onclick = () => {
        pivot.clearFilters();
      };

      document.getElementById('pageSizeSelect').onchange = e => {
        pivot.setPageSize(parseInt(e.target.value));
      };

      document.getElementById('viewMode').onchange = e => {
        pivot.setViewMode(e.target.value);
      };

      // Export handlers
      document.getElementById('exportHTMLBtn').onclick = () =>
        pivot.exportToHTML();
      document.getElementById('exportPDFBtn').onclick = () =>
        pivot.exportToPDF();
      document.getElementById('exportExcelBtn').onclick = () =>
        pivot.exportToExcel();
      document.getElementById('printBtn').onclick = () => pivot.print();
    </script>
  </body>
</html>
```

</details>

## API Reference

### Properties

| Property     | Type          | Description                 | Example                                          |
| ------------ | ------------- | --------------------------- | ------------------------------------------------ |
| `data`       | string (JSON) | The dataset to be processed | `'[{"name":"John","age":30}]'`                   |
| `options`    | string (JSON) | Pivot configuration options | `'{"rows":[...],"columns":[...]}'`               |
| `mode`       | string        | Rendering mode              | `"default" \| "minimal" \| "none"`               |
| `filters`    | string (JSON) | Filter configuration        | `'[{"field":"age","operator":"gt","value":25}]'` |
| `pagination` | string (JSON) | Pagination settings         | `'{"pageSize":10,"currentPage":1}'`              |

### Methods

| Method                              | Parameters                                    | Returns           | Description                 |
| ----------------------------------- | --------------------------------------------- | ----------------- | --------------------------- |
| `getState()`                        | -                                             | `PivotTableState` | Get current component state |
| `refresh()`                         | -                                             | `void`            | Refresh the pivot engine    |
| `sort(field, direction)`            | `field: string, direction: 'asc' \| 'desc'`   | `void`            | Sort data by field          |
| `addFilter(field, operator, value)` | `field: string, operator: string, value: any` | `void`            | Add a filter                |
| `clearFilters()`                    | -                                             | `void`            | Remove all filters          |
| `setPageSize(size)`                 | `size: number`                                | `void`            | Set pagination page size    |
| `nextPage()`                        | -                                             | `void`            | Navigate to next page       |
| `previousPage()`                    | -                                             | `void`            | Navigate to previous page   |
| `exportToPDF()`                     | -                                             | `void`            | Export data as PDF          |
| `exportToExcel()`                   | -                                             | `void`            | Export data as Excel        |
| `exportToHTML()`                    | -                                             | `void`            | Export data as HTML         |
| `print()`                           | -                                             | `void`            | Print the pivot table       |
| `setViewMode(mode)`                 | `mode: 'processed' \| 'raw'`                  | `void`            | Switch view mode            |
| `getRawData()`                      | -                                             | `Array`           | Get original dataset        |
| `getProcessedData()`                | -                                             | `Object`          | Get processed pivot data    |

### Events

| Event          | Detail Type       | Description                       | Usage                              |
| -------------- | ----------------- | --------------------------------- | ---------------------------------- |
| `stateChange`  | `PivotTableState` | Fired when internal state changes | Monitor data updates, re-render UI |
| `filterChange` | `FilterState`     | Fired when filters are modified   | React to filter updates            |
| `sortChange`   | `SortState`       | Fired when sorting is applied     | Track sorting changes              |
| `pageChange`   | `PaginationState` | Fired when page changes           | Handle pagination events           |

### Browser Support

- **Modern Browsers**: Chrome 67+, Firefox 63+, Safari 12+, Edge 79+
- **Legacy Support**: Use @webcomponents/webcomponentsjs polyfill
- **Mobile**: iOS Safari 12+, Chrome Mobile 67+

### Performance Considerations

- **Large Datasets**: Use pagination and virtualization
- **Frequent Updates**: Implement debouncing
- **Memory Usage**: Clean up event listeners and references
- **Bundle Size**: Import only needed functionality

## Conclusion

The PivotHead Web Component provides a powerful, flexible solution for integrating pivot table functionality into any web application. Whether you need a quick drop-in solution (default mode), customizable UI (minimal mode), or complete control (none mode), the component adapts to your requirements while maintaining consistency and performance.

The three-mode architecture ensures that you can start simple and scale complexity as needed, making it suitable for everything from simple data displays to complex analytical dashboards. With comprehensive TypeScript support, framework integration options, and extensive API coverage, the web component serves as a robust foundation for data visualization needs.
