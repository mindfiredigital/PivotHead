import '@mindfiredigital/pivothead-web-component';
import { originalData, options } from './config';

// declared pivot head globally
let pivot;

//starting of the event
window.addEventListener('DOMContentLoaded', () => {
  customElements.whenDefined('pivot-head').then(() => {
    // Assign to the global 'pivot' variable
    pivot = document.querySelector('pivot-head');
    if (!pivot) {
      console.error('Could not find the <pivot-head> element!');
      return;
    }

    pivot.data = originalData;

    pivot.options = options;

    pivot.addEventListener('stateChange', e => {
      const updatedState = e.detail;
      console.log('State changed:', updatedState);
      renderTable(updatedState);
    });

    console.log(pivot.getState());
    // setRowColumnGroups();
    renderTable(pivot.getState());
    populateFieldsModalStructure();
  });
});

// function setRowColumnGroups() {
//   const productGroups = [
//     ...new Set(originalData.map(item => item.product)),
//   ].map(product => ({
//     key: product,
//     items: originalData.filter(item => item.product === product),
//     aggregates: {},
//     level: 0,
//   }));
//   pivot.setRowGroups(productGroups);

//   const regionGroups = [...new Set(originalData.map(item => item.region))].map(
//     region => ({
//       key: region,
//       items: originalData.filter(item => item.region === region),
//       aggregates: {},
//       level: 0,
//     })
//   );
//   pivot.setColumnGroups(regionGroups);
// }

/**
 * Renders the pivot table with collapsible/expandable rows for measures.
 */
// function renderTable(state) {
//   if (!state || !state.processedData) {
//     console.error('State object is incomplete or invalid.');
//     return;
//   }

//   console.log(pivot.getState())
//   const tableContainer = document.getElementById('myTable');
//   tableContainer.innerHTML = ''; // Clear previous table

//   const {
//     rows: rowConfigs,
//     columns: colConfigs,
//     selectedMeasures,
//     rowGroups,
//     columnGroups,
//     processedData,
//   } = state;
//   const grandTotals = processedData.totals;
//   const dataMap = new Map(state.groups.map(g => [g.key, g.aggregates]));

//   const table = document.createElement('table');
//   table.className = 'pivot-table';
//   const thead = table.createTHead();

//   // --- 1. HEADER ROW ---
//   const headerRow = thead.insertRow();
//   // Header for Product Column (now spans 2 columns to align with Product + Measure)
//   const productHeader = headerRow.insertCell();
//   productHeader.textContent = rowConfigs[0]?.caption || 'Product';
//   productHeader.colSpan = 2;

//   columnGroups.forEach((cGroup, index) => {
//     const th = document.createElement('th');
//     th.textContent = cGroup.key;
//     th.draggable = true;
//     th.dataset.columnIndex = index;
//     headerRow.appendChild(th);
//   });

//   const grandTotalHeader = document.createElement('th');
//   grandTotalHeader.textContent = 'Grand Total';
//   headerRow.appendChild(grandTotalHeader);

//   // --- 2. TABLE BODY (with expandable rows) ---
//   rowGroups.forEach((rGroup, rIndex) => {
//     const groupTbody = table.createTBody();
//     groupTbody.dataset.rowIndex = rIndex; // For drag-and-drop
//     groupTbody.draggable = true;

//     // Check if the current row group is expanded
//     const isExpanded = pivot.isRowExpanded(rGroup.key);

//     // Create the main, always-visible, clickable product row
//     const productRow = groupTbody.insertRow();
//     productRow.className = 'product-row';

//     // The cell with the product name and toggle icon
//     const productCell = productRow.insertCell();
//     productCell.className = 'row-header clickable';
//     productCell.colSpan = 2 + columnGroups.length + 1; // Span all columns
//     productCell.onclick = () => pivot.toggleRowExpansion(rGroup.key);

//     // Add expand/collapse icon and product name
//     productCell.innerHTML = `
//       <span class="toggle-icon">${isExpanded ? '▼' : '►'}</span>
//       ${rGroup.key}
//     `;

//     // --- Conditionally render the measure rows if expanded ---
//     if (isExpanded) {
//       selectedMeasures.forEach(measure => {
//         const measureRow = groupTbody.insertRow();
//         measureRow.className = 'measure-detail-row';

//         // Add an empty cell for alignment under the product name
//         measureRow.insertCell().className = 'indent-cell';

//         // Add the measure name cell
//         const measureNameCell = measureRow.insertCell();
//         measureNameCell.textContent = `Sum of ${measure.caption}`;
//         measureNameCell.className = 'measure-header';

//         let rowTotal = 0;

//         // Data cells for each region
//         columnGroups.forEach(cGroup => {
//           const key = `${rGroup.key} - ${cGroup.key}`;
//           const aggregateData = dataMap.get(key);
//           const value = aggregateData
//             ? aggregateData[`sum_${measure.uniqueName}`]
//             : 0;
//           const cell = measureRow.insertCell();
//           cell.textContent = pivot.formatValue(value, measure.uniqueName);
//           rowTotal += value || 0;
//         });

//         // Grand total cell for the measure row
//         const grandTotalCell = measureRow.insertCell();
//         grandTotalCell.textContent = pivot.formatValue(
//           rowTotal,
//           measure.uniqueName
//         );
//         grandTotalCell.className = 'grand-total-col';
//       });
//     }
//   });

//   // --- 3. TABLE FOOTER ---
//   const footerTbody = table.createTBody();
//   footerTbody.className = 'grand-total-footer';
//   selectedMeasures.forEach(measure => {
//     const footerRow = footerTbody.insertRow();
//     footerRow.className = 'grand-total-row';

//     const headerCell = footerRow.insertCell();
//     headerCell.textContent = `Total Sum of ${measure.caption}`;
//     headerCell.colSpan = 2;
//     headerCell.className = 'row-header';

//     columnGroups.forEach(cGroup => {
//       const colTotal = cGroup.items.reduce(
//         (sum, item) => sum + (item[measure.uniqueName] || 0),
//         0
//       );
//       const cell = footerRow.insertCell();
//       cell.textContent = pivot.formatValue(colTotal, measure.uniqueName);
//     });

//     const grandTotalValue = grandTotals[measure.uniqueName];
//     const cell = footerRow.insertCell();
//     cell.textContent = pivot.formatValue(grandTotalValue, measure.uniqueName);
//   });

//   tableContainer.appendChild(table);
//   setupDragAndDrop();
// }

/**
 * Sets up drag and drop functionality for table rows and columns.
 * Modified to handle dragging entire <tbody> sections for rows.
 */
function setupDragAndDrop() {
  // --- DRAG COLUMNS ---
  const headers = document.querySelectorAll('th[data-column-index]');
  let draggedColumnIndex = null;

  headers.forEach(header => {
    header.addEventListener('dragstart', e => {
      draggedColumnIndex = parseInt(header.dataset.columnIndex, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'column');
      setTimeout(() => header.classList.add('dragging'), 0);
    });
    header.addEventListener('dragend', () =>
      header.classList.remove('dragging')
    );
    header.addEventListener('dragover', e => e.preventDefault());
    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== parseInt(header.dataset.columnIndex, 10)
      ) {
        header.classList.add('drag-over');
      }
    });
    header.addEventListener('dragleave', () =>
      header.classList.remove('drag-over')
    );
    header.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(header.dataset.columnIndex, 10);
      header.classList.remove('drag-over');

      if (draggedColumnIndex !== null && draggedColumnIndex !== dropIndex) {
        pivot.dragColumn(draggedColumnIndex, dropIndex);
      }
      draggedColumnIndex = null;
    });
  });

  // --- DRAG ROWS (Now targets entire <tbody> groups) ---
  const rows = document.querySelectorAll('tbody[data-row-index]');
  let draggedRowIndex = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', e => {
      draggedRowIndex = parseInt(row.dataset.rowIndex, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'row');
      // Apply style to the whole group
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', e => e.preventDefault());

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedRowIndex !== null &&
        draggedRowIndex !== parseInt(row.dataset.rowIndex, 10)
      ) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      const dropIndex = parseInt(row.dataset.rowIndex, 10);
      row.classList.remove('drag-over');

      if (draggedRowIndex !== null && draggedRowIndex !== dropIndex) {
        pivot.dragRow(draggedRowIndex, dropIndex);
      }
      draggedRowIndex = null;
    });
  });
}

//Format Tools
window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  // ✅ ADD THIS LINE: Populate the form *before* showing the modal.
  updateModalForm();

  modal.style.display = 'flex';
};

window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
};

/**
 * Reads the current component state and updates the modal's form fields.
 */
function updateModalForm() {
  if (!pivot) return; // 'pivot' is your global component variable
  const state = pivot.getState();
  const fieldName = document.getElementById('field-select').value;
  const currentFormat = state.formatting[fieldName] || {};

  document.getElementById('format-type').value = currentFormat.type || 'number';
  document.getElementById('decimal-places').value =
    currentFormat.decimals !== undefined ? currentFormat.decimals : 2;
  document.getElementById('currency-code').value =
    currentFormat.currency || 'USD';
  document.getElementById('locale-input').value =
    currentFormat.locale || 'en-US';

  // Also, make sure the currency input is visible if needed
  toggleCurrencyInput();
}

/**
 * Toggles the visibility of the currency input based on the selected format type.
 */
function toggleCurrencyInput() {
  const formatType = document.getElementById('format-type').value;
  const currencyGroup = document.getElementById('currency-symbol-group');
  currencyGroup.style.display = formatType === 'currency' ? 'block' : 'none';
}

/**
 * Reads values from the modal and calls the component's public setFormatting method.
 */
window.applyFormatting = function () {
  if (!pivot) return;

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

  // ✅ This calls the public method you added to the PivotHeadElement class
  pivot.setFormatting(fieldName, newFormat);
  closeModal('modal1');
  setRowColumnGroups();
};

document.addEventListener('DOMContentLoaded', () => {
  // Hook up cancel button
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').style.display = 'none';
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

  // ✅ Add new listeners for the modal form fields
  const fieldSelect = document.getElementById('field-select');
  const formatTypeSelect = document.getElementById('format-type');

  if (fieldSelect) {
    // When the user chooses a different field, update the form to match
    fieldSelect.addEventListener('change', updateModalForm);
  }
  if (formatTypeSelect) {
    // When the user changes format type, show/hide the currency input
    formatTypeSelect.addEventListener('change', toggleCurrencyInput);
  }
});

// Export operations
window.handleExport = function (format) {
  // Ensure the pivot component is available
  if (!pivot) {
    console.error('Pivot component not found. Cannot export.');
    alert('Export functionality is not ready yet.');
    return;
  }

  console.log(`Exporting to ${format}...`);

  // Use a switch statement to call the correct method
  switch (format) {
    case 'html':
      pivot.exportToHTML('pivot-table-export');
      break;
    case 'pdf':
      pivot.exportToPDF('pivot-table-export');
      break;
    case 'excel':
      pivot.exportToExcel('pivot-table-export');
      break;
    case 'print':
      pivot.openPrintDialog();
      break;
    default:
      console.error(`Unknown export format requested: ${format}`);
  }
};

function populateFieldsModalStructure() {
  const rowSelect = document.getElementById('row-dimension-select');
  const colSelect = document.getElementById('column-dimension-select');
  const measureContainer = document.getElementById(
    'measure-checkbox-container'
  );

  // Populate dropdowns with available dimensions
  options.dimensions.forEach(dim => {
    console.log(dim);
    const option = document.createElement('option');
    option.value = dim.field;
    option.textContent = dim.label;
    rowSelect.appendChild(option.cloneNode(true));
    colSelect.appendChild(option.cloneNode(true));
  });

  // Populate container with available measures as checkboxes
  options.measures.forEach(measure => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    item.innerHTML = `
      <input type="checkbox" id="measure-${measure.uniqueName}" value="${measure.uniqueName}">
      <label for="measure-${measure.uniqueName}">${measure.caption}</label>
    `;
    measureContainer.appendChild(item);
  });
}

/**
 * Opens the Fields modal and populates it with the current pivot table state.
 */
window.openFieldsModal = function () {
  if (!pivot) return;
  const state = pivot.getState();

  // Set dropdowns to current state
  document.getElementById('row-dimension-select').value =
    state.rows[0]?.uniqueName || '';
  document.getElementById('column-dimension-select').value =
    state.columns[0]?.uniqueName || '';

  // Get active measure names
  const activeMeasureNames = new Set(
    state.selectedMeasures.map(m => m.uniqueName)
  );

  // Set checkboxes to current state
  const measureCheckboxes = document.querySelectorAll(
    '#measure-checkbox-container input[type="checkbox"]'
  );
  measureCheckboxes.forEach(checkbox => {
    checkbox.checked = activeMeasureNames.has(checkbox.value);
  });

  openModal('modal-fields');
};

/**
 * Reads the selections from the Fields modal and reconfigures the pivot table
 * using the setDimensions and setMeasures methods for better performance.
 */
window.applyFieldChanges = function () {
  if (!pivot) {
    console.error('Pivot component not ready.');
    return;
  }

  // --- 1. Get Selections from the Modal ---
  const selectedRowName = document.getElementById('row-dimension-select').value;
  const selectedColName = document.getElementById(
    'column-dimension-select'
  ).value;

  // Find the full dimension objects from the original config
  const selectedRowDim = options.dimensions.find(
    d => d.uniqueName === selectedRowName
  );
  const selectedColDim = options.dimensions.find(
    d => d.uniqueName === selectedColName
  );

  // --- 2. Update Dimensions ---
  // Create the new array of dimensions for rows and columns
  const newDimensions = [];
  if (selectedRowDim) {
    newDimensions.push({ ...selectedRowDim, axis: 'row' });
  }
  if (selectedColDim) {
    newDimensions.push({ ...selectedColDim, axis: 'column' });
  }

  // Call the public method on the web component
  pivot.setDimensions(newDimensions);

  // --- 3. Update Measures ---
  // Find the full measure objects for all checked boxes
  const selectedMeasures = [];
  const measureCheckboxes = document.querySelectorAll(
    '#measure-checkbox-container input[type="checkbox"]:checked'
  );
  measureCheckboxes.forEach(checkbox => {
    const measure = options.measures.find(m => m.uniqueName === checkbox.value);
    if (measure) {
      selectedMeasures.push(measure);
    }
  });

  // Call the public method on the web component
  pivot.setMeasures(selectedMeasures);

  // The component will automatically trigger a stateChange event after
  // setDimensions and setMeasures, so the table will re-render.

  closeModal('modal-fields');
  setRowColumnGroups();
};

function renderTable(state) {
  if (!state) {
    console.error('State is not present');
    return;
  }

  const tableContainer = document.getElementById('myTable');
  tableContainer.innerHTML = '';

  const { processedData, groups, selectedMeasures } = state;

  const grandTotals = processedData.totals;

  const table = document.createElement('table');
  table.className = 'pivot-table';
  tableContainer.appendChild(table);

  //Headers
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  processedData.headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });

  //sales and quantity header
  selectedMeasures.forEach(selectedMeasure => {
    const th = document.createElement('th');
    th.textContent = selectedMeasure.caption;
    headerRow.appendChild(th);
  });

  //main body
  const tbody = table.createTBody();

  processedData.rows.forEach(row => {
    const tr = document.createElement('tr');
    tbody.appendChild(tr);
    row.forEach(data => {
      const td = document.createElement('td');
      td.textContent = data;
      tr.appendChild(td);
    });
  });

  //footer
  const tfoot = table.createTFoot();
  const footerRow = tfoot.insertRow();

  const footTd = document.createElement('td');
  footTd.colSpan = 2;
  footTd.textContent = 'Totals';
  footerRow.appendChild(footTd);

  Object.keys(processedData.totals).forEach(total => {
    const td = document.createElement('td');
    td.textContent = processedData.totals[total];
    footerRow.appendChild(td);
  });
}
