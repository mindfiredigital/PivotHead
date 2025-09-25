import '@mindfiredigital/pivothead-web-component';

const pivot = document.getElementById('pivot');
const tableEl = document.getElementById('table');

// Local UI state for minimal mode
const ui = {
  mode: 'processed', // processed | raw
  processed: { colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } },
  raw: { colOrder: [], rowOrder: [], sort: { field: null, dir: 'asc' } },
  dnd: { type: null, fromIndex: -1 },
};

function getCurrentStore() {
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
    // raw: all fields from first row
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
  console.log('🔥 Minimal Demo: renderProcessed called with state:', state);
  const store = getCurrentStore();
  const rowField = state.rows?.[0];
  const colField = state.columns?.[0];
  const measures = state.measures || [];
  console.log('🔥 Minimal Demo: Row field:', rowField);
  console.log('🔥 Minimal Demo: Column field:', colField);
  console.log('🔥 Minimal Demo: Measures:', measures);
  console.log('🔥 Minimal Demo: State processedData:', state.processedData);
  console.log('🔥 Minimal Demo: State rawData:', state.rawData);
  console.log('🔥 Minimal Demo: State data:', state.data);

  if (!rowField || !colField || measures.length === 0) {
    console.error(
      '🔥 Minimal Demo: Missing configuration - rowField:',
      rowField,
      'colField:',
      colField,
      'measures.length:',
      measures.length
    );
    tableEl.innerHTML = '';
    return;
  }

  const groups = pivot.getGroupedData();
  console.log('🔥 Minimal Demo: Groups data:', groups);
  console.log('🔥 Minimal Demo: Groups data length:', groups.length);
  console.log(
    '🔥 Minimal Demo: Sample group keys:',
    groups.slice(0, 3).map(g => g.key)
  );

  // Try multiple methods to get unique column values (matching web-component logic)
  let uniqueCols = [];

  // Method 1: Try engine's ordered column values
  if (
    pivot.getOrderedColumnValues &&
    typeof pivot.getOrderedColumnValues === 'function'
  ) {
    uniqueCols = pivot.getOrderedColumnValues() || [];
    console.log('🔥 Minimal Demo: Ordered columns from engine:', uniqueCols);
  }

  // Method 2: Extract from grouped data keys
  if (uniqueCols.length === 0) {
    uniqueCols = [
      ...new Set(
        groups.map(g => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[1] || keys[0]; // Use second key as column, fallback to first
        })
      ),
    ].filter(Boolean);
    console.log('🔥 Minimal Demo: Columns from grouped data keys:', uniqueCols);
  }

  // Method 3: Extract directly from engine state data
  if (uniqueCols.length === 0) {
    const engineState = pivot.getState();
    const allData = engineState.rawData || engineState.data || [];
    if (allData.length > 0 && colField) {
      uniqueCols = [
        ...new Set(allData.map(item => item[colField.uniqueName])),
      ].filter(Boolean);
      console.log('🔥 Minimal Demo: Columns from raw data:', uniqueCols);
    }
  }

  // Final fallback: use synthetic "All" if no columns found
  if (uniqueCols.length === 0) {
    uniqueCols = ['All'];
    console.log('🔥 Minimal Demo: Using fallback "All" column');
  }

  console.log('🔥 Minimal Demo: Final unique columns:', uniqueCols);
  console.log('🔥 Minimal Demo: Store colOrder before:', store.colOrder);

  // Reset column order if it doesn't match current columns (e.g., after CSV import)
  if (
    store.colOrder.length === 0 ||
    !store.colOrder.some(c => uniqueCols.includes(c))
  ) {
    console.log(
      '🔥 Minimal Demo: Resetting colOrder because it doesnt match current columns'
    );
    store.colOrder = [...uniqueCols];
  }
  uniqueCols = store.colOrder.filter(c => uniqueCols.includes(c));

  console.log('🔥 Minimal Demo: Store colOrder after:', store.colOrder);
  console.log('🔥 Minimal Demo: Final filtered unique columns:', uniqueCols);

  const processedRows = state.processedData?.rows || [];
  let uniqueRows = [];
  const seen = new Set();
  processedRows.forEach(r => {
    const v = r[0];
    if (!seen.has(v)) {
      seen.add(v);
      uniqueRows.push(v);
    }
  });

  // Reset row order if it doesn't match current rows (e.g., after CSV import)
  if (
    store.rowOrder.length > 0 &&
    !store.rowOrder.some(r => uniqueRows.includes(r))
  ) {
    console.log(
      '🔥 Minimal Demo: Resetting rowOrder because it doesnt match current rows'
    );
    store.rowOrder = [];
  }

  if (store.rowOrder.length)
    uniqueRows = store.rowOrder.filter(v => uniqueRows.includes(v));

  // Build header with grouped category columns and measure sub-columns (no stacked cells)
  console.log(
    '🔥 Minimal Demo: Building table headers for columns:',
    uniqueCols
  );
  console.log(
    '🔥 Minimal Demo: Each column will have colspan:',
    measures.length
  );
  let html = '<thead>';
  html += `<tr class="groups"><th class="draggable" data-drag="row-header">${rowField.caption} / ${colField.caption}</th>`;
  uniqueCols.forEach((c, i) => {
    console.log(`🔥 Minimal Demo: Adding column header: ${c} (index: ${i})`);
    html += `<th class="draggable" draggable="true" data-type="col" data-index="${i}" colspan="${measures.length}">${c}</th>`;
  });
  html += '</tr>';

  // Second header row: row field + each measure repeated per category
  const rowSortClass =
    store.sort.field === rowField.uniqueName ? ` sorted-${store.sort.dir}` : '';
  html += `<tr class="measures"><th class="sortable${rowSortClass}" data-sort-field="${rowField.uniqueName}">${rowField.caption}</th>`;
  uniqueCols.forEach(c => {
    measures.forEach(m => {
      const mSortClass =
        store.sort.field === m.uniqueName ? ` sorted-${store.sort.dir}` : '';
      html += `<th class="sortable${mSortClass}" data-sort-field="${m.uniqueName}" data-column-value="${c}" data-measure-unique="${m.uniqueName}" data-measure-agg="${m.aggregation}">${m.caption}</th>`;
    });
  });
  html += '</tr></thead><tbody>';

  const { currentPage, pageSize } = pivot.getPagination();
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  // Body rows: one cell per measure per category
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

        // Use engine's formatValue method if available
        let display = '0';
        if (agg !== undefined && agg !== null) {
          if (pivot.formatValue && typeof pivot.formatValue === 'function') {
            display = pivot.formatValue(agg, m.uniqueName);
          } else {
            display =
              typeof agg === 'number' ? agg.toLocaleString() : String(agg);
          }
        }

        const hasData = Number(agg) > 0;

        // Get text alignment from engine if available
        let textAlign = 'right'; // default for measures
        if (
          pivot.getFieldAlignment &&
          typeof pivot.getFieldAlignment === 'function'
        ) {
          textAlign = pivot.getFieldAlignment(m.uniqueName);
        }

        // Make processed cells clickable for drill-down with necessary data attributes
        html += `<td class="${hasData ? 'drill-down-cell' : ''}" style="text-align: ${textAlign};"
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
  const store = getCurrentStore();
  // Use engine-filtered raw data instead of the original dataset
  const rows =
    typeof pivot.getData === 'function'
      ? pivot.getData() || []
      : pivot.getState?.().rawData || [];

  // Filter out synthetic fields added by the engine (like __all__, __all_row__, __all_col__)
  const allKeys = rows.length ? Object.keys(rows[0]) : [];
  const keys = allKeys.filter(key => {
    // Remove synthetic fields that the engine adds for internal processing
    return (
      !key.startsWith('__') &&
      !key.endsWith('__') &&
      !key.includes('_all_') &&
      key !== 'All' &&
      !key.startsWith('synthetic_')
    );
  });

  console.log('🔥 Minimal Demo: All raw data keys:', allKeys);
  console.log('🔥 Minimal Demo: Filtered keys (removing synthetic):', keys);

  if (store.colOrder.length === 0) store.colOrder = [...keys];
  const colOrder = store.colOrder.filter(k => keys.includes(k));

  const sort = store.sort;
  let viewRows = [...rows];
  if (sort.field) {
    viewRows.sort((a, b) => {
      const av = a[sort.field];
      const bv = b[sort.field];
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
      let cellValue = row[k] ?? '';
      // Use engine's formatValue method if available
      if (
        cellValue !== '' &&
        pivot.formatValue &&
        typeof pivot.formatValue === 'function'
      ) {
        cellValue = pivot.formatValue(cellValue, k);
      }

      // Get text alignment from engine if available
      let textAlign = 'left'; // default for raw data
      if (
        pivot.getFieldAlignment &&
        typeof pivot.getFieldAlignment === 'function'
      ) {
        textAlign = pivot.getFieldAlignment(k);
      }

      html += `<td style="text-align: ${textAlign};">${cellValue}</td>`;
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
    // Reset to first page after filter change to avoid empty pages
    try {
      pivot.goToPage(1);
    } catch {}
    try {
      renderFromState(pivot.getState());
    } catch {}
  };

  // Clear filters and reset UI inputs
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

  // Page size change -> use component API; guard and stop propagation
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

  document.getElementById('exportHTML').onclick = () =>
    pivot.exportToHTML?.('pivot-table');
  document.getElementById('exportPDF').onclick = () =>
    pivot.exportToPDF?.('pivot-table');
  document.getElementById('exportExcel').onclick = () =>
    pivot.exportToExcel?.('pivot-table');
  document.getElementById('printTable').onclick = () =>
    pivot.openPrintDialog?.();

  // Format button functionality
  document.getElementById('formatButton').onclick = () => {
    if (pivot.showFormatPopup && typeof pivot.showFormatPopup === 'function') {
      pivot.showFormatPopup();
    } else {
      console.log('Format functionality not available');
    }
  };

  // Import CSV functionality - fully dependent on web-component -> core
  document.getElementById('importCSV').onclick = async () => {
    try {
      console.log(
        '🔥 Minimal Demo: Importing CSV via web-component -> core...'
      );
      const result = await pivot.connectToLocalCSV();
      console.log('🔥 Minimal Demo: CSV import result:', result);
      if (result.success) {
        console.log('CSV imported successfully:', result);
        // Wait a moment for the engine to process the data, then trigger refresh
        setTimeout(() => {
          try {
            const newState = pivot.getState();
            console.log('🔥 Minimal Demo: State after CSV import:', newState);

            // Clear UI state for fresh import
            console.log(
              '🔥 Minimal Demo: Clearing UI state after CSV import...'
            );
            ui.processed.colOrder = [];
            ui.processed.rowOrder = [];
            ui.processed.sort = { field: null, dir: 'asc' };
            ui.raw.colOrder = []; // This will force re-detection of columns, filtering out synthetic fields
            ui.raw.rowOrder = [];
            ui.raw.sort = { field: null, dir: 'asc' };

            // Force refresh of the pivot component to ensure data is processed
            if (pivot.refresh && typeof pivot.refresh === 'function') {
              console.log('🔥 Minimal Demo: Calling pivot.refresh()...');
              pivot.refresh();
            }

            ensureFilterFieldOptions(newState);
            ui.mode = 'processed'; // Ensure we're in processed mode
            renderFromState(newState);

            // Also try to trigger another render after a longer delay
            setTimeout(() => {
              try {
                const finalState = pivot.getState();
                console.log('🔥 Minimal Demo: Final state check:', finalState);
                renderFromState(finalState);
              } catch (e) {
                console.error('Final state check error:', e);
              }
            }, 500);
          } catch (error) {
            console.error('Error refreshing UI after CSV import:', error);
          }
        }, 200);
      } else {
        console.error('CSV import failed:', result.error);
        alert('CSV import failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('CSV import error:', error);
      alert('CSV import error: ' + error.message);
    }
  };

  // Import JSON functionality - fully dependent on web-component -> core
  document.getElementById('importJSON').onclick = async () => {
    try {
      console.log(
        '🔥 Minimal Demo: Importing JSON via web-component -> core...'
      );
      const result = await pivot.connectToLocalJSON();
      if (result.success) {
        console.log('JSON imported successfully:', result);
        // After import, refresh the UI to show new data
        try {
          ensureFilterFieldOptions(pivot.getState());
          renderFromState(pivot.getState());
        } catch (error) {
          console.error('Error refreshing UI after JSON import:', error);
        }
      } else {
        console.error('JSON import failed:', result.error);
        alert('JSON import failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('JSON import error:', error);
      alert('JSON import error: ' + error.message);
    }
  };
}

function wireTableInteractions() {
  // Header sorting
  tableEl.querySelectorAll('th.sortable').forEach(th => {
    th.onclick = () => {
      const field = th.getAttribute('data-sort-field');
      if (ui.mode === 'processed') {
        if (!field) return;
        const store = getCurrentStore();
        const nextDir =
          store.sort.field === field && store.sort.dir === 'asc'
            ? 'desc'
            : 'asc';
        store.sort = { field, dir: nextDir };

        // Determine if sorting the row header or a measure header under a specific column
        let state;
        try {
          state = pivot.getState();
        } catch {
          state = null;
        }
        const groups =
          typeof pivot.getGroupedData === 'function'
            ? pivot.getGroupedData()
            : [];
        const rowFieldName = state?.rows?.[0]?.uniqueName || '';
        const columnValue = th.getAttribute('data-column-value') || '';

        if (rowFieldName && field === rowFieldName) {
          // Alphabetical sort of row labels
          const rowSet = new Set();
          groups.forEach(g => {
            const keys = g.key ? g.key.split('|') : [];
            if (keys[0]) rowSet.add(keys[0]);
          });
          const rows = Array.from(rowSet);
          rows.sort((a, b) =>
            nextDir === 'asc'
              ? String(a).localeCompare(String(b))
              : String(b).localeCompare(String(a))
          );
          store.rowOrder = rows;
        } else if (columnValue) {
          // Sort rows by the selected column's measure aggregate
          const measures = state?.measures || [];
          const measureCfg = measures.find(m => m.uniqueName === field);
          const aggregation =
            measureCfg && measureCfg.aggregation
              ? measureCfg.aggregation
              : 'sum';
          const aggKey = `${aggregation}_${field}`;

          const allRowSet = new Set();
          groups.forEach(g => {
            const keys = g.key ? g.key.split('|') : [];
            if (keys[0]) allRowSet.add(keys[0]);
          });
          const allRows = Array.from(allRowSet);

          const pairs = allRows.map(rv => {
            const grp = groups.find(gr => {
              const keys = gr.key ? gr.key.split('|') : [];
              return keys[0] === rv && keys[1] === columnValue;
            });
            const val = Number((grp?.aggregates || {})[aggKey] ?? 0);
            return { row: rv, val: Number.isFinite(val) ? val : 0 };
          });
          pairs.sort((a, b) =>
            nextDir === 'asc' ? a.val - b.val : b.val - a.val
          );
          store.rowOrder = pairs.map(p => p.row);
        } else {
          // Fallback: clear custom order
          store.rowOrder = [];
        }

        if (pivot.sort) pivot.sort(field, nextDir);
        // Re-render immediately so arrows and order update synchronously
        try {
          renderFromState(pivot.getState());
        } catch {}
      } else {
        const store = getCurrentStore();
        const nextDir =
          store.sort.field === field && store.sort.dir === 'asc'
            ? 'desc'
            : 'asc';
        store.sort = { field, dir: nextDir };
        // Delegate RAW sorting to engine to keep indices in sync
        if (field && pivot.sort) pivot.sort(field, nextDir);
        try {
          renderFromState(pivot.getState());
        } catch {}
      }
    };
  });

  // Measure sorting by clicking labels in stacked cells (processed mode)
  if (ui.mode === 'processed') {
    tableEl.querySelectorAll('.cell-line .label').forEach(el => {
      el.addEventListener('click', () => {
        const field = el.getAttribute('data-sort-field');
        if (!field) return;
        const store = getCurrentStore();
        const nextDir =
          store.sort.field === field && store.sort.dir === 'asc'
            ? 'desc'
            : 'asc';
        store.sort = { field, dir: nextDir };
        if (pivot.sort) pivot.sort(field, nextDir);
        try {
          renderFromState(pivot.getState());
        } catch {}
      });
    });
  }

  // Column drag-and-drop
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
      const store = getCurrentStore();
      const arr = store.colOrder;
      // Swap logic: exchange the two columns
      if (ui.dnd.fromIndex !== toIndex) {
        [arr[ui.dnd.fromIndex], arr[toIndex]] = [
          arr[toIndex],
          arr[ui.dnd.fromIndex],
        ];
      }
      try {
        renderFromState(pivot.getState());
      } catch {}
    });
  });

  // Row drag-and-drop
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
        // If you want to use a web component API for row swap, call it here
        if (typeof pivot.swapRows === 'function') {
          try {
            pivot.swapRows(ui.dnd.fromIndex, toIndex);
          } catch {}
        } else {
          // Fallback: swap in local rowOrder if available
          const store = getCurrentStore();
          if (store.rowOrder.length > 0 && ui.dnd.fromIndex !== toIndex) {
            [store.rowOrder[ui.dnd.fromIndex], store.rowOrder[toIndex]] = [
              store.rowOrder[toIndex],
              store.rowOrder[ui.dnd.fromIndex],
            ];
          }
        }
        try {
          renderFromState(pivot.getState());
        } catch {}
      } else {
        const toIndex = Number(tr.dataset.index);
        const store = getCurrentStore();
        const labels = Array.from(
          tableEl.querySelectorAll('tbody tr td:first-child')
        ).map(td => td.textContent);
        store.rowOrder = labels;
        // Swap logic for processed mode
        if (ui.dnd.fromIndex !== toIndex) {
          [store.rowOrder[ui.dnd.fromIndex], store.rowOrder[toIndex]] = [
            store.rowOrder[toIndex],
            store.rowOrder[ui.dnd.fromIndex],
          ];
        }
        try {
          renderFromState(pivot.getState());
        } catch {}
      }
    });
  });

  // Drill-down: click processed data cell to open modal with underlying records
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

        // Compute aggregation as a safety check
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

// Simple modal renderer for drill-down
function showDrillDownModal({ title, summary, rows }) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,.45)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const panel = document.createElement('div');
  panel.style.background = '#fff';
  panel.style.borderRadius = '10px';
  panel.style.boxShadow = '0 10px 30px rgba(0,0,0,.2)';
  panel.style.padding = '16px';
  panel.style.width = '90%';
  panel.style.maxWidth = '840px';
  panel.style.maxHeight = '80vh';
  panel.style.overflow = 'auto';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '10px';
  const h = document.createElement('div');
  h.style.fontWeight = '700';
  h.textContent = `Details: ${title}`;
  const x = document.createElement('button');
  x.textContent = '×';
  x.style.fontSize = '18px';
  x.style.border = 'none';
  x.style.background = '#ef4444';
  x.style.color = '#fff';
  x.style.width = '28px';
  x.style.height = '28px';
  x.style.borderRadius = '50%';
  x.style.cursor = 'pointer';
  header.appendChild(h);
  header.appendChild(x);

  const sum = document.createElement('div');
  sum.textContent = summary;
  sum.style.background = '#f3f4f6';
  sum.style.padding = '8px';
  sum.style.borderRadius = '6px';
  sum.style.margin = '8px 0';

  const body = document.createElement('div');
  if (rows && rows.length) {
    const headers = Object.keys(rows[0]);
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    headers.forEach(k => {
      const th = document.createElement('th');
      th.textContent = k;
      th.style.border = '1px solid #e5e7eb';
      th.style.padding = '6px 8px';
      th.style.background = '#f9fafb';
      th.style.textAlign = 'left';
      thr.appendChild(th);
    });
    thead.appendChild(thr);
    const tbody = document.createElement('tbody');
    rows.forEach(r => {
      const tr = document.createElement('tr');
      headers.forEach(k => {
        const td = document.createElement('td');
        td.textContent = r[k] != null ? String(r[k]) : '';
        td.style.border = '1px solid #e5e7eb';
        td.style.padding = '6px 8px';
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

// Ensure the component's pagination is synced to the dropdown's initial value once
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
        // One-time sync of initial page size from the dropdown to the component API
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
  const err = e.detail || {};
  console.warn('Pivot error:', err);
});

// Initialize
(function init() {
  wireToolbar();
  try {
    pivot.setViewMode('processed');
  } catch {}
  customElements.whenDefined('pivot-head').then(() => bootstrapInitialRender());
})();
