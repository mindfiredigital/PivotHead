import '@mindfiredigital/pivothead-web-component';

const pivot = document.getElementById('pivot');
const tableEl = document.getElementById('table');

const ui = {
  mode: 'processed',
  processed: { colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } },
  raw: { colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } },
  dnd: { type: null, fromIndex: -1 },
};

function currentStore() {
  return ui[ui.mode];
}
function setSwitchButtonLabel() {
  const btn = document.getElementById('switchView');
  if (!btn) return;
  btn.textContent =
    ui.mode === 'processed' ? 'Switch to Raw' : 'Switch to Processed';
}

function ensureFilterFieldOptions(state) {
  const select = document.getElementById('filterField');
  if (!select) return;
  const opts = [];
  if (ui.mode === 'processed') {
    state.rows?.forEach(r =>
      opts.push(`<option value="${r.uniqueName}">${r.caption}</option>`)
    );
    state.columns?.forEach(c =>
      opts.push(`<option value="${c.uniqueName}">${c.caption}</option>`)
    );
    state.measures?.forEach(m =>
      opts.push(
        `<option value="${m.aggregation}_${m.uniqueName}">${m.caption}</option>`
      )
    );
  } else {
    const raw = pivot.getRawData?.() || [];
    const keys = raw.length ? Object.keys(raw[0]) : [];
    keys.forEach(k => opts.push(`<option value="${k}">${k}</option>`));
  }
  select.innerHTML = opts.join('');
}

function renderFromState(state) {
  try {
    ui.mode = pivot.getViewMode ? pivot.getViewMode() : ui.mode;
  } catch {}
  setSwitchButtonLabel();
  if (ui.mode === 'processed') renderProcessed(state);
  else renderRaw();
  wireTableInteractions();
  updatePaginationInfo();
}

function renderProcessed(state) {
  const store = currentStore();
  const rowField = state.rows?.[0];
  const colField = state.columns?.[0];
  const measures = state.measures || [];
  if (!rowField || !colField || measures.length === 0) {
    tableEl.innerHTML = '';
    return;
  }
  const groups = pivot.getGroupedData();
  let uniqueCols = [
    ...new Set(
      groups.map(g => (g.key ? g.key.split('|')[1] || g.key.split('|')[0] : ''))
    ),
  ].filter(Boolean);
  if (store.colOrder.length === 0) store.colOrder = [...uniqueCols];
  uniqueCols = store.colOrder.filter(c => uniqueCols.includes(c));

  const processedRows = state.processedData?.rows || [];
  const seen = new Set();
  let uniqueRows = [];
  processedRows.forEach(r => {
    const v = r[0];
    if (!seen.has(v)) {
      seen.add(v);
      uniqueRows.push(v);
    }
  });
  if (store.rowOrder.length)
    uniqueRows = store.rowOrder.filter(v => uniqueRows.includes(v));

  let html = '<thead>';
  html += `<tr class="groups"><th class="draggable" data-drag="row-header">${rowField.caption} / ${colField.caption}</th>`;
  uniqueCols.forEach((c, i) => {
    html += `<th class="draggable" draggable="true" data-type="col" data-index="${i}" colspan="${measures.length}">${c}</th>`;
  });
  html += '</tr>';

  const rowSortClass =
    store.sort.field === rowField.uniqueName ? ` sorted-${store.sort.dir}` : '';
  html += `<tr class="measures"><th class="sortable${rowSortClass}" data-sort-field="${rowField.uniqueName}">${rowField.caption}</th>`;
  uniqueCols.forEach(() => {
    measures.forEach(m => {
      const mSortClass =
        store.sort.field === m.uniqueName ? ` sorted-${store.sort.dir}` : '';
      html += `<th class="sortable${mSortClass}" data-sort-field="${m.uniqueName}">${m.caption}</th>`;
    });
  });
  html += '</tr></thead><tbody>';

  const { currentPage, pageSize } = pivot.getPagination();
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  uniqueRows.slice(start, end).forEach((rowVal, rIdx) => {
    html += `<tr class="draggable" draggable="true" data-type="row" data-index="${rIdx}" data-value="${rowVal}">`;
    html += `<td><strong>${rowVal}</strong></td>`;
    uniqueCols.forEach(colVal => {
      measures.forEach(m => {
        const group = groups.find(g => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[0] === rowVal && (keys[1] || keys[0]) === colVal;
        });
        const key = `${m.aggregation}_${m.uniqueName}`;
        const agg = group?.aggregates?.[key];

        // Use pivot's formatting API
        let display = '0';
        if (typeof agg === 'number' && pivot.formatValue) {
          try {
            display = pivot.formatValue(agg, m.uniqueName);
          } catch {
            display = agg.toLocaleString();
          }
        } else if (agg != null) {
          display = String(agg);
        }

        // Get text alignment from pivot API
        let alignment = 'left';
        if (pivot.getFieldAlignment) {
          try {
            alignment = pivot.getFieldAlignment(m.uniqueName) || 'left';
          } catch {}
        }

        const hasData = Number(agg) > 0;
        html += `<td class="${hasData ? 'drill-down-cell' : ''}" style="text-align: ${alignment}"
                 data-row-value="${String(rowVal)}"
                 data-column-value="${String(colVal)}"
                 data-measure-name="${m.uniqueName}"
                 data-measure-caption="${m.caption}"
                 data-measure-agg="${m.aggregation}"
                 data-row-field="${rowField.uniqueName}"
                 data-column-field="${colField.uniqueName}"
                 data-aggregate-value="${typeof agg === 'number' ? agg : Number(agg) || 0}"
                 title="${hasData ? 'Click to view underlying records' : ''}">${display}</td>`;
      });
    });
    html += '</tr>';
  });
  html += '</tbody>';
  tableEl.innerHTML = html;
}

function renderRaw() {
  const store = currentStore();
  const rows =
    typeof pivot.getData === 'function'
      ? pivot.getData() || []
      : pivot.getState?.().rawData || [];
  const keys = rows.length ? Object.keys(rows[0]) : [];
  if (store.colOrder.length === 0) store.colOrder = [...keys];
  const colOrder = store.colOrder.filter(k => keys.includes(k));

  const sort = store.sort;
  let viewRows = [...rows];
  if (sort.field) {
    viewRows.sort((a, b) => {
      const av = a[sort.field],
        bv = b[sort.field];
      if (typeof av === 'number' && typeof bv === 'number')
        return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }

  if (store.rowOrder.length) {
    const orderSet = new Set(store.rowOrder.map(String));
    viewRows = viewRows
      .sort((a, b) => {
        const ia = store.rowOrder.indexOf(String(a[colOrder[0]]));
        const ib = store.rowOrder.indexOf(String(b[colOrder[0]]));
        return ia - ib;
      })
      .concat(viewRows.filter(r => !orderSet.has(String(r[colOrder[0]]))));
  }

  const { currentPage, pageSize } = pivot.getPagination();
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = viewRows.slice(start, end);

  let html = '<thead><tr class="measures">';
  colOrder.forEach((k, i) => {
    const sortClass = store.sort.field === k ? ` sorted-${store.sort.dir}` : '';
    html += `<th class="draggable sortable${sortClass}" draggable="true" data-type="col" data-index="${i}" data-sort-field="${k}">${k}</th>`;
  });
  html += '</tr></thead><tbody>';
  pageRows.forEach((row, rIdx) => {
    html += `<tr class="draggable" draggable="true" data-type="row" data-index="${rIdx}" data-global-index="${start + rIdx}">`;
    colOrder.forEach(k => {
      const value = row[k];

      // Use pivot's formatting API for numeric values
      let display = value != null ? String(value) : '';
      if (typeof value === 'number' && pivot.formatValue) {
        try {
          display = pivot.formatValue(value, k);
        } catch {
          display = value.toLocaleString();
        }
      }

      // Get text alignment from pivot API
      let alignment = 'left';
      if (pivot.getFieldAlignment) {
        try {
          alignment = pivot.getFieldAlignment(k) || 'left';
        } catch {}
      }

      html += `<td style="text-align: ${alignment}">${display}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  tableEl.innerHTML = html;
}

function wireToolbar() {
  document.getElementById('applyFilter').onclick = () => {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOperator').value;
    const value = document.getElementById('filterValue').value;
    if (!field || !operator || !value) return;
    pivot.filters = [{ field, operator, value }];
    try {
      pivot.goToPage(1);
    } catch {}
    try {
      renderFromState(pivot.getState());
    } catch {}
  };

  document.getElementById('resetFilter').onclick = () => {
    try {
      pivot.filters = [];
    } catch {}
    try {
      pivot.reset();
    } catch {}
    const input = document.getElementById('filterValue');
    if (input) input.value = '';
    const fieldSel = document.getElementById('filterField');
    if (fieldSel && fieldSel.options.length) fieldSel.selectedIndex = 0;
    const opSel = document.getElementById('filterOperator');
    if (opSel) opSel.value = 'equals';
    try {
      pivot.goToPage(1);
    } catch {}
    try {
      renderFromState(pivot.getState());
    } catch {}
  };

  const pageSizeEl = document.getElementById('pageSize');
  if (pageSizeEl) {
    pageSizeEl.addEventListener('change', e => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      const val = Number(e.target && e.target.value);
      if (!Number.isFinite(val) || val <= 0) return;
      if (pivot && typeof pivot.setPageSize === 'function') {
        try {
          pivot.setPageSize(val);
        } catch {}
      }
    });
  }

  document.getElementById('prevPage').onclick = () => pivot.previousPage();
  document.getElementById('nextPage').onclick = () => pivot.nextPage();

  document.getElementById('switchView').onclick = () => {
    ui.mode = ui.mode === 'processed' ? 'raw' : 'processed';
    if (pivot.setViewMode) pivot.setViewMode(ui.mode);
    setSwitchButtonLabel();
    try {
      pivot.goToPage(1);
    } catch {}
    try {
      ensureFilterFieldOptions(pivot.getState());
    } catch {}
    try {
      renderFromState(pivot.getState());
    } catch {}
  };

  document.getElementById('formatButton').onclick = () => {
    try {
      showFormatPopup();
    } catch (error) {
      console.error('Error opening format popup:', error);
    }
  };

  document.getElementById('exportHTML').onclick = () =>
    pivot.exportToHTML?.('pivot-table');
  document.getElementById('exportPDF').onclick = () =>
    pivot.exportToPDF?.('pivot-table');
  document.getElementById('exportExcel').onclick = () =>
    pivot.exportToExcel?.('pivot-table');
  document.getElementById('printTable').onclick = () =>
    pivot.openPrintDialog?.();
}

function wireTableInteractions() {
  tableEl.querySelectorAll('th.sortable').forEach(th => {
    th.onclick = () => {
      const field = th.getAttribute('data-sort-field');
      if (ui.mode === 'processed') {
        if (!field) return;
        const store = currentStore();
        const nextDir =
          store.sort.field === field && store.sort.dir === 'asc'
            ? 'desc'
            : 'asc';
        store.sort = { field, dir: nextDir };
        if (pivot.sort) pivot.sort(field, nextDir);
        store.rowOrder = [];
      } else {
        const store = currentStore();
        const nextDir =
          store.sort.field === field && store.sort.dir === 'asc'
            ? 'desc'
            : 'asc';
        store.sort = { field, dir: nextDir };
        if (field && pivot.sort) pivot.sort(field, nextDir);
      }
    };
  });

  tableEl.querySelectorAll('th.draggable[draggable="true"]').forEach(th => {
    th.addEventListener('dragstart', e => {
      ui.dnd = { type: 'col', fromIndex: Number(th.dataset.index) };
      e.dataTransfer?.setData('text/plain', 'col');
    });
    th.addEventListener('dragover', e => {
      e.preventDefault();
      th.classList.add('drag-over');
    });
    th.addEventListener('dragleave', () => th.classList.remove('drag-over'));
    th.addEventListener('drop', e => {
      e.preventDefault();
      th.classList.remove('drag-over');
      const toIndex = Number(th.dataset.index);
      if (ui.dnd.type !== 'col') return;
      const store = currentStore();
      const arr = store.colOrder;
      const [moved] = arr.splice(ui.dnd.fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      try {
        renderFromState(pivot.getState());
      } catch {}
    });
  });

  tableEl.querySelectorAll('tr.draggable[draggable="true"]').forEach(tr => {
    tr.addEventListener('dragstart', e => {
      ui.dnd = {
        type: 'row',
        fromIndex:
          ui.mode === 'raw'
            ? Number(tr.dataset.globalIndex)
            : Number(tr.dataset.index),
      };
      e.dataTransfer?.setData('text/plain', 'row');
    });
    tr.addEventListener('dragover', e => {
      e.preventDefault();
      tr.classList.add('drag-over');
    });
    tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
    tr.addEventListener('drop', e => {
      e.preventDefault();
      tr.classList.remove('drag-over');
      if (ui.dnd.type !== 'row') return;
      if (ui.mode === 'raw') {
        const toIndex = Number(tr.dataset.globalIndex);
        if (typeof pivot.swapRows === 'function') {
          try {
            pivot.swapRows(ui.dnd.fromIndex, toIndex);
          } catch {}
        }
        try {
          renderFromState(pivot.getState());
        } catch {}
      } else {
        const toIndex = Number(tr.dataset.index);
        const store = currentStore();
        const labels = Array.from(
          tableEl.querySelectorAll('tbody tr td:first-child')
        ).map(td => td.textContent);
        store.rowOrder = labels;
        const [moved] = store.rowOrder.splice(ui.dnd.fromIndex, 1);
        store.rowOrder.splice(toIndex, 0, moved);
        try {
          renderFromState(pivot.getState());
        } catch {}
      }
    });
  });

  if (ui.mode === 'processed') {
    tableEl.querySelectorAll('td.drill-down-cell').forEach(td => {
      td.addEventListener('click', () => {
        const rowValue = td.getAttribute('data-row-value') || '';
        const columnValue = td.getAttribute('data-column-value') || '';
        const measureName = td.getAttribute('data-measure-name') || '';
        const measureCaption =
          td.getAttribute('data-measure-caption') || measureName;
        const measureAgg = td.getAttribute('data-measure-agg') || 'sum';
        const rowField = td.getAttribute('data-row-field') || '';
        const columnField = td.getAttribute('data-column-field') || '';
        const cellAgg = Number(td.getAttribute('data-aggregate-value') || '0');

        let state;
        try {
          state = pivot.getState();
        } catch {
          state = null;
        }
        const raw = state ? state.rawData || state.data || [] : [];
        const subset = raw.filter(r => {
          const rv = rowField ? String(r[rowField] ?? '') : '';
          const cv = columnField ? String(r[columnField] ?? '') : '';
          return rv === String(rowValue) && cv === String(columnValue);
        });

        let computed = 0;
        if (subset.length && measureName) {
          const nums = subset.map(r => Number(r[measureName] ?? 0));
          if (measureAgg === 'avg')
            computed = nums.reduce((a, b) => a + b, 0) / nums.length;
          else if (measureAgg === 'max')
            computed = nums.length ? Math.max(...nums) : 0;
          else if (measureAgg === 'min')
            computed = nums.length ? Math.min(...nums) : 0;
          else if (measureAgg === 'count') computed = subset.length;
          else computed = nums.reduce((a, b) => a + b, 0);
        }
        const aggDisplay = (
          Number.isFinite(cellAgg) && cellAgg !== 0 ? cellAgg : computed
        ).toLocaleString();

        showDrillDownModal({
          title: `${rowField}: ${rowValue}${columnField ? `, ${columnField}: ${columnValue}` : ''}`,
          summary: `Records: ${subset.length}. ${measureCaption} (${measureAgg}) = ${aggDisplay}`,
          rows: subset,
        });
      });
    });
  }
}

function showFormatPopup() {
  let state;
  try {
    state = pivot.getState();
  } catch {
    console.error('Engine not initialized');
    return;
  }

  const availableMeasures = state.measures || [];

  // Get available fields based on current mode - only numeric/measure fields
  let availableFields = [];
  if (ui.mode === 'raw') {
    // For raw data, get only numeric fields (measures) from the data
    if (state.rawData && state.rawData.length > 0) {
      const allFields = Object.keys(state.rawData[0]);
      // Filter to only include measure fields (price, discount, etc.)
      availableFields = allFields.filter(field => {
        const sampleValue = state.rawData[0][field];
        return typeof sampleValue === 'number';
      });
    }
  } else {
    // For processed data, get measure names
    availableFields = availableMeasures.map(
      measure => measure.caption || measure.uniqueName
    );
  }

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  });

  const popup = document.createElement('div');
  Object.assign(popup.style, {
    width: '400px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  });

  const header = document.createElement('h2');
  header.textContent = 'Format cells';
  Object.assign(header.style, {
    margin: '0 0 10px 0',
    textAlign: 'left',
  });

  const headerSeparator = document.createElement('hr');
  Object.assign(headerSeparator.style, {
    border: '0',
    height: '1px',
    backgroundColor: '#ccc',
    margin: '10px 0',
  });

  const formContainer = document.createElement('div');

  // Form fields configuration
  const fields = [
    {
      name: 'Choose value',
      options: ['Choose value', 'All values', ...availableFields],
    },
    { name: 'Text align', options: ['right', 'left', 'center'] },
    {
      name: 'Thousand separator',
      options: ['(Space)', '(Comma)', '(None)', '(Dot)'],
    },
    { name: 'Decimal separator', options: ['.', ','] },
    { name: 'Decimal places', options: ['None', '0', '1', '2', '3', '4', '5'] },
    { name: 'Currency symbol', options: ['', '$', '₹', '€', '£'] },
    { name: 'Currency align', options: ['left', 'right'] },
    { name: 'Null value', options: ['', 'null', '0', 'N/A', '-'] },
    { name: 'Format as percent', options: ['false', 'true'] },
  ];

  const formValues = {};
  const dropdownElements = [];

  fields.forEach((field, index) => {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
    });

    const label = document.createElement('label');
    label.textContent = field.name;
    Object.assign(label.style, {
      flex: '1',
      marginRight: '10px',
      textAlign: 'left',
    });

    const dropdown = document.createElement('select');
    Object.assign(dropdown.style, {
      flex: '2',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    });

    // Populate dropdown options
    field.options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      dropdown.appendChild(option);
    });

    // Set initial value
    formValues[field.name] = field.options[0];

    // Disable all fields except first one initially
    if (index !== 0) {
      dropdown.disabled = true;
    }

    // Handle change events
    dropdown.addEventListener('change', e => {
      const target = e.target;
      formValues[field.name] = target.value;

      // Enable/disable other fields based on first field
      if (index === 0) {
        const selectedValue = target.value;
        dropdownElements.forEach((el, i) => {
          if (i !== 0) {
            el.disabled = selectedValue === 'Choose value';
          }
        });
      }
    });

    row.appendChild(label);
    row.appendChild(dropdown);
    formContainer.appendChild(row);
    dropdownElements.push(dropdown);
  });

  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
  });

  const applyButton = document.createElement('button');
  applyButton.textContent = 'APPLY';
  Object.assign(applyButton.style, {
    padding: '10px 20px',
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'CANCEL';
  Object.assign(cancelButton.style, {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  });

  // Event handlers
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  applyButton.addEventListener('click', () => {
    const selectedField = formValues['Choose value'];

    if (selectedField && selectedField !== 'Choose value') {
      // Map UI values to FormatOptions
      const formatOptions = {};

      // Text align
      if (formValues['Text align']) {
        formatOptions.align = formValues['Text align'];
      }

      // Thousand separator
      const thousandSep = formValues['Thousand separator'];
      if (thousandSep === '(Space)') formatOptions.thousandSeparator = ' ';
      else if (thousandSep === '(Comma)') formatOptions.thousandSeparator = ',';
      else if (thousandSep === '(None)') formatOptions.thousandSeparator = '';
      else if (thousandSep === '(Dot)') formatOptions.thousandSeparator = '.';

      // Decimal separator
      if (formValues['Decimal separator']) {
        formatOptions.decimalSeparator = formValues['Decimal separator'];
      }

      // Decimal places
      if (
        formValues['Decimal places'] &&
        formValues['Decimal places'] !== 'None'
      ) {
        formatOptions.decimals = parseInt(formValues['Decimal places'], 10);
      }

      // Currency
      const currencySymbol = formValues['Currency symbol'];
      if (currencySymbol) {
        formatOptions.type = 'currency';
        if (currencySymbol === '$') formatOptions.currency = 'USD';
        else if (currencySymbol === '₹') formatOptions.currency = 'INR';
        else if (currencySymbol === '€') formatOptions.currency = 'EUR';
        else if (currencySymbol === '£') formatOptions.currency = 'GBP';
      }

      // Currency align
      if (formValues['Currency align']) {
        formatOptions.currencyAlign = formValues['Currency align'];
      }

      // Null value
      if (formValues['Null value']) {
        formatOptions.nullValue =
          formValues['Null value'] === 'null' ? null : formValues['Null value'];
      }

      // Format as percent
      if (formValues['Format as percent'] === 'true') {
        formatOptions.percent = true;
        formatOptions.type = 'percentage';
      }

      // Apply formatting using pivot web component API
      try {
        if (selectedField === 'All values') {
          // Apply to all numeric fields
          if (ui.mode === 'raw') {
            // For raw data, apply to all numeric fields
            if (state.rawData && state.rawData.length > 0) {
              const allFields = Object.keys(state.rawData[0]);
              const numericFields = allFields.filter(field => {
                const sampleValue = state.rawData[0][field];
                return typeof sampleValue === 'number';
              });
              numericFields.forEach(field => {
                if (pivot.updateFieldFormatting) {
                  pivot.updateFieldFormatting(field, formatOptions);
                }
              });
              console.log(
                'Applied formatting to all numeric fields:',
                numericFields
              );
            }
          } else {
            // For processed data, apply to all measures
            availableMeasures.forEach(measure => {
              if (pivot.updateFieldFormatting) {
                pivot.updateFieldFormatting(measure.uniqueName, formatOptions);
              }
            });
            console.log(
              'Applied formatting to all measures:',
              availableMeasures.map(m => m.uniqueName)
            );
          }
        } else {
          // Apply to specific field
          let fieldName = selectedField;
          if (ui.mode === 'processed') {
            // For processed data, find the measure's uniqueName
            const measure = availableMeasures.find(
              m => m.caption === selectedField || m.uniqueName === selectedField
            );
            if (measure) {
              fieldName = measure.uniqueName;
            }
          }

          if (pivot.updateFieldFormatting) {
            pivot.updateFieldFormatting(fieldName, formatOptions);
          }
          console.log(
            'Applied formatting:',
            formatOptions,
            'to field:',
            fieldName
          );
        }

        // Trigger re-render
        try {
          renderFromState(pivot.getState());
        } catch (e) {
          console.error('Error re-rendering after format:', e);
        }
      } catch (error) {
        console.error('Error applying formatting:', error);
      }
    }

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

function showDrillDownModal({ title, summary, rows }) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
  });
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,.2)',
    padding: '16px',
    width: '90%',
    maxWidth: '840px',
    maxHeight: '80vh',
    overflow: 'auto',
  });
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  });
  const h = document.createElement('div');
  h.style.fontWeight = '700';
  h.textContent = `Details: ${title}`;
  const x = document.createElement('button');
  x.textContent = '×';
  Object.assign(x.style, {
    fontSize: '18px',
    border: 'none',
    background: '#ef4444',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
  });
  header.appendChild(h);
  header.appendChild(x);
  const sum = document.createElement('div');
  sum.textContent = summary;
  Object.assign(sum.style, {
    background: '#f3f4f6',
    padding: '8px',
    borderRadius: '6px',
    margin: '8px 0',
  });
  const body = document.createElement('div');
  if (rows && rows.length) {
    const headers = Object.keys(rows[0]);
    const table = document.createElement('table');
    Object.assign(table.style, {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
    });
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    headers.forEach(k => {
      const th = document.createElement('th');
      th.textContent = k;
      Object.assign(th.style, {
        border: '1px solid #e5e7eb',
        padding: '6px 8px',
        background: '#f9fafb',
        textAlign: 'left',
      });
      thr.appendChild(th);
    });
    thead.appendChild(thr);
    const tbody = document.createElement('tbody');
    rows.forEach(r => {
      const tr = document.createElement('tr');
      headers.forEach(k => {
        const td = document.createElement('td');
        td.textContent = r[k] != null ? String(r[k]) : '';
        Object.assign(td.style, {
          border: '1px solid #e5e7eb',
          padding: '6px 8px',
        });
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    body.appendChild(table);
  } else {
    body.textContent = 'No matching records.';
  }
  panel.appendChild(header);
  panel.appendChild(sum);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });
  x.addEventListener('click', close);
}

function updatePaginationInfo() {
  const p = pivot.getPagination();
  const el = document.getElementById('pageInfo');
  if (el) el.textContent = `Page ${p.currentPage} of ${p.totalPages}`;
  const pageSizeSel = document.getElementById('pageSize');
  if (pageSizeSel && String(p.pageSize) !== pageSizeSel.value) {
    pageSizeSel.value = String(p.pageSize);
  }
}

let didSyncPageSize = false;
function bootstrapInitialRender() {
  let tries = 0;
  const max = 20;
  const tick = () => {
    try {
      const state = pivot.getState();
      if (state && (ui.mode === 'raw' || state.processedData)) {
        if (!document.getElementById('filterField').children.length)
          ensureFilterFieldOptions(state);
        if (!didSyncPageSize) {
          const sel = document.getElementById('pageSize');
          const desired = Number(sel && sel.value) || 10;
          const p = pivot.getPagination?.();
          if (
            p &&
            p.pageSize !== desired &&
            typeof pivot.setPageSize === 'function'
          ) {
            try {
              pivot.setPageSize(desired);
            } catch {}
          }
          didSyncPageSize = true;
        }
        renderFromState(state);
        return;
      }
    } catch {}
    if (++tries < max) setTimeout(tick, 50);
  };
  tick();
}

pivot.addEventListener('stateChange', e => {
  const state = e.detail;
  if (!document.getElementById('filterField').children.length)
    ensureFilterFieldOptions(state);
  renderFromState(state);
});

pivot.addEventListener('paginationChange', () => {
  try {
    renderFromState(pivot.getState());
  } catch {}
});

pivot.addEventListener('viewModeChange', () => {
  try {
    ui.mode = pivot.getViewMode();
  } catch {}
  setSwitchButtonLabel();
  try {
    ensureFilterFieldOptions(pivot.getState());
  } catch {}
  try {
    renderFromState(pivot.getState());
  } catch {}
});

pivot.addEventListener('pivotError', e => {
  console.warn('Pivot error:', e.detail || {});
});

(function init() {
  // No shadow DOM UI in none mode; we fully own the DOM here
  wireToolbar();
  try {
    pivot.setViewMode('processed');
  } catch {}
  customElements.whenDefined('pivot-head').then(() => bootstrapInitialRender());
})();
