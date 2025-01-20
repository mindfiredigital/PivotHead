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
import { createHeader } from './header.js';
import { conditionFormattingPopUp } from './conditionFormattingPopUp.js';
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
    product: 'Widget A',
    region: 'East',
    sales: 50,
    quantity: 10,
  },
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'West',
    sales: 90,
    quantity: 7,
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
      format: { 
        type: 'currency', 
        currency: 'USD',
        locale: 'en-US',
        decimals: 4
      },
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: { 
        type: 'number',
        decimals: 2,
        locale: 'en-US'
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
        decimals: 4
      },
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
  formatting: {
    sales: { 
      type: 'currency', 
      currency: 'USD',
      locale: 'en-US',
      decimals: 4
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
      decimals: 4
    }
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
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#F44336',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Between',
        value1: '500',
        value2: '1000',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#000000',
        backgroundColor: '#FFC107',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '50',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#2196F3',
      },
    },
  ],
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
  // const sortPanel = createSortPanel(); 

  controlPanel.appendChild(rowsPanel);
  controlPanel.appendChild(columnsPanel);
  controlPanel.appendChild(measuresPanel);
  controlPanel.appendChild(aggregationPanel);
  // controlPanel.appendChild(sortPanel); 

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

//TODO: Uncomment when sort featur works.
// function createSortPanel() {
//   const panel = document.createElement('div');
//   panel.className = 'sort-panel';
//   panel.style.flex = '1';
//   panel.style.minWidth = '200px';

//   const panelTitle = document.createElement('h3');
//   panelTitle.textContent = 'Sort';
//   panel.appendChild(panelTitle);

//   const fieldSelect = document.createElement('select');
//   fieldSelect.id = 'sortField';
//   fieldSelect.style.width = '100%';
//   fieldSelect.style.marginBottom = '10px';

//   const directionSelect = document.createElement('select');
//   directionSelect.id = 'sortDirection';
//   directionSelect.style.width = '100%';
//   directionSelect.style.marginBottom = '10px';

//   const axisSelect = document.createElement('select');
//   axisSelect.id = 'sortAxis';
//   axisSelect.style.width = '100%';
//   axisSelect.style.marginBottom = '10px';

//   // Populate field options
//   config.dimensions.forEach((dim) => {
//     const option = document.createElement('option');
//     option.value = dim.field;
//     option.textContent = dim.label;
//     fieldSelect.appendChild(option);
//   });

//   // Add measure fields for sorting
//   config.measures.forEach((measure) => {
//     const option = document.createElement('option');
//     option.value = measure.uniqueName;
//     option.textContent = measure.caption;
//     fieldSelect.appendChild(option);
//   });

//   // Populate direction options
//   ['asc', 'desc'].forEach((dir) => {
//     const option = document.createElement('option');
//     option.value = dir;
//     option.textContent = dir.toUpperCase();
//     directionSelect.appendChild(option);
//   });

//   // Populate axis options
//   ['row', 'column'].forEach((axis) => {
//     const option = document.createElement('option');
//     option.value = axis;
//     option.textContent = axis.charAt(0).toUpperCase() + axis.slice(1);
//     axisSelect.appendChild(option);
//   });

//   const applyButton = document.createElement('button');
//   applyButton.textContent = 'Apply Sort';
//   applyButton.style.width = '100%';
//   applyButton.addEventListener('click', () => {
//     const field = fieldSelect.value;
//     const direction = directionSelect.value;
//     const axis = axisSelect.value;
//     // TODO: Implement sorting logic
//     console.log(`Sorting ${field} ${direction} on ${axis}`);
//     renderTable();
//   });

//   panel.appendChild(fieldSelect);
//   panel.appendChild(directionSelect);
//   panel.appendChild(axisSelect);
//   panel.appendChild(applyButton);

//   return panel;
// }


export function onSectionItemDrop(droppedFields) {
  let droppedFieldsInSections=JSON.stringify({
    rows: Array.from(droppedFields.rows),
    columns: Array.from(droppedFields.columns),
    values: Array.from(droppedFields.values),
    filters: Array.from(droppedFields.filters)
  });
  const parsedDroppedFieldsInSections=JSON.parse(droppedFieldsInSections)

  const transformedRows=parsedDroppedFieldsInSections.rows.map((rowField)=>{ return { uniqueName:rowField.toLowerCase(), caption:rowField}});
        const transformedColumns=parsedDroppedFieldsInSections.columns.map((columnField)=>{ return { uniqueName:columnField.toLowerCase(), caption:columnField}});
        // const transformedValues=parsedDroppedFieldsInSections.values.map((valueField)=>{ return { uniqueName:valueField.toLowerCase(), caption:valueField}})
        // const transformedFilters=parsedDroppedFieldsInSections.filters.map((filterField)=>{ return { uniqueName:filterField.toLowerCase(), caption:filterField}})

        //TODO: for now only-applicable to rows and columns, will do the same for values and global filters in next iteration
        engine.state.rows=transformedRows;
        engine.state.columns=transformedColumns;

        renderTable();
}

function renderTable() {
  const state = engine.getState();
  const container = document.getElementById('pivotTable');
  if (!container) {
    console.error('Container element with id "pivotTable" not found');
    return;
  }

  container.innerHTML = '';
  // container.appendChild(createControlPanel());

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '20px';
  table.style.border = '1px solid #dee2e6';

  const thead = document.createElement('thead');
  renderTableHeader(thead, state);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const rowFields = state.rows.map((r) => r.uniqueName);
  const groupedData = groupData(data, rowFields);

  renderGroupedRows(tbody, groupedData, state, 0);

  table.appendChild(tbody);

  const tableWrapper = document.createElement('div');
  tableWrapper.style.overflowX = 'auto';
  tableWrapper.style.maxWidth = '100%';

  tableWrapper.appendChild(table);

  container.appendChild(tableWrapper);
}

function renderGroupedRows(tbody, groups, state, level) {
  const columnField = state.columns[0]?.uniqueName;
  const uniqueColumnValues = columnField
    ? [...new Set(data.map((item) => item[columnField]))]
    : [];

  Object.entries(groups).forEach(([key, value]) => {
    const tr = document.createElement('tr');

    // Add group header cells
    const groupKeys = key.split(' - ');
    (state.rows || []).forEach((row, index) => {
      // Update: Added null check for state.rows
      const headerCell = document.createElement('td');
      headerCell.style.padding = '12px';
      headerCell.style.paddingLeft =
        index === 0 ? `${level * 20 + 10}px` : '12px';
      headerCell.style.borderBottom = '1px solid #dee2e6';
      headerCell.style.fontWeight = 'bold';
      headerCell.textContent = index < groupKeys.length ? groupKeys[index] : '';
      tr.appendChild(headerCell);
    });

    // Add data cells for leaf nodes
    if (Array.isArray(value)) {
      uniqueColumnValues.forEach((columnValue) => {
        const columnItems = value.filter(
          (item) => item[columnField] === columnValue,
        );

        state.measures.forEach((measure) => {
          const td = document.createElement('td');
          td.style.padding = '12px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.backgroundColor = '#f8f9fa';
          td.style.textAlign = 'center';

          if (columnItems.length > 0) {
            let aggregateValue;
            if (measure.formula && typeof measure.formula === 'function') {
              aggregateValue =
                columnItems.reduce(
                  (sum, item) => sum + measure.formula(item),
                  0,
                ) / columnItems.length;
            } else {
              aggregateValue = columnItems.reduce(
                (sum, item) => sum + (item[measure.uniqueName] || 0),
                0,
              );
            }

            if (measure.aggregation === 'avg') {
              aggregateValue /= columnItems.length;
            }

            td.textContent = engine.formatValue(
              aggregateValue,
              measure.uniqueName,
            );

            //Apply condition formatting
            applyConditionalFormatting(td, aggregateValue, measure.uniqueName);
          } else {
            td.textContent = engine.formatValue(0, measure.uniqueName);
          }

          tr.appendChild(td);
        });
      });
    } else {
      // Add empty cells for non-leaf nodes
      uniqueColumnValues.forEach(() => {
        state.measures.forEach(() => {
          const td = document.createElement('td');
          td.style.padding = '12px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          tr.appendChild(td);
        });
      });
    }

    tbody.appendChild(tr);

    // Recursively render subgroups
    if (!Array.isArray(value)) {
      renderGroupedRows(tbody, value, state, level + 1);
    }
  });
}

function applyConditionalFormatting(td, value, measureName) {
  if (config.conditionalFormatting && config.conditionalFormatting.length > 0) {
    config.conditionalFormatting.forEach((rule) => {
      if (rule.value.type === 'All values' || 
          (rule.value.type === 'Number' && typeof value === 'number') ||
          (rule.value.type === 'Text' && typeof value === 'string')) {
        let applyFormat = false;
        switch (rule.value.operator) {
          case 'Greater than':
            applyFormat = value > parseFloat(rule.value.value1);
            break;
          case 'Less than':
            applyFormat = value < parseFloat(rule.value.value1);
            break;
          case 'Between':
            applyFormat = value >= parseFloat(rule.value.value1) && 
                          value <= parseFloat(rule.value.value2);
            break;
          case 'Equal to':
            applyFormat = value === parseFloat(rule.value.value1) || value === rule.value.value1;
            break;
        }
        if (applyFormat) {
          td.style.fontFamily = rule.format.font;
          td.style.fontSize = rule.format.size;
          td.style.color = rule.format.color;
          td.style.backgroundColor = rule.format.backgroundColor;
        }
      }
    });
  }
}

function renderTableHeader(thead, state) {
  // Column header row
  const columnHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  const emptyHeaderCell = document.createElement('th');
  emptyHeaderCell.colSpan = state.rows.length;
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
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.borderRight = '1px solid #dee2e6';
    columnHeaderRow.appendChild(th);
  });
  thead.appendChild(columnHeaderRow);

  // Second header row for measures
  const measureHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  state.rows.forEach((row) => {
    const th = document.createElement('th');
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.cursor = 'pointer';

    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    headerContent.style.justifyContent = 'space-between';

    const headerText = document.createElement('span');
    headerText.textContent = row.caption;
    headerContent.appendChild(headerText);

   // const sortIcon = createSortIcon(row.uniqueName, 'row');
  //  headerContent.appendChild(sortIcon);

    th.appendChild(headerContent);
    th.addEventListener('click', () => handleSort(row.uniqueName, 'row'));
    measureHeaderRow.appendChild(th);
  });

  // Add measure headers for each column value
  uniqueColumnValues.forEach(() => {
    state.measures.forEach((measure) => {
      const th = document.createElement('th');
      // th.textContent = measure.caption;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';

      const headerContent = document.createElement('div');
      headerContent.style.display = 'flex';
      headerContent.style.alignItems = 'center';
      headerContent.style.justifyContent = 'space-between';

      const headerText = document.createElement('span');
      headerText.textContent = measure.caption;
      headerContent.appendChild(headerText);

      // const sortIcon = createSortIcon(measure.uniqueName, 'column');
      // headerContent.appendChild(sortIcon);

      th.appendChild(headerContent);
      measureHeaderRow.appendChild(th);
    });
  });

  thead.appendChild(measureHeaderRow);
}

//TODO : Uncomment when sort feature updated in pivot table
// function createSortIcon(field, axis) {
//   const icon = document.createElement('span');
//   icon.innerHTML = '&#8645;'; // Unicode for up-down arrow
//   icon.style.cursor = 'pointer';
//   icon.style.marginLeft = '5px';

//   icon.addEventListener('click', () => {
//     const currentDirection = engine.getState().sortConfig?.direction;
//     const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
//     engine.sort(field, newDirection, axis);
//     renderTable();
//   });

//   return icon;
// }


function updateFormatting(newConfig) {
  config.conditionalFormatting = newConfig.conditionalFormatting;
  renderTable();
}

function groupData(data, groupFields) {
  if (!groupFields || groupFields.length === 0) return {};

  const result = {};

  data.forEach((item) => {
    let current = result;

    groupFields.forEach((field, index) => {
      const value = String(item[field]); // Convert all values to string for consistent grouping

      if (!current[value]) {
        current[value] = index === groupFields.length - 1 ? [] : {};
      }

      if (index === groupFields.length - 1) {
        current[value].push(item);
      } else {
        current = current[value];
      }
    });
  });

  return result;
}

export function formatTable(config){
  engine = new PivotEngine(config);
  renderTable();
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
  createHeader(config);
  renderTable();
});