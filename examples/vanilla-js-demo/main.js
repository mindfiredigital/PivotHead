/**
 * PivotHead Demo
 *
 * This file demonstrates the usage of the PivotheadCore library to create an interactive pivot table.
 * Features include:
 * - Sorting
 * - Grouping
 * - Column resizing
 * - Column reordering (drag and drop)
 * - Row reordering (drag and drop)
 */

if (typeof PivotheadCore === 'undefined') {
  console.error(
    'PivotheadCore is not defined. Make sure the library is loaded correctly.',
  );
}

// Importing the Package
const { PivotEngine } = PivotheadCore;

// Dummy data.
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
  {
    date: '2024-01-01',
    product: 'Widget D',
    region: 'North',
    sales: 1300,
    quantity: 70,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 1200,
    quantity: 60,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 100,
    quantity: 44,
  },
  {
    date: '2024-01-02',
    product: 'Widget C',
    region: 'West',
    sales: 800,
    quantity: 40,
  },
  {
    date: '2024-01-03',
    product: 'Widget B',
    region: 'North',
    sales: 1800,
    quantity: 90,
  },
  {
    date: '2024-01-03',
    product: 'Widget C',
    region: 'South',
    sales: 1100,
    quantity: 55,
  },
  {
    date: '2024-01-04',
    product: 'Widget A',
    region: 'West',
    sales: 1300,
    quantity: 65,
  },
  {
    date: '2024-01-04',
    product: 'Widget B',
    region: 'East',
    sales: 1600,
    quantity: 80,
  },
];

// Updated configuration for the pivot table
const config = {
  data: data,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: { type: 'currency', currency: 'USD' },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: { type: 'number' },
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: { type: 'currency', currency: 'USD' },
      formula: (item) => item.sales / item.quantity,
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
    grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
  },
};
// Initialize PivotEngine
let engine = new PivotEngine(config);

function createControlPanel() {
  const controlPanel = document.createElement('div');
  controlPanel.className = 'control-panel';
  controlPanel.style.display = 'flex';
  controlPanel.style.flexWrap = 'wrap';
  controlPanel.style.gap = '20px';
  controlPanel.style.marginBottom = '20px';
  controlPanel.style.padding = '10px';
  controlPanel.style.backgroundColor = '#f8f9fa';
  controlPanel.style.border = '1px solid #dee2e6';
  controlPanel.style.borderRadius = '4px';

  const rowsPanel = createAxisPanel('Rows', config.dimensions);
  const columnsPanel = createAxisPanel('Columns', config.dimensions);
  const measuresPanel = createMeasuresPanel();
  const aggregationPanel = createAggregationPanel();

  controlPanel.appendChild(rowsPanel);
  controlPanel.appendChild(columnsPanel);
  controlPanel.appendChild(measuresPanel);
  controlPanel.appendChild(aggregationPanel);

  return controlPanel;
}

function createAxisPanel(title, options) {
  const panel = document.createElement('div');
  panel.className = 'axis-panel';
  panel.style.flex = '1';
  panel.style.minWidth = '200px';

  const panelTitle = document.createElement('h3');
  panelTitle.textContent = title;
  panel.appendChild(panelTitle);

  const select = document.createElement('select');
  select.multiple = true;
  select.style.width = '100%';
  select.style.height = '100px';

  options.forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option.field;
    optionElement.textContent = option.label;
    select.appendChild(optionElement);
  });

  select.addEventListener('change', () => {
    const selectedFields = Array.from(select.selectedOptions).map((option) => ({
      uniqueName: option.value,
      caption: option.textContent,
    }));
    if (title === 'Rows') {
      engine.state.rows = selectedFields;
    } else {
      engine.state.columns = selectedFields;
    }
    renderTable();
  });

  panel.appendChild(select);
  return panel;
}

function createMeasuresPanel() {
  const panel = document.createElement('div');
  panel.className = 'measures-panel';
  panel.style.flex = '1';
  panel.style.minWidth = '200px';

  const panelTitle = document.createElement('h3');
  panelTitle.textContent = 'Measures';
  panel.appendChild(panelTitle);

  const select = document.createElement('select');
  select.multiple = true;
  select.style.width = '100%';
  select.style.height = '100px';

  config.measures.forEach((measure) => {
    const optionElement = document.createElement('option');
    optionElement.value = measure.uniqueName;
    optionElement.textContent = measure.caption;
    select.appendChild(optionElement);
  });

  select.addEventListener('change', () => {
    const selectedMeasures = Array.from(select.selectedOptions).map((option) =>
      config.measures.find((m) => m.uniqueName === option.value),
    );
    engine.setMeasures(selectedMeasures);
    renderTable();
  });

  panel.appendChild(select);
  return panel;
}

function createAggregationPanel() {
  const panel = document.createElement('div');
  panel.className = 'aggregation-panel';
  panel.style.flex = '1';
  panel.style.minWidth = '200px';

  const panelTitle = document.createElement('h3');
  panelTitle.textContent = 'Aggregation';
  panel.appendChild(panelTitle);

  const select = document.createElement('select');
  select.style.width = '100%';

  ['sum', 'avg', 'count', 'min', 'max'].forEach((agg) => {
    const optionElement = document.createElement('option');
    optionElement.value = agg;
    optionElement.textContent = agg.toUpperCase();
    select.appendChild(optionElement);
  });

  select.addEventListener('change', (event) => {
    engine.setAggregation(event.target.value);
    renderTable();
  });

  panel.appendChild(select);
  return panel;
}

function renderTable() {
  const state = engine.getState();
  const container = document.getElementById('pivotTable');
  if (!container) {
    console.error('Container element with id "pivotTable" not found');
    return;
  }

  container.innerHTML = '';
  container.appendChild(createControlPanel());

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '20px';

  const thead = document.createElement('thead');

  // First header row for columns
  const columnHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  const emptyHeaderCell = document.createElement('th');
  emptyHeaderCell.style.padding = '10px';
  emptyHeaderCell.style.backgroundColor = '#f0f0f0';
  emptyHeaderCell.style.borderBottom = '2px solid #ddd';
  columnHeaderRow.appendChild(emptyHeaderCell);

  // Get unique column values based on the configured column fields
  const columnField = state.columns[0]?.uniqueName;
  const uniqueColumnValues = columnField
    ? [...new Set(data.map((item) => item[columnField]))]
    : [];

  // Add column headers with colspan
  uniqueColumnValues.forEach((value) => {
    const th = document.createElement('th');
    th.textContent = value;
    th.colSpan = state.measures.length;
    th.style.padding = '10px';
    th.style.backgroundColor = '#f0f0f0';
    th.style.borderBottom = '2px solid #ddd';
    columnHeaderRow.appendChild(th);
  });

  thead.appendChild(columnHeaderRow);

  // Second header row for measures
  const measureHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  const emptyMeasureCell = document.createElement('th');
  emptyMeasureCell.style.padding = '10px';
  emptyMeasureCell.style.backgroundColor = '#f0f0f0';
  emptyMeasureCell.style.borderBottom = '2px solid #ddd';
  measureHeaderRow.appendChild(emptyMeasureCell);

  // Add measure headers for each column value
  uniqueColumnValues.forEach(() => {
    state.measures.forEach((measure) => {
      const th = document.createElement('th');
      th.textContent = measure.caption;
      th.style.padding = '10px';
      th.style.backgroundColor = '#f0f0f0';
      th.style.borderBottom = '2px solid #ddd';
      measureHeaderRow.appendChild(th);
    });
  });

  thead.appendChild(measureHeaderRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  const rowField = state.rows[0]?.uniqueName;
  const groupedData = rowField ? groupData(data, [rowField]) : {};

  Object.entries(groupedData).forEach(([groupKey, groupItems]) => {
    const tr = document.createElement('tr');

    // Add row header
    const rowHeaderCell = document.createElement('td');
    rowHeaderCell.textContent = groupKey;
    rowHeaderCell.style.padding = '10px';
    rowHeaderCell.style.borderBottom = '1px solid #ddd';
    rowHeaderCell.style.fontWeight = 'bold';
    tr.appendChild(rowHeaderCell);

    // Add data cells for each column value
    uniqueColumnValues.forEach((columnValue) => {
      const columnItems = groupItems.filter(
        (item) => item[columnField] === columnValue,
      );

      state.measures.forEach((measure) => {
        const td = document.createElement('td');
        td.style.padding = '10px';
        td.style.borderBottom = '1px solid #ddd';
        td.style.textAlign = 'right';

        if (columnItems.length > 0) {
          let value;
          if (measure.formula && typeof measure.formula === 'function') {
            // For custom measures with a formula
            value =
              columnItems.reduce(
                (sum, item) => sum + measure.formula(item),
                0,
              ) / columnItems.length;
          } else {
            // For standard measures
            value = columnItems.reduce(
              (sum, item) => sum + (item[measure.uniqueName] || 0),
              0,
            );
          }

          // Apply the measure's aggregation if specified
          if (measure.aggregation === 'avg') {
            value /= columnItems.length;
          } else if (measure.aggregation === 'count') {
            value = columnItems.length;
          } // 'sum' is default, 'min' and 'max' would need additional logic

          td.textContent = engine.formatValue(value, measure.uniqueName);
        } else {
          td.textContent = engine.formatValue(0, measure.uniqueName);
        }

        tr.appendChild(td);
      });
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function groupData(data, groupFields) {
  return data.reduce((acc, item) => {
    const key = groupFields.map((field) => item[field]).join(' - ');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

// Initialize the table when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const pivotTableContainer = document.getElementById('pivotTable');

  if (!pivotTableContainer) {
    console.error(
      'Pivot table container (#pivotTable) is missing. Ensure the HTML structure is correct.',
    );
    return;
  }

  renderTable();
});
