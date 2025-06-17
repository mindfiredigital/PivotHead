import '@mindfiredigital/pivothead-web-component';
import { originalData, options } from './config';

// Dynamic configuration storage
let dynamicConfig = {
  rowHeight: 40,
  columnWidths: {},
  currentRowDimension: 'product',
  currentColumnDimension: 'region',
  responsive: true,
};

let pivotTable;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  customElements.whenDefined('pivot-head').then(() => {
    pivotTable = document.getElementById('pivotTable');

    pivotTable.data = originalData;
    pivotTable.options = options;

    // Set initial pagination
    pivotTable.setPagination({
      currentPage: 1,
      pageSize: 4, // Default page size
    });

    pivotTable.addEventListener('stateChange', e => {
      const state = e.detail;
      renderTable(state);
      updateDebugView(state);
    });

    // Set row groups (products) with proper Group structure
    const productGroups = [
      ...new Set(originalData.map(item => item.product)),
    ].map(product => {
      const productItems = originalData.filter(
        item => item.product === product
      );
      return {
        key: product,
        items: productItems,
        aggregates: {}, // Empty aggregates object
        level: 0,
      };
    });
    pivotTable.setRowGroups(productGroups);

    // Set column groups (regions) with proper Group structure
    const regionGroups = [
      ...new Set(originalData.map(item => item.region)),
    ].map(region => {
      const regionItems = originalData.filter(item => item.region === region);
      return {
        key: region,
        items: regionItems,
        aggregates: {}, // Empty aggregates object
        level: 0,
      };
    });
    pivotTable.setColumnGroups(regionGroups);

    const state = pivotTable.getState();
    renderTable(state);

    setupPaginationControls();
  });
});

//Refresh Data
window.handleReset = () => {
  pivotTable.refresh();
};

//Handle filters
window.handleFilter = () => {
  const field = document.getElementById('filterField').value;
  const operator = document.getElementById('filterOperator').value;
  const value = document.getElementById('filterValue').value;

  const filters = [{ field: field, operator: operator, value: value }];
  pivotTable.filters = filters;
};

// Basic Operations
window.handleSort = () => {
  pivotTable.sort('sales', 'desc');
};

// Measures & Dimensions
window.changeMeasure = () => {
  const selectedMeasure = document.getElementById('measureSelect').value;
  const measures = [
    {
      uniqueName: selectedMeasure,
      caption: selectedMeasure === 'sales' ? 'Total Sales' : 'Total Quantity',
      aggregation: 'sum',
      format:
        selectedMeasure === 'sales'
          ? { type: 'currency', currency: 'USD', locale: 'en-US', decimals: 2 }
          : { type: 'number', decimals: 2, locale: 'en-US' },
    },
  ];
  pivotTable.setMeasures(measures);
};

window.changeDimension = () => {
  const selectedDimension = document.getElementById('dimensionSelect').value;
  dynamicConfig.currentRowDimension = selectedDimension;
  const dimensions = [
    { field: selectedDimension, label: selectedDimension, type: 'string' },
  ];
  pivotTable.setDimensions(dimensions);
};

window.changeAggregation = () => {
  const selectedAggregation =
    document.getElementById('aggregationSelect').value;
  pivotTable.setAggregation(selectedAggregation);
};

// Pagination
window.setPagination = () => {
  const pageSize = parseInt(document.getElementById('pageSize').value);
  const currentPage = parseInt(document.getElementById('currentPage').value);
  const paginationConfig = { pageSize, currentPage };
  pivotTable.setPagination(paginationConfig);
};

// Export Operations
window.handleExportHTML = () => {
  pivotTable.exportToHTML('pivot-demo');
};

window.handleExportPDF = () => {
  pivotTable.exportToPDF('pivot-demo');
};

window.handleExportExcel = () => {
  pivotTable.exportToExcel('pivot-demo');
};

window.handlePrint = () => {
  pivotTable.openPrintDialog();
};



// function renderTable(state) {
//   try {
//     console.log('Current Engine State:', state);

//     if (!state.processedData && !state.data) {
//       console.error('No processed data available');
//       return;
//     }

//     const tableContainer = document.getElementById('myTable');

//     // Clear previous content
//     tableContainer.innerHTML = '';

//     // Create table element
//     const table = document.createElement('table');
//     table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//     table.style.marginTop = '20px';
//     table.style.border = '1px solid #dee2e6';

//     // Create table header
//     const thead = document.createElement('thead');

//     // First header row for regions
//     const regionHeaderRow = document.createElement('tr');

//     // Add empty cell for top-left corner (Product/Region)
//     const cornerCell = document.createElement('th');
//     cornerCell.style.padding = '12px';
//     cornerCell.style.backgroundColor = '#f8f9fa';
//     cornerCell.style.borderBottom = '2px solid #dee2e6';
//     cornerCell.style.borderRight = '1px solid #dee2e6';
//     cornerCell.textContent = 'Product / Region';
//     regionHeaderRow.appendChild(cornerCell);

//     // Get regions from column groups (set via setColumnGroups)
//     const uniqueRegions =
//       state.columnGroups && state.columnGroups.length > 0
//         ? state.columnGroups.map(
//             group => group.key || group.name || group.value
//           )
//         : [...new Set(state.data.map(item => item.region))]; // fallback

//     // Add region headers with colspan for measures
//     uniqueRegions.forEach((region, index) => {
//       const th = document.createElement('th');
//       th.textContent = region;
//       th.colSpan = state.selectedMeasures ? state.selectedMeasures.length : 1;
//       th.style.padding = '12px';
//       th.style.backgroundColor = '#f8f9fa';
//       th.style.borderBottom = '2px solid #dee2e6';
//       th.style.borderRight = '1px solid #dee2e6';
//       th.style.textAlign = 'center';
//       th.dataset.index = index + 1;

//       th.setAttribute('draggable', 'true');
//       th.style.cursor = 'move';

//       regionHeaderRow.appendChild(th);
//     });

//     thead.appendChild(regionHeaderRow);

//     // Second header row for measures
//     const measureHeaderRow = document.createElement('tr');

//     // Get current sort configuration
//     const currentSortConfig = state.sortConfig?.[0];

//     // Add product header with sort icon
//     const productHeader = document.createElement('th');
//     productHeader.style.padding = '12px';
//     productHeader.style.backgroundColor = '#f8f9fa';
//     productHeader.style.borderBottom = '2px solid #dee2e6';
//     productHeader.style.borderRight = '1px solid #dee2e6';
//     productHeader.style.cursor = 'pointer';

//     const productHeaderContent = document.createElement('div');
//     productHeaderContent.style.display = 'flex';
//     productHeaderContent.style.alignItems = 'center';

//     const productText = document.createElement('span');
//     productText.textContent = 'Product';
//     productHeaderContent.appendChild(productText);

//     const productSortIcon = createSortIcon('product', currentSortConfig);
//     productHeaderContent.appendChild(productSortIcon);

//     productHeader.appendChild(productHeaderContent);

//     productHeader.addEventListener('click', () => {
//       const direction =
//         currentSortConfig?.field === 'product' &&
//         currentSortConfig?.direction === 'asc'
//           ? 'desc'
//           : 'asc';
//       pivotTable.sort('product', direction);
//     });

//     measureHeaderRow.appendChild(productHeader);

//     // Add measure headers for each region
//     if (state.selectedMeasures && state.selectedMeasures.length > 0) {
//       uniqueRegions.forEach(region => {
//         state.selectedMeasures.forEach(measure => {
//           const th = document.createElement('th');
//           th.style.padding = '12px';
//           th.style.backgroundColor = '#f8f9fa';
//           th.style.borderBottom = '2px solid #dee2e6';
//           th.style.borderRight = '1px solid #dee2e6';
//           th.style.cursor = 'pointer';

//           const headerContent = document.createElement('div');
//           headerContent.style.display = 'flex';
//           headerContent.style.alignItems = 'center';
//           headerContent.style.justifyContent = 'space-between';

//           const measureText = document.createElement('span');
//           measureText.textContent = measure.caption;
//           headerContent.appendChild(measureText);

//           const sortIcon = createSortIcon(
//             measure.uniqueName,
//             currentSortConfig
//           );
//           headerContent.appendChild(sortIcon);

//           th.appendChild(headerContent);

//           th.addEventListener('click', () => {
//             const direction =
//               currentSortConfig?.field === measure.uniqueName &&
//               currentSortConfig?.direction === 'asc'
//                 ? 'desc'
//                 : 'asc';
//             pivotTable.sort(measure.uniqueName, direction);
//           });

//           measureHeaderRow.appendChild(th);
//         });
//       });
//     }

//     thead.appendChild(measureHeaderRow);
//     table.appendChild(thead);

//     // Create table body
//     const tbody = document.createElement('tbody');

//     // Get all unique products

//     const allUniqueProducts =
//       state.rowGroups && state.rowGroups.length > 0
//         ? state.rowGroups.map(group => group.key || group.name || group.value)
//         : [...new Set(state.data.map(item => item.product))]; // fallback

//     // Apply pagination to products
//     const pagination = pivotTable.getPagination();
//     const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
//     const endIndex = startIndex + pagination.pageSize;
//     const paginatedProducts = allUniqueProducts.slice(startIndex, endIndex);

//     console.log('Pagination info:', {
//       currentPage: pagination.currentPage,
//       pageSize: pagination.pageSize,
//       totalProducts: allUniqueProducts.length,
//       showingProducts: paginatedProducts.length,
//       startIndex,
//       endIndex,
//     });

//     // Add rows for each product
//     paginatedProducts.forEach((product, rowIndex) => {
//       const tr = document.createElement('tr');
//       tr.dataset.rowIndex = rowIndex;
//       tr.setAttribute('draggable', 'true');
//       tr.style.cursor = 'move';

//       const productCell = document.createElement('td');
//       productCell.style.fontWeight = 'bold';
//       productCell.style.padding = '8px';
//       productCell.style.borderBottom = '1px solid #dee2e6';
//       productCell.style.display = 'flex';
//       productCell.style.alignItems = 'center';
//       productCell.style.gap = '8px';

//       const rowId = `product-${product}`;
//       const isExpanded = pivotTable.isRowExpanded
//         ? pivotTable.isRowExpanded(rowId)
//         : true;

//       const toggleIcon = document.createElement('span');
//       toggleIcon.textContent = isExpanded ? '▼' : '▶';
//       toggleIcon.style.cursor = 'pointer';

//       if (pivotTable.toggleRowExpansion) {
//         toggleIcon.addEventListener('click', () => {
//           pivotTable.toggleRowExpansion(rowId);
//         });
//       }

//       productCell.appendChild(toggleIcon);

//       const productLabel = document.createElement('span');
//       productLabel.textContent = product;
//       productCell.appendChild(productLabel);

//       tr.appendChild(productCell);

//       // Add data cells for each region and measure
//       uniqueRegions.forEach(region => {
//         const filteredData = state.data.filter(
//           item => item.product === product && item.region === region
//         );

//         const measures = state.selectedMeasures || [];
//         measures.forEach(measure => {
//           const td = document.createElement('td');
//           td.style.padding = '8px';
//           td.style.borderBottom = '1px solid #dee2e6';
//           td.style.borderRight = '1px solid #dee2e6';
//           td.style.textAlign = 'right';

//           let value = 0;
//           if (filteredData.length > 0) {
//             switch (measure.aggregation) {
//               case 'sum':
//                 value = filteredData.reduce(
//                   (sum, item) => sum + (item[measure.uniqueName] || 0),
//                   0
//                 );
//                 break;
//               case 'avg':
//                 if (measure.formula) {
//                   value =
//                     filteredData.reduce(
//                       (sum, item) => sum + measure.formula(item),
//                       0
//                     ) / filteredData.length;
//                 } else {
//                   value =
//                     filteredData.reduce(
//                       (sum, item) => sum + (item[measure.uniqueName] || 0),
//                       0
//                     ) / filteredData.length;
//                 }
//                 break;
//               case 'max':
//                 value = Math.max(
//                   ...filteredData.map(item => item[measure.uniqueName] || 0)
//                 );
//                 break;
//               case 'min':
//                 value = Math.min(
//                   ...filteredData.map(item => item[measure.uniqueName] || 0)
//                 );
//                 break;
//               default:
//                 value = 0;
//             }
//           }



//           let formattedValue = value;
//           if (measure.format) {
//             if (measure.format.type === 'currency') {
//               formattedValue = new Intl.NumberFormat(measure.format.locale, {
//                 style: 'currency',
//                 currency: measure.format.currency,
//                 minimumFractionDigits: measure.format.decimals,
//                 maximumFractionDigits: measure.format.decimals,
//               }).format(value);
//             } else if (measure.format.type === 'number') {
//               formattedValue = new Intl.NumberFormat(measure.format.locale, {
//                 minimumFractionDigits: measure.format.decimals,
//                 maximumFractionDigits: measure.format.decimals,
//               }).format(value);
//             }
//           }

//           td.textContent = formattedValue;

//           // Apply conditional formatting
//           if (
//             options.conditionalFormatting &&
//             Array.isArray(options.conditionalFormatting)
//           ) {
//             options.conditionalFormatting.forEach(rule => {
//               if (rule.value.type === 'Number' && !isNaN(value)) {
//                 let applyFormat = false;

//                 switch (rule.value.operator) {
//                   case 'Greater than':
//                     applyFormat = value > parseFloat(rule.value.value1);
//                     break;
//                   case 'Less than':
//                     applyFormat = value < parseFloat(rule.value.value1);
//                     break;
//                   case 'Equal to':
//                     applyFormat = value === parseFloat(rule.value.value1);
//                     break;
//                   case 'Between':
//                     applyFormat =
//                       value >= parseFloat(rule.value.value1) &&
//                       value <= parseFloat(rule.value.value2);
//                     break;
//                 }

//                 if (applyFormat) {
//                   if (rule.format.font) td.style.fontFamily = rule.format.font;
//                   if (rule.format.size) td.style.fontSize = rule.format.size;
//                   if (rule.format.color) td.style.color = rule.format.color;
//                   if (rule.format.backgroundColor)
//                     td.style.backgroundColor = rule.format.backgroundColor;
//                 }
//               }
//             });
//           }

//           tr.appendChild(td);
//         });
//       });

//       tbody.appendChild(tr);
//     });

//     table.appendChild(tbody);
//     tableContainer.appendChild(table);

//     // Update pagination info after rendering
//     updatePaginationInfo();

//     // Set up drag and drop after rendering
//     setupDragAndDrop(state);
//   } catch (error) {
//     console.error('Error rendering table:', error);

//     const tableContainer = document.getElementById('myTable');
//     tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
//   }
// }

// In index.js

function renderTable(state) {
  try {
    console.log('Current Engine State:', state);

    if (!state.processedData && !state.data) {
      console.error('No processed data available');
      return;
    }

    const tableContainer = document.getElementById('myTable');
    tableContainer.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    table.style.border = '1px solid #dee2e6';

    const thead = document.createElement('thead');
    const regionHeaderRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.style.padding = '12px';
    cornerCell.style.backgroundColor = '#f8f9fa';
    cornerCell.style.borderBottom = '2px solid #dee2e6';
    cornerCell.style.borderRight = '1px solid #dee2e6';
    cornerCell.textContent = 'Product / Region';
    regionHeaderRow.appendChild(cornerCell);

    const uniqueRegions =
      state.columnGroups && state.columnGroups.length > 0
        ? state.columnGroups.map(group => group.key || group.name || group.value)
        : [...new Set(state.data.map(item => item.region))];

    uniqueRegions.forEach((region, index) => {
      const th = document.createElement('th');
      th.textContent = region;
      th.colSpan = state.selectedMeasures ? state.selectedMeasures.length : 1;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.index = index + 1;
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';
      regionHeaderRow.appendChild(th);
    });
    thead.appendChild(regionHeaderRow);

    const measureHeaderRow = document.createElement('tr');
    const currentSortConfig = state.sortConfig?.[0];
    const productHeader = document.createElement('th');
    productHeader.style.padding = '12px';
    productHeader.style.backgroundColor = '#f8f9fa';
    productHeader.style.borderBottom = '2px solid #dee2e6';
    productHeader.style.borderRight = '1px solid #dee2e6';
    productHeader.style.cursor = 'pointer';

    const productHeaderContent = document.createElement('div');
    productHeaderContent.style.display = 'flex';
    productHeaderContent.style.alignItems = 'center';

    const productText = document.createElement('span');
    productText.textContent = 'Product';
    productHeaderContent.appendChild(productText);

    const productSortIcon = createSortIcon('product', currentSortConfig);
    productHeaderContent.appendChild(productSortIcon);
    productHeader.appendChild(productHeaderContent);

    productHeader.addEventListener('click', () => {
      const direction =
        currentSortConfig?.field === 'product' && currentSortConfig?.direction === 'asc'
          ? 'desc'
          : 'asc';
      pivotTable.sort('product', direction);
    });
    measureHeaderRow.appendChild(productHeader);

    if (state.selectedMeasures && state.selectedMeasures.length > 0) {
      uniqueRegions.forEach(region => {
        state.selectedMeasures.forEach(measure => {
          const th = document.createElement('th');
          th.style.padding = '12px';
          th.style.backgroundColor = '#f8f9fa';
          th.style.borderBottom = '2px solid #dee2e6';
          th.style.borderRight = '1px solid #dee2e6';
          th.style.cursor = 'pointer';

          const headerContent = document.createElement('div');
          headerContent.style.display = 'flex';
          headerContent.style.alignItems = 'center';
          headerContent.style.justifyContent = 'space-between';

          const measureText = document.createElement('span');
          measureText.textContent = measure.caption;
          headerContent.appendChild(measureText);

          const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
          headerContent.appendChild(sortIcon);
          th.appendChild(headerContent);

          th.addEventListener('click', () => {
            const direction =
              currentSortConfig?.field === measure.uniqueName &&
              currentSortConfig?.direction === 'asc'
                ? 'desc'
                : 'asc';
            pivotTable.sort(measure.uniqueName, direction);
          });
          measureHeaderRow.appendChild(th);
        });
      });
    }
    thead.appendChild(measureHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const allUniqueProducts =
      state.rowGroups && state.rowGroups.length > 0
        ? state.rowGroups.map(group => group.key || group.name || group.value)
        : [...new Set(state.data.map(item => item.product))];

    const pagination = pivotTable.getPagination();
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedProducts = allUniqueProducts.slice(startIndex, endIndex);

    paginatedProducts.forEach((product, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      const productCell = document.createElement('td');
      productCell.style.fontWeight = 'bold';
      productCell.style.padding = '8px';
      productCell.style.borderBottom = '1px solid #dee2e6';
      productCell.style.display = 'flex';
      productCell.style.alignItems = 'center';
      productCell.style.gap = '8px';

      const rowId = `product-${product}`;
      const isExpanded = pivotTable.isRowExpanded ? pivotTable.isRowExpanded(rowId) : true;
      const toggleIcon = document.createElement('span');
      toggleIcon.textContent = isExpanded ? '▼' : '▶';
      toggleIcon.style.cursor = 'pointer';
      if (pivotTable.toggleRowExpansion) {
        toggleIcon.addEventListener('click', () => {
          pivotTable.toggleRowExpansion(rowId);
        });
      }
      productCell.appendChild(toggleIcon);

      const productLabel = document.createElement('span');
      productLabel.textContent = product;
      productCell.appendChild(productLabel);
      tr.appendChild(productCell);

      uniqueRegions.forEach(region => {
        const filteredData = state.data.filter(
          item => item.product === product && item.region === region
        );
        const measures = state.selectedMeasures || [];
        measures.forEach(measure => {
          const td = document.createElement('td');
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.textAlign = 'right';

          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              // ... other aggregation cases ...
               case 'avg':
                if (measure.formula) {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + measure.formula(item),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredData.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              default:
                value = 0;
            }
          }

          // ==========================================================
          // ===== THIS IS THE ONLY PART THAT HAS BEEN CHANGED ========
          // ==========================================================

          // The 'value' is already calculated. Now, format it using the component's public method.
          // The component will delegate this call to its internal engine.
          const formattedValue = pivotTable.formatValue(value, measure.uniqueName);
          td.textContent = formattedValue;

          // ==========================================================
          // ==========================================================

          // Apply conditional formatting (this part remains unchanged)
          if (
            options.conditionalFormatting &&
            Array.isArray(options.conditionalFormatting)
          ) {
            options.conditionalFormatting.forEach(rule => {
              if (rule.value.type === 'Number' && !isNaN(value)) {
                let applyFormat = false;

                switch (rule.value.operator) {
                  case 'Greater than':
                    applyFormat = value > parseFloat(rule.value.value1);
                    break;
                  case 'Less than':
                    applyFormat = value < parseFloat(rule.value.value1);
                    break;
                  case 'Equal to':
                    applyFormat = value === parseFloat(rule.value.value1);
                    break;
                  case 'Between':
                    applyFormat =
                      value >= parseFloat(rule.value.value1) &&
                      value <= parseFloat(rule.value.value2);
                    break;
                }

                if (applyFormat) {
                  if (rule.format.font) td.style.fontFamily = rule.format.font;
                  if (rule.format.size) td.style.fontSize = rule.format.size;
                  if (rule.format.color) td.style.color = rule.format.color;
                  if (rule.format.backgroundColor)
                    td.style.backgroundColor = rule.format.backgroundColor;
                }
              }
            });
          }

          tr.appendChild(td);
        });
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    updatePaginationInfo();
    setupDragAndDrop(state);
  } catch (error) {
    console.error('Error rendering table:', error);
    const tableContainer = document.getElementById('myTable');
    tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
  }
}

function setupPaginationControls() {
  const pageSizeSelect = document.getElementById('paginationField');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (!pageSizeSelect || !prevBtn || !nextBtn) {
    console.error('Pagination controls not found in DOM.');
    return;
  }

  // Page size change
  pageSizeSelect.addEventListener('change', () => {
    const newSize = parseInt(pageSizeSelect.value);
    console.log('Changing page size to:', newSize);

    pivotTable.setPagination({
      currentPage: 1, // Reset to first page when changing page size
      pageSize: newSize,
    });

    // Re-render the table with new pagination
    renderTable(pivotTable.getState());
    updatePaginationInfo();
  });

  // Previous Page
  prevBtn.addEventListener('click', () => {
    const pagination = pivotTable.getPagination();
    console.log('Previous page clicked, current page:', pagination.currentPage);

    if (pagination.currentPage > 1) {
      pivotTable.setPagination({
        ...pagination,
        currentPage: pagination.currentPage - 1,
      });
      renderTable(pivotTable.getState());
      updatePaginationInfo();
    }
  });

  // Next Page
  // nextBtn.addEventListener('click', () => {
  //   const pagination = pivotTable.getPagination();
  //   const state = pivotTable.getState();
  //   const uniqueProducts = [...new Set(state.data.map(item => item.product))];
  //   const totalPages = Math.ceil(uniqueProducts.length / pagination.pageSize);

  //   console.log('Next page clicked, current page:', pagination.currentPage, 'total pages:', totalPages);

  //   if (pagination.currentPage < totalPages) {
  //     pivotTable.setPagination({
  //       ...pagination,
  //       currentPage: pagination.currentPage + 1,
  //     });
  //     renderTable(pivotTable.getState());
  //     updatePaginationInfo();
  //   }
  // });

  nextBtn.addEventListener('click', () => {
    const pagination = pivotTable.getPagination();
    const fullData = pivotTable.getRawData();
    const uniqueProducts = [...new Set(fullData.map(item => item.product))];
    const totalPages = Math.ceil(uniqueProducts.length / pagination.pageSize);

    console.log(
      'Next page clicked, current page:',
      pagination.currentPage,
      'total pages:',
      totalPages
    );

    if (pagination.currentPage < totalPages) {
      pivotTable.setPagination({
        ...pagination,
        currentPage: pagination.currentPage + 1,
      });
      renderTable(pivotTable.getState());
    }
  });
}

// function updatePaginationInfo() {
//   const pagination = pivotTable.getPagination();
//   const state = pivotTable.getState();
//   const uniqueProducts = [...new Set(state.data.map(item => item.product))];
//   const totalPages = Math.ceil(uniqueProducts.length / pagination.pageSize);

//   const info = document.getElementById('paginationInfo');
//   if (info) {
//     info.textContent = `Page ${pagination.currentPage} of ${totalPages} (${uniqueProducts.length} total products)`;
//   }

//   // Update button states
//   const prevBtn = document.getElementById('prevPageBtn');
//   const nextBtn = document.getElementById('nextPageBtn');

//   if (prevBtn) {
//     prevBtn.disabled = pagination.currentPage <= 1;
//   }
//   if (nextBtn) {
//     nextBtn.disabled = pagination.currentPage >= totalPages;
//   }
// }

function updatePaginationInfo() {
  const pagination = pivotTable.getPagination();
  const fullData = pivotTable.getRawData();
  const uniqueProducts = [...new Set(fullData.map(item => item.product))];
  const totalPages = Math.ceil(uniqueProducts.length / pagination.pageSize);

  const info = document.getElementById('paginationInfo');
  if (info) {
    info.textContent = `Page ${pagination.currentPage} of ${totalPages} (${uniqueProducts.length} total products)`;
  }

  // Update button states
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) {
    prevBtn.disabled = pagination.currentPage <= 1;
  }
  if (nextBtn) {
    nextBtn.disabled = pagination.currentPage >= totalPages;
  }

  console.log('Pagination Info Updated:', {
    currentPage: pagination.currentPage,
    totalPages,
    pageSize: pagination.pageSize,
    totalUniqueProducts: uniqueProducts.length,
  });
}

// Helper function to create sort icons
function createSortIcon(field, currentSortConfig) {
  const sortIcon = document.createElement('span');
  sortIcon.style.marginLeft = '5px';
  sortIcon.style.display = 'inline-block';

  // Check if this field is currently being sorted
  const isCurrentlySorted =
    currentSortConfig && currentSortConfig.field === field;

  if (isCurrentlySorted) {
    // Show the appropriate icon based on sort direction
    if (currentSortConfig.direction === 'asc') {
      sortIcon.innerHTML = '&#9650;'; // Up arrow
      sortIcon.title = 'Sorted ascending';
    } else {
      sortIcon.innerHTML = '&#9660;'; // Down arrow
      sortIcon.title = 'Sorted descending';
    }
    sortIcon.style.color = '#007bff'; // Highlight the active sort
  } else {
    // Show a neutral icon for unsorted fields
    sortIcon.innerHTML = '&#8693;'; // Up/down arrow
    sortIcon.title = 'Click to sort';
    sortIcon.style.color = '#6c757d';
    sortIcon.style.opacity = '0.5';
  }

  return sortIcon;
}

// Add this function to set up drag and drop functionality
function setupDragAndDrop(state) {
  // DRAG COLUMNS
  const headers = document.querySelectorAll('th[draggable="true"]');
  let draggedColumnIndex = null;

  headers.forEach((header, index) => {
    header.dataset.index = index;

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = parseInt(header.dataset.index);
      e.dataTransfer.setData('type', 'column');
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
    });

    header.addEventListener('dragover', e => e.preventDefault());

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnIndex !== null) header.classList.add('drag-over');
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(header.dataset.index);
      header.classList.remove('drag-over');

      const dragType = e.dataTransfer.getData('type');
      if (
        dragType === 'column' &&
        draggedColumnIndex !== null &&
        dropIndex !== null &&
        draggedColumnIndex !== dropIndex
      ) {
        console.log(
          `Dragging column from ${draggedColumnIndex} to ${dropIndex}`
        );
        if (pivotTable.dragColumn) {
          pivotTable.dragColumn(draggedColumnIndex, dropIndex);
          renderTable(pivotTable.getState());
        }
      }

      draggedColumnIndex = null;
    });
  });

  // DRAG ROWS
  const rows = document.querySelectorAll('tbody tr');
  let draggedRowIndex = null;

  rows.forEach((row, index) => {
    row.dataset.rowIndex = index;

    row.addEventListener('dragstart', e => {
      draggedRowIndex = index;
      e.dataTransfer.setData('type', 'row');
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
    });

    row.addEventListener('dragover', e => e.preventDefault());

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowIndex !== null && draggedRowIndex !== index) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = index;
      row.classList.remove('drag-over');

      const dragType = e.dataTransfer.getData('type');
      if (
        dragType === 'row' &&
        draggedRowIndex !== null &&
        dropIndex !== null &&
        draggedRowIndex !== dropIndex
      ) {
        console.log(`Dragging row from ${draggedRowIndex} to ${dropIndex}`);
        if (pivotTable.dragRow) {
          pivotTable.dragRow(draggedRowIndex, dropIndex);
          renderTable(pivotTable.getState());
        }
      }

      draggedRowIndex = null;
    });
  });
}

function updateDebugView(state) {
  const debugElement = document.getElementById('stateDebug');
  if (debugElement) {
    const debugInfo = {
      ...state,
      dynamicConfig: dynamicConfig,
    };
    debugElement.textContent = JSON.stringify(debugInfo, null, 2);
  }
}

// Modal functions
window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
  }
};

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Hook up cancel button
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Close modal on background click
  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  
});

window.applyFormatting = function () {
  if (!pivotTable) return;
 
  const fieldName = document.getElementById('field-select').value;
  const formatType = document.getElementById('format-type').value;
  const decimals = parseInt(
    document.getElementById('decimal-places').value,
    10
  );
  const locale = document.getElementById('locale-input').value || 'en-US';
  const currency =
    document.getElementById('currency-code').value.toUpperCase() || 'USD';
 
  const newFormat = { type: formatType, decimals, locale };
  if (formatType === 'currency') {
    newFormat.currency = currency;
  }
 
  //  This calls the public method you added to the PivotHeadElement class
  pivotTable.setFormatting(fieldName, newFormat);
  closeModal('modal1');
  renderTable(pivotTable.getState());
  // setRowColumnGroups();
};
