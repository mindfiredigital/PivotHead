import { pivotEngine } from '../index.js';

export function formatCellPopUp(config, PivotEngine) {
  // Get available measures from the engine
  const state = pivotEngine.getState();
  const availableMeasures = state.measures || [];

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';

  const popup = document.createElement('div');
  popup.style.width = '400px';
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

  const header = document.createElement('h2');
  header.textContent = 'Format Cell';
  header.style.margin = '5px';
  header.style.textAlign = 'left';

  const headerSeparator = document.createElement('hr');
  headerSeparator.style.border = '0';
  headerSeparator.style.height = '1px';
  headerSeparator.style.backgroundColor = '#ccc';
  headerSeparator.style.margin = '10px 0';

  const formContainer = document.createElement('div');

  // Updated fields with proper options
  const fields = [
    {
      name: 'Choose Value',
      options: ['None', ...availableMeasures.map(measure => measure.caption)],
    },
    { name: 'Text Align', options: ['Left', 'Right', 'Center'] },
    { name: 'Thousand Separator', options: ['None', 'Comma', 'Space', 'Dot'] },
    { name: 'Decimal Separator', options: ['.', ','] },
    {
      name: 'Decimal Places',
      options: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
    {
      name: 'Currency Symbol',
      options: ['Dollar ($)', 'Rupees (₹)', 'Euro (€)'],
    },
    { name: 'Currency Align', options: ['Left', 'Right'] },
    { name: 'Null Value', options: ['None', 'Null', '0', 'N/A', '-'] },
    // Generic renderTable function that works with any field names
    // function renderTable() {
    //   // Check current view mode
    //   if (currentViewMode === 'raw') {
    //     console.log('Rendering raw data view');
    //     renderRawDataTable();
    //     return;
    //   }

    //   if (!pivotEngine) {
    //     console.error('PivotEngine not initialized');
    //     return;
    //   }

    //   try {
    //     const state = pivotEngine.getState();
    //     console.log('Current Engine State:', state);

    //     if (!state.processedData) {
    //       console.error('No processed data available');
    //       return;
    //     }

    //     // Get field names from configuration
    //     const rowFieldName = pivotEngine.getRowFieldName();
    //     const columnFieldName = pivotEngine.getColumnFieldName();

    //     if (!rowFieldName || !columnFieldName) {
    //       console.error('Row or column field not configured');
    //       return;
    //     }

    //     const tableContainer = document.getElementById('myTable');
    //     if (!tableContainer) {
    //       console.error('Table container not found');
    //       return;
    //     }

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
    //     const columnHeaderRow = document.createElement('tr');

    //     // Add empty cell for top-left corner
    //     const cornerCell = document.createElement('th');
    //     cornerCell.style.padding = '12px';
    //     cornerCell.style.backgroundColor = '#f8f9fa';
    //     cornerCell.style.borderBottom = '2px solid #dee2e6';
    //     cornerCell.style.borderRight = '1px solid #dee2e6';
    //     cornerCell.textContent = `${getFieldDisplayName(rowFieldName)} / ${getFieldDisplayName(columnFieldName)}`;
    //     columnHeaderRow.appendChild(cornerCell);

    //     // Get unique column values in their correct order
    //     const uniqueColumnValues = getOrderedColumnValues();

    //     uniqueColumnValues.forEach((columnValue, index) => {
    //       const th = document.createElement('th');
    //       th.textContent = columnValue;
    //       th.colSpan = state.measures.length;
    //       th.style.padding = '12px';
    //       th.style.backgroundColor = '#f8f9fa';
    //       th.style.borderBottom = '2px solid #dee2e6';
    //       th.style.borderRight = '1px solid #dee2e6';
    //       th.style.textAlign = 'center';
    //       th.dataset.fieldName = columnFieldName;
    //       th.dataset.fieldValue = columnValue;
    //       th.dataset.columnIndex = index; // Store original index
    //       th.setAttribute('draggable', 'true');
    //       th.style.cursor = 'move';
    //       th.className = 'column-header';
    //       columnHeaderRow.appendChild(th);
    //     });
    //     thead.appendChild(columnHeaderRow);

    //     const measureHeaderRow = document.createElement('tr');
    //     const currentSortConfig = state.sortConfig?.[0];

    //     const rowHeader = document.createElement('th');
    //     rowHeader.style.padding = '12px';
    //     rowHeader.style.backgroundColor = '#f8f9fa';
    //     rowHeader.style.borderBottom = '2px solid #dee2e6';
    //     rowHeader.style.borderRight = '1px solid #dee2e6';
    //     rowHeader.style.cursor = 'pointer';

    //     const rowHeaderContent = document.createElement('div');
    //     rowHeaderContent.style.display = 'flex';
    //     rowHeaderContent.style.alignItems = 'center';
    //     const rowText = document.createElement('span');
    //     rowText.textContent = getFieldDisplayName(rowFieldName);
    //     rowHeaderContent.appendChild(rowText);

    //     const rowSortIcon = createSortIcon(rowFieldName, currentSortConfig);
    //     rowHeaderContent.appendChild(rowSortIcon);
    //     rowHeader.appendChild(rowHeaderContent);

    //     rowHeader.addEventListener('click', () => {
    //       const direction =
    //         currentSortConfig?.field === rowFieldName &&
    //         currentSortConfig?.direction === 'asc'
    //           ? 'desc'
    //           : 'asc';
    //       pivotEngine.sort(rowFieldName, direction);
    //     });
    //     measureHeaderRow.appendChild(rowHeader);

    //     uniqueColumnValues.forEach(() => {
    //       state.measures.forEach(measure => {
    //         const th = document.createElement('th');
    //         th.style.padding = '12px';
    //         th.style.backgroundColor = '#f8f9fa';
    //         th.style.borderBottom = '2px solid #dee2e6';
    //         th.style.borderRight = '1px solid #dee2e6';
    //         th.style.cursor = 'pointer';

    //         const headerContent = document.createElement('div');
    //         headerContent.style.display = 'flex';
    //         headerContent.style.alignItems = 'center';
    //         headerContent.style.justifyContent = 'space-between';
    //         const measureText = document.createElement('span');
    //         measureText.textContent = measure.caption;
    //         headerContent.appendChild(measureText);

    //         const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
    //         headerContent.appendChild(sortIcon);
    //         th.appendChild(headerContent);

    //         th.addEventListener('click', () => {
    //           const direction =
    //             currentSortConfig?.field === measure.uniqueName &&
    //             currentSortConfig?.direction === 'asc'
    //               ? 'desc'
    //               : 'asc';
    //           pivotEngine.sort(measure.uniqueName, direction);
    //         });
    //         measureHeaderRow.appendChild(th);
    //       });
    //     });
    //     thead.appendChild(measureHeaderRow);
    //     table.appendChild(thead);

    //     const tbody = document.createElement('tbody');
    //     const allUniqueRowValues = getOrderedRowValues();
    //     updatePagination(allUniqueRowValues, false);
    //     const paginatedRowValues = getPaginatedData(
    //       allUniqueRowValues,
    //       paginationState
    //     );

    //     paginatedRowValues.forEach((rowValue, rowIndex) => {
    //       const tr = document.createElement('tr');
    //       tr.dataset.fieldName = rowFieldName;
    //       tr.dataset.fieldValue = rowValue;
    //       tr.setAttribute('draggable', 'true');
    //       tr.style.cursor = 'move';

    //       const rowCell = document.createElement('td');
    //       rowCell.textContent = rowValue;
    //       rowCell.style.fontWeight = 'bold';
    //       rowCell.style.padding = '8px';
    //       rowCell.style.borderBottom = '1px solid #dee2e6';
    //       rowCell.style.borderRight = '1px solid #dee2e6';
    //       rowCell.className = 'row-cell';
    //       tr.appendChild(rowCell);

    //       uniqueColumnValues.forEach(columnValue => {
    //         const filteredDataForCell = state.rawData.filter(
    //           item =>
    //             item[rowFieldName] === rowValue &&
    //             item[columnFieldName] === columnValue
    //         );

    //         // state.measures.forEach(measure => {
    //         //   const td = document.createElement('td');
    //         //   td.style.padding = '8px';
    //         //   td.style.borderBottom = '1px solid #dee2e6';
    //         //   td.style.borderRight = '1px solid #dee2e6';
    //         //   td.style.textAlign = 'right';

    //         //   let value = 0;
    //         //   if (filteredDataForCell.length > 0) {
    //         //     switch (measure.aggregation) {
    //         //       case 'sum':
    //         //         value = filteredDataForCell.reduce(
    //         //           (sum, item) => sum + (item[measure.uniqueName] || 0),
    //         //           0
    //         //         );
    //         //         break;
    //         //       case 'avg':
    //         //         value =
    //         //           filteredDataForCell.reduce(
    //         //             (sum, item) => sum + (item[measure.uniqueName] || 0),
    //         //             0
    //         //           ) / filteredDataForCell.length;
    //         //         break;
    //         //       case 'max':
    //         //         value = Math.max(
    //         //           ...filteredDataForCell.map(
    //         //             item => item[measure.uniqueName] || 0
    //         //           )
    //         //         );
    //         //         break;
    //         //       case 'min':
    //         //         value = Math.min(
    //         //           ...filteredDataForCell.map(
    //         //             item => item[measure.uniqueName] || 0
    //         //           )
    //         //         );
    //         //         break;
    //         //       default:
    //         //         value = 0;
    //         //     }
    //         //   }

    //         //   const formattedValue = pivotEngine.formatValue(
    //         //     value,
    //         //     measure.uniqueName
    //         //   );
    //         //   addDrillDownToDataCell(
    //         //     td,
    //         //     rowValue,
    //         //     columnValue,
    //         //     measure,
    //         //     value,
    //         //     formattedValue,
    //         //     rowFieldName,
    //         //     columnFieldName
    //         //   );

    //         //   tr.appendChild(td);
    //         // });

    //         state.measures.forEach(measure => {
    //           const td = document.createElement('td');
    //           let value = 0;

    //           // --- Look up formatting (may be blank/default for some fields) ---
    //           const format = measure && measure.format ? measure.format : {};

    //           // --- Handle null/undefined display ---
    //           let cellVal =
    //             typeof value === 'undefined' || value === null
    //               ? format.nullValue !== undefined
    //                 ? format.nullValue
    //                 : ''
    //               : value;

    //           // --- Format number (currency, percent, thousand/decimal separator, decimals) ---
    //           let formattedValue = cellVal;
    //           if (typeof cellVal === 'number' && cellVal !== '') {
    //             let num = cellVal;
    //             let decimals =
    //               typeof format.decimals === 'number' ? format.decimals : 2;

    //             let opts = {};
    //             let isPercent = !!format.percent;

    //             // Handle percent display (show as 0.34 -> 34%)
    //             if (isPercent) {
    //               num = num * 100;
    //               opts.style = 'percent';
    //               opts.minimumFractionDigits = decimals;
    //               opts.maximumFractionDigits = decimals;
    //             }

    //             // Handle currency display
    //             if (format.type === 'currency' && format.currency) {
    //               opts.style = 'currency';
    //               opts.currency = format.currency;
    //               opts.minimumFractionDigits = decimals;
    //               opts.maximumFractionDigits = decimals;
    //             } else {
    //               opts.minimumFractionDigits = decimals;
    //               opts.maximumFractionDigits = decimals;
    //             }

    //             // Format number with local/thousand/decimal options
    //             let locale = format.locale || 'en-US';

    //             formattedValue = new Intl.NumberFormat(locale, opts).format(num);

    //             // Replace thousand/decimal separators if customized
    //             if (format.thousandSeparator || format.decimalSeparator) {
    //               let parts = formattedValue.split('');
    //               let lastDot = formattedValue.lastIndexOf('.');
    //               if (format.decimalSeparator && lastDot !== -1) {
    //                 parts[lastDot] = format.decimalSeparator;
    //               }
    //               formattedValue = parts.join('');
    //               if (format.thousandSeparator) {
    //                 // crude replace: only handles , and space
    //                 formattedValue = formattedValue.replace(
    //                   /,/g,
    //                   format.thousandSeparator
    //                 );
    //               }
    //             }
    //           }

    //           // --- Text alignment ---
    //           td.style.textAlign = format.align || format.textAlign || 'right';

    //           // --- Null handling ---
    //           if ((cellVal === '' || cellVal === null) && format.nullValue) {
    //             formattedValue = format.nullValue;
    //           }

    //           // --- Add value to cell ---
    //           td.textContent = formattedValue;

    //           // --- Currency alignment option (optional, could do css for finer control) ---

    //           // Attach drilldown (if needed)
    //           addDrillDownToDataCell(
    //             td,
    //             rowValue,
    //             columnValue,
    //             measure,
    //             value,
    //             formattedValue,
    //             rowFieldName,
    //             columnFieldName
    //           );

    //           tr.appendChild(td);
    //         });
    //       });
    //       tbody.appendChild(tr);
    //     });

    //     table.appendChild(tbody);
    //     tableContainer.appendChild(table);

    //     updatePaginationInfo('Processed Data');
    //     setupDragAndDrop();
    //   } catch (error) {
    //     console.error('Error rendering table:', error);
    //     const tableContainer = document.getElementById('myTable');
    //     if (tableContainer) {
    //       tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
    //     }
    //   }
    // }

    // Replace the renderTable function in your index.js with this fixed version
    { name: 'Format as Percent', options: ['No', 'Yes'] },
  ];

  const dropdownValues = fields.map(field => ({
    field: field.name,
    value: field.options[0],
  }));

  const dropdownElements = [];

  fields.forEach((field, index) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '15px';

    const label = document.createElement('label');
    label.textContent = `${field.name}:`;
    label.style.flex = '1';
    label.style.marginRight = '10px';

    const dropdown = document.createElement('select');
    dropdown.style.flex = '2';
    dropdown.style.padding = '10px';
    dropdown.style.borderRadius = '4px';
    dropdown.style.border = '1px solid #ccc';

    // Populate the dropdown with options
    field.options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    // Disable all fields except "Choose Value" initially
    if (index !== 0) {
      dropdown.disabled = true;
    }

    // Enable/disable other fields based on "Choose Value" selection
    if (index === 0) {
      dropdown.addEventListener('change', e => {
        const selectedValue = e.target.value;
        dropdownValues[index].value = selectedValue;

        if (selectedValue !== 'None') {
          // Enable all other dropdowns
          dropdownElements.forEach((dropdown, i) => {
            if (i !== 0) {
              dropdown.disabled = false;
            }
          });
        } else {
          // Disable all other dropdowns
          dropdownElements.forEach((dropdown, i) => {
            if (i !== 0) {
              dropdown.disabled = true;
            }
          });
        }
      });
    }

    dropdown.addEventListener('change', e => {
      dropdownValues[index].value = e.target.value;
    });

    row.appendChild(label);
    row.appendChild(dropdown);
    formContainer.appendChild(row);
    dropdownElements.push(dropdown);
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.marginTop = '20px';

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.style.padding = '12px 24px';
  applyButton.style.backgroundColor = '#28a745';
  applyButton.style.color = '#fff';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '6px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.fontSize = '16px';
  applyButton.style.fontWeight = 'bold';
  applyButton.style.margin = '0px 10px';
  applyButton.style.transition =
    'background-color 0.3s ease, transform 0.2s ease';

  applyButton.addEventListener('mouseover', () => {
    applyButton.style.backgroundColor = '#218838';
    applyButton.style.transform = 'scale(1.05)';
  });

  applyButton.addEventListener('mouseout', () => {
    applyButton.style.backgroundColor = '#28a745';
    applyButton.style.transform = 'scale(1)';
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '12px 24px';
  cancelButton.style.backgroundColor = '#dc3545';
  cancelButton.style.color = '#fff';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '16px';
  cancelButton.style.fontWeight = 'bold';
  cancelButton.style.margin = '0px 10px';
  cancelButton.style.transition =
    'background-color 0.3s ease, transform 0.2s ease';

  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.backgroundColor = '#c82333';
    cancelButton.style.transform = 'scale(1.05)';
  });

  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.backgroundColor = '#dc3545';
    cancelButton.style.transform = 'scale(1)';
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  applyButton.addEventListener('click', () => {
    console.log('Selected Values:', dropdownValues);

    console.log(
      'Text Align:',
      dropdownValues.find(item => item.field === 'Text Align')?.value
    );
    console.log(
      'Currency Align:',
      dropdownValues.find(item => item.field === 'Currency Align')?.value
    );

    // Get the selected measure
    const selectedMeasure = dropdownValues.find(
      item => item.field === 'Choose Value'
    )?.value;

    if (selectedMeasure && selectedMeasure !== 'None') {
      // Find the corresponding measure
      const measure = availableMeasures.find(
        m => m.caption === selectedMeasure
      );

      if (measure) {
        // Map UI selections to internal formatting values
        let currencySymbol = dropdownValues.find(
          item => item.field === 'Currency Symbol'
        )?.value;
        let currency = 'USD';
        if (currencySymbol?.includes('Dollar')) currency = 'USD';
        else if (currencySymbol?.includes('Rupees')) currency = 'INR';
        else if (currencySymbol?.includes('Euro')) currency = 'EUR';

        // Thousand Separator mapping
        let thousandSeparatorVal = dropdownValues.find(
          item => item.field === 'Thousand Separator'
        )?.value;
        let thousandSeparator = ','; // default
        if (thousandSeparatorVal === 'None') thousandSeparator = '';
        else if (thousandSeparatorVal === 'Space') thousandSeparator = ' ';
        else if (thousandSeparatorVal === 'Comma') thousandSeparator = ',';
        else if (thousandSeparatorVal === 'Dot') thousandSeparator = '.';

        // Decimal Separator mapping
        let decimalSeparator =
          dropdownValues.find(item => item.field === 'Decimal Separator')
            ?.value || '.';

        // Decimal Places
        let decimals = parseInt(
          dropdownValues.find(item => item.field === 'Decimal Places')?.value,
          10
        );
        if (isNaN(decimals)) decimals = 2; // default

        // Text Align
        let textAlign =
          dropdownValues
            .find(item => item.field === 'Text Align')
            ?.value?.toLowerCase() || 'right';

        // Currency Align
        let currencyAlign =
          dropdownValues
            .find(item => item.field === 'Currency Align')
            ?.value?.toLowerCase() || 'left';

        // Null Value
        let nullValue = dropdownValues.find(
          item => item.field === 'Null Value'
        )?.value;
        if (nullValue === 'None') nullValue = '';
        else if (nullValue === 'Null') nullValue = null;
        // Otherwise use the selected value as is

        // Percent Format
        let formatAsPercent = dropdownValues.find(
          item => item.field === 'Format as Percent'
        )?.value;
        let percent = formatAsPercent === 'Yes';

        // Determine format type
        let formatType = 'number';
        if (percent) formatType = 'percentage';
        else if (currency !== 'USD' || currencySymbol) formatType = 'currency';

        // Create the enhanced format object
        const enhancedFormat = {
          type: formatType,
          currency: currency,
          locale: 'en-US',
          decimals: decimals,
          thousandSeparator: thousandSeparator,
          decimalSeparator: decimalSeparator,
          align: textAlign,
          currencyAlign: currencyAlign,
          nullValue: nullValue,
          percent: percent,
        };

        // Use the enhanced engine's updateFieldFormatting method
        pivotEngine.updateFieldFormatting(measure.uniqueName, enhancedFormat);

        console.log(
          'Updated Field Formatting using enhanced engine:',
          enhancedFormat
        );
      }
    } else {
      console.log('No valid measure selected. Config unchanged.');
    }

    // Close the popup
    document.body.removeChild(overlay);
  });

  buttonContainer.appendChild(applyButton);
  buttonContainer.appendChild(cancelButton);

  popup.appendChild(header);
  popup.appendChild(headerSeparator);
  popup.appendChild(formContainer);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
